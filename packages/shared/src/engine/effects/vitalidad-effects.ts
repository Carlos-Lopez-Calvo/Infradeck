/**
 * EFECTOS DE VITALIDAD ❤️
 * Efectos específicos de la clase Vitalidad:
 * - DISCOVER_PAY_LIFE
 * - BOARD_NUKE_AND_ABSORB
 * - DESTROY_TOP_HEALTH_CREATURES
 * - REDUCE_CARD_COST
 * - ATTACK_SPELL
 */

import { EffectContext } from './core'
import { EffectActionType, DiscoverPayLifeOptions } from '../../types/cards'
import { onDiscoverRequest } from '../game-state'
import { notifyLeaveBattlefield, notifyEffectTriggered } from '../priority'
import { declareAttackCreature } from '../combat'
import { applyAction as dispatchAction } from './dispatcher'

// ===== HANDLERS DE EFECTOS DE VITALIDAD =====

/**
 * DISCOVER_PAY_LIFE - Modal para elegir versión base o pagando vida
 */
export function handleDiscoverPayLife(ctx: EffectContext): void {
  const { state, playerIndex, me, action, targetHints } = ctx
  
  const options = action.options as DiscoverPayLifeOptions | undefined
  const baseCost = Number(options?.lifeCost ?? 0)
  const available = me.lifeCredit != null ? me.lifeCredit : me.life
  
  console.log('[DISCOVER_PAY_LIFE] options:', options)
  console.log('[DISCOVER_PAY_LIFE] available life/credit:', { 
    life: me.life, 
    credit: me.lifeCredit,
    cost: baseCost
  })
  
  // Pedir elección al jugador
  let choice = onDiscoverRequest(state, {
    playerIndex,
    options: [
      { id: 'BASE', label: 'Versión base' },
      { 
        id: 'BUFF', 
        label: baseCost > 0 
          ? `Potenciada (-${baseCost} vida)` 
          : 'Potenciada' 
      },
    ],
  })
  
  console.log('[DISCOVER_PAY_LIFE] choice:', choice)
  
  // Si eligió BUFF y hay coste, pagar
  if (choice === 'BUFF' && baseCost > 0) {
    if (available < baseCost) {
      console.warn('[DISCOVER_PAY_LIFE] insufficient life', { available, cost: baseCost })
      return
    }
    
    console.log('[DISCOVER_PAY_LIFE] paying life:', baseCost)
    if (me.lifeCredit != null) {
      me.lifeCredit = Math.max(0, me.lifeCredit - baseCost)
    } else {
      me.life -= baseCost
    }
  }
  
  // Aplicar efecto correspondiente
  if (choice === 'BUFF' && options?.buff) {
    console.log('[DISCOVER_PAY_LIFE] applying BUFF ->', options.buff)
    dispatchAction(state, playerIndex, options.buff, targetHints)
  } else if (options?.base) {
    console.log('[DISCOVER_PAY_LIFE] applying BASE ->', options.base)
    dispatchAction(state, playerIndex, options.base, targetHints)
  }
}

/**
 * REDUCE_CARD_COST - Reduce el coste de las próximas N cartas jugadas
 * Escala con entropía si el jugador es CAOS
 */
export function handleReduceCardCost(ctx: EffectContext): void {
  const { me, action } = ctx
  
  const entropy = me.classResource?.type === 'ENTROPIA' ? (me.classResource.amount ?? 0) : 0
  const amount = Math.abs(action.amount ?? 0) || 0
  
  if (amount === 0) {
    console.warn('[REDUCE_CARD_COST] no amount specified')
    return
  }
  
  let remaining: number | 'ALL' = 0
  
  // Si hay configuración de thresholds personalizada, usarla
  const cfg = (action.options && (action.options as any).thresholds) as 
    Array<{ min: number, uses: number | 'ALL' }> | undefined
  
  if (cfg && cfg.length) {
    const hit = [...cfg]
      .sort((a, b) => a.min - b.min)
      .filter(t => entropy >= t.min)
      .pop()
    remaining = hit ? hit.uses : 0
  } else {
    // Default: escalar con entropía (para cartas de CAOS)
    if (entropy >= 8) remaining = 'ALL'
    else if (entropy >= 4) remaining = 2
    else if (entropy >= 2) remaining = 1
    else remaining = 0
  }
  
  if (remaining === 0) {
    console.log('[REDUCE_CARD_COST] no uses (insufficient entropy/threshold)', { entropy })
    return
  }
  
  me.cardCostReduction = { amount, remaining }
  me.cardCostReductionSkipOnce = true // No consumir en la carta que activó esto
  
  console.log('[REDUCE_CARD_COST] activated', {
    amount,
    remaining,
    entropy
  })
}

/**
 * ATTACK_SPELL - Hechizo que hace atacar a una criatura aliada a una enemiga
 */
export function handleAttackSpell(ctx: EffectContext): void {
  const { state, playerIndex, me, opp, targetHints } = ctx
  
  console.log('[ATTACK_SPELL] start', { targetsHints: targetHints })
  
  // Buscar hint del atacante (CREATURE_SELF) y defensor (CREATURE_ENEMY)
  const hintAtk = targetHints?.find(h => h.type === 'CREATURE_SELF') as any
  const hintDef = targetHints?.find(h => h.type === 'CREATURE_ENEMY') as any
  
  console.log('[ATTACK_SPELL] resolved hints', { hintAtk, hintDef })
  
  if (!hintAtk || !hintDef) {
    console.warn('[ATTACK_SPELL] missing targets', { 
      hasAttacker: !!hintAtk, 
      hasDefender: !!hintDef 
    })
    return
  }
  
  const attacker = me.board[hintAtk.index]
  const defender = opp.board[hintDef.index]
  
  if (!attacker) {
    console.warn('[ATTACK_SPELL] attacker not found at index', hintAtk.index)
    return
  }
  if (!defender) {
    console.warn('[ATTACK_SPELL] defender not found at index', hintDef.index)
    return
  }
  
  console.log('[ATTACK_SPELL] executing attack', { 
    attackerIndex: playerIndex, 
    attackerBoardIndex: hintAtk.index,
    attackerStats: `${attacker.attack}/${attacker.health}`,
    defenderBoardIndex: hintDef.index,
    defenderStats: `${defender.attack}/${defender.health}`
  })
  
  // Ejecutar el ataque usando el sistema de combate
  declareAttackCreature(state, playerIndex, hintAtk.index, hintDef.index)
  console.log('[ATTACK_SPELL] attack completed')
}

/**
 * BOARD_NUKE_AND_ABSORB - Avatar del Crepúsculo: 
 * Destruye TODAS las criaturas excepto a sí mismo y absorbe sus stats
 */
export function handleBoardNukeAndAbsorb(ctx: EffectContext): void {
  const { state, playerIndex, oppIndex, me, opp } = ctx
  
  console.log('[BOARD_NUKE] start', { 
    friendlyBoard: me.board.length, 
    enemyBoard: opp.board.length 
  })
  
  // El Avatar acaba de entrar, está al final de la mesa
  const avatarIndex = me.board.length - 1
  let totalAtk = 0
  let totalHp = 0
  
  // Procesar tablero aliado
  const friendlySurvivors: typeof me.board = []
  for (let i = 0; i < me.board.length; i++) {
    const ent = me.board[i]
    const isAvatar = (i === avatarIndex)
    
    if (isAvatar) {
      friendlySurvivors.push(ent)
      continue
    }
    
    // Absorber stats
    totalAtk += Math.max(0, ent.attack ?? 0)
    totalHp += Math.max(0, ent.health ?? 0)
    
    // Destruir
    me.graveyard.unshift(ent.cardId)
    notifyLeaveBattlefield(state, playerIndex, ent.id)
    notifyEffectTriggered(state, playerIndex, ent.cardId, 'ON_DEATH')
    
    console.log('[BOARD_NUKE] destroyed friendly', { cardId: ent.cardId, stats: `${ent.attack}/${ent.health}` })
  }
  me.board = friendlySurvivors
  
  // Procesar tablero enemigo
  for (const ent of opp.board) {
    totalAtk += Math.max(0, ent.attack ?? 0)
    totalHp += Math.max(0, ent.health ?? 0)
    
    opp.graveyard.unshift(ent.cardId)
    notifyLeaveBattlefield(state, oppIndex, ent.id)
    notifyEffectTriggered(state, oppIndex, ent.cardId, 'ON_DEATH')
    
    console.log('[BOARD_NUKE] destroyed enemy', { cardId: ent.cardId, stats: `${ent.attack}/${ent.health}` })
  }
  opp.board = []
  
  // Aplicar stats al Avatar
  const avatar = me.board[Math.min(avatarIndex, me.board.length - 1)]
  if (avatar) {
    avatar.attack = totalAtk
    avatar.health = Math.max(1, totalHp) // Mínimo 1 HP
    console.log('[BOARD_NUKE] avatar absorbed stats', { 
      totalAtk, 
      totalHp,
      finalStats: `${avatar.attack}/${avatar.health}` 
    })
  }
  
  console.log('[BOARD_NUKE] done')
}

/**
 * DESTROY_TOP_HEALTH_CREATURES - Destruir las N criaturas enemigas con más vida
 */
export function handleDestroyTopHealthCreatures(ctx: EffectContext): void {
  const { state, oppIndex, opp, action } = ctx
  
  const count = action.amount ?? 3
  
  console.log('[DESTROY_TOP_HEALTH] start', { count, oppBoardSize: opp.board.length })
  
  if (opp.board.length === 0) {
    console.log('[DESTROY_TOP_HEALTH] no enemy creatures')
    return
  }
  
  // Ordenar criaturas por vida (mayor a menor)
  const sorted = opp.board
    .map((creature, index) => ({ creature, index }))
    .sort((a, b) => b.creature.health - a.creature.health)
  
  console.log('[DESTROY_TOP_HEALTH] sorted creatures', 
    sorted.map(({ creature, index }) => ({ 
      index, 
      cardId: creature.cardId, 
      health: creature.health 
    }))
  )
  
  // Tomar las primeras N (las de más vida)
  const toDestroy = sorted.slice(0, Math.min(count, sorted.length))
  
  console.log('[DESTROY_TOP_HEALTH] destroying', 
    toDestroy.map(({ creature, index }) => ({ 
      index, 
      cardId: creature.cardId, 
      health: creature.health 
    }))
  )
  
  // Eliminar en orden inverso de índice para no desplazar
  const indicesToRemove = toDestroy.map(item => item.index).sort((a, b) => b - a)
  
  for (const idx of indicesToRemove) {
    const [dead] = opp.board.splice(idx, 1)
    opp.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, oppIndex, dead.id)
    notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
    console.log('[DESTROY_TOP_HEALTH] removed', { idx, cardId: dead.cardId })
  }
  
  console.log('[DESTROY_TOP_HEALTH] final board size', opp.board.length)
}
