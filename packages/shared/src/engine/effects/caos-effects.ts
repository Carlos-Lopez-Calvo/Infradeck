/**
 * EFECTOS DE CAOS 🎲
 * Efectos específicos de la clase Caos:
 * - GAIN_ENTROPY
 * - DISCOVER_PAY_ENTROPY
 * - REUSE_RANDOM_PAST_CHAOS_EFFECT
 * - RANDOM_BY_ENTROPY (variante especial de DAMAGE / SUMMON_CREATURE)
 */

import { EffectContext } from './core'
import { EffectActionType, EffectTarget, DiscoverPayEntropyOptions, Ability, CardType } from '../../types/cards'
import { GameState, PlayerState, getCardByIdGlobal, onDiscoverRequest } from '../game-state'
import { BASIC_CARDS } from '../../cards/basic-cards'
import { CLASS_CARDS } from '../../cards/class-cards'
import { isSpecimenCardId } from '../../deck/deck-catalog'
import { notifyEnterBattlefield } from '../priority'
import { checkAndActivateFinalStand, hasFinalStandImmunity } from '../final-stand'
import { notifyLeaveBattlefield, notifyEffectTriggered } from '../priority'
import { applyAction as dispatchAction } from './dispatcher'
import { getRandomHintsForAction } from './board-effects'

// ===== FUNCIONES DE UTILIDAD PARA ENTROPÍA =====

export function consumeEntropy(state: GameState, playerIndex: number, amount: number): boolean {
  const p = state.players[playerIndex]
  if (p.classResource?.type !== 'ENTROPIA') return false
  const current = p.classResource.amount ?? 0
  if (current < amount) return false
  p.classResource.amount = current - amount
  console.log('[ENTROPIA] consumed', { playerIndex, amount, remaining: p.classResource.amount })
  return true
}

export function gainEntropyOnPlay(player: PlayerState) {
  if (player.classResource?.type === 'ENTROPIA') {
    const current = player.classResource.amount ?? 0
    player.classResource.amount = Math.min(10, current + 1)
  }
}

// ===== HANDLERS DE EFECTOS DE CAOS =====

/**
 * GAIN_ENTROPY - Ganar N puntos de entropía
 */
export function handleGainEntropy(ctx: EffectContext): void {
  const { me, playerIndex, action } = ctx
  
  if (me.classResource?.type !== 'ENTROPIA') {
    console.log('[ENTROPIA] GAIN_ENTROPY ignored (no ENTROPIA)', { 
      playerIndex, 
      classType: me.classType 
    })
    return
  }
  
  const amount = action.amount ?? 1
  const before = me.classResource.amount ?? 0
  me.classResource.amount = Math.min(10, before + amount)
  
  console.log('[ENTROPIA] GAIN_ENTROPY', { 
    playerIndex, 
    before, 
    delta: amount, 
    after: me.classResource.amount 
  })
}

/**
 * DISCOVER_PAY_ENTROPY - Modal para elegir versión base o pagando entropía
 */
export function handleDiscoverPayEntropy(ctx: EffectContext): void {
  const { state, playerIndex, me, action, targetHints } = ctx
  
  const options = action.options as DiscoverPayEntropyOptions | undefined
  const baseCost = Number(options?.entropyCost ?? 0)
  const current = me.classResource?.type === 'ENTROPIA' ? (me.classResource.amount ?? 0) : 0
  const canPay = current >= baseCost
  
  console.log('[DISCOVER_PAY_ENTROPY] request', {
    playerIndex,
    entropy: current,
    cost: baseCost,
    canPay,
    base: options?.base,
    buff: options?.buff,
  })
  
  // Pedir elección al jugador (o forzar BUFF si el flag está activo)
  let choice = onDiscoverRequest(state, {
    playerIndex,
    options: [
      { id: 'BASE', label: 'Versión base' },
      { 
        id: 'BUFF', 
        label: canPay 
          ? `Potenciada (-${baseCost} entropía)` 
          : 'Potenciada (sin entropía suficiente)' 
      },
    ],
  })
  
  // Override: forzar BUFF si el flag está activo (usado por Transform)
  if (me.forceDiscoverBuff) {
    choice = 'BUFF'
  }
  
  console.log('[DISCOVER_PAY_ENTROPY] choice returned by UI:', choice)
  
  if (choice === 'BUFF') {
    if (!canPay || !consumeEntropy(state, playerIndex, baseCost)) {
      console.warn('[DISCOVER_PAY_ENTROPY] cannot pay entropy', { 
        current, 
        need: baseCost 
      })
      return
    }
    console.log('[DISCOVER_PAY_ENTROPY] entropy paid', {
      newEntropy: me.classResource?.amount,
      paid: baseCost
    })
    
    // Aplicar efecto potenciado
    if (options?.buff) {
      console.log('[DISCOVER_PAY_ENTROPY] applying BUFF action', options.buff)
      dispatchAction(state, playerIndex, options.buff, targetHints)
    }
  } else {
    // Aplicar efecto base
    if (options?.base) {
      console.log('[DISCOVER_PAY_ENTROPY] applying BASE action', options.base)
      dispatchAction(state, playerIndex, options.base, targetHints)
    }
  }
}

/**
 * Portal Inestable: invoca criatura aleatoria según entropía actual.
 * 3+ → coste ≤3, 6+ → ≤6, 9+ → cualquier criatura del catálogo (sin Espécimen).
 */
export function handleSummonByEntropy(ctx: EffectContext): void {
  const { state, playerIndex, me } = ctx

  if (me.classResource?.type !== 'ENTROPIA') {
    console.warn('[SUMMON_BY_ENTROPY] player has no ENTROPIA resource')
    return
  }

  const entropy = me.classResource.amount ?? 0
  let maxMana = 0
  if (entropy >= 9) maxMana = 99
  else if (entropy >= 6) maxMana = 6
  else if (entropy >= 3) maxMana = 3
  else {
    console.log('[SUMMON_BY_ENTROPY] insufficient entropy', { entropy, need: 3 })
    return
  }

  const pool = [...BASIC_CARDS, ...CLASS_CARDS]
    .filter((c) => c.type === CardType.CREATURE && !isSpecimenCardId(c.id))
    .filter((c) => (c.mana ?? 0) <= maxMana)

  if (!pool.length) {
    console.warn('[SUMMON_BY_ENTROPY] empty creature pool', { maxMana })
    return
  }

  const ref = pool[Math.floor(Math.random() * pool.length)]
  const refCard = getCardByIdGlobal(ref.id)
  const hasPrisa = refCard?.abilities?.includes(Ability.PRISA) ?? false
  const hasImpaciente = refCard?.abilities?.includes(Ability.IMPACIENTE) ?? false

  const entity = {
    id: `creature-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    cardId: ref.id,
    ownerId: me.id,
    attack: refCard?.attack ?? 0,
    health: refCard?.health ?? 1,
    exhausted: !(hasPrisa || hasImpaciente),
    abilities: refCard?.abilities ? refCard.abilities.map((a) => String(a)) : [],
    effects: [],
  }

  me.board.push(entity)
  notifyEnterBattlefield(state, playerIndex, entity.id)
  console.log('[SUMMON_BY_ENTROPY] summoned', {
    cardId: ref.id,
    entropy,
    maxMana,
  })
}

/**
 * RANDOM_BY_ENTROPY - Daño aleatorio: dispara N veces (N = entropía) 
 * contra objetivos completamente aleatorios (héroes y criaturas de ambos lados)
 */
export function handleRandomByEntropy(ctx: EffectContext): void {
  const { state, playerIndex, oppIndex, me, opp, action } = ctx
  
  if (me.classResource?.type !== 'ENTROPIA') {
    console.warn('[RANDOM_BY_ENTROPY] player has no ENTROPIA resource')
    return
  }
  
  const damage = action.amount ?? 1
  let shots = Math.min(10, me.classResource.amount ?? 0)
  
  console.log('[RANDOM_BY_ENTROPY] start', { shots, damage })
  
  while (shots-- > 0 && consumeEntropy(state, playerIndex, 1)) {
    // Pool de TODOS los objetivos posibles (héroes y criaturas de ambos jugadores)
    const pool: Array<{ kind: 'HERO' | 'CREATURE'; pi: number; bi?: number }> = [
      { kind: 'HERO', pi: playerIndex },
      { kind: 'HERO', pi: oppIndex }
    ]
    me.board.forEach((_, i) => pool.push({ kind: 'CREATURE', pi: playerIndex, bi: i }))
    opp.board.forEach((_, i) => pool.push({ kind: 'CREATURE', pi: oppIndex, bi: i }))
    
    if (!pool.length) break
    
    // Elegir objetivo aleatorio
    const pick = pool[Math.floor(Math.random() * pool.length)]
    
    if (pick.kind === 'HERO') {
      if (!hasFinalStandImmunity(state, pick.pi)) {
        const tgt = state.players[pick.pi]
        const old = tgt.life
        tgt.life = Math.max(0, tgt.life - damage)
        console.log('[RANDOM_BY_ENTROPY] hit hero', { 
          playerIndex: pick.pi, 
          damage, 
          life: `${old} → ${tgt.life}` 
        })
        
        if (tgt.life <= 0 && old > 0) {
          checkAndActivateFinalStand(state, pick.pi, playerIndex)
        }
      }
    } else if (pick.kind === 'CREATURE' && pick.bi != null) {
      const owner = state.players[pick.pi]
      const cr = owner.board[pick.bi]
      if (cr) {
        cr.health -= damage
        cr.damagedThisTurn = true
        console.log('[RANDOM_BY_ENTROPY] hit creature', { 
          playerIndex: pick.pi, 
          index: pick.bi,
          cardId: cr.cardId,
          health: cr.health 
        })
        
        if (cr.health <= 0) {
          const [dead] = owner.board.splice(pick.bi, 1)
          owner.graveyard.unshift(dead.cardId)
          notifyLeaveBattlefield(state, pick.pi, dead.id)
          notifyEffectTriggered(state, pick.pi, dead.cardId, 'ON_DEATH')
        }
      }
    }
  }
  
  console.log('[RANDOM_BY_ENTROPY] done', { 
    remainingEntropy: me.classResource.amount 
  })
}

/**
 * REPEAT_N - Variante de daño que repite N veces contra enemigos aleatorios
 * Usado por algunas cartas de Vitalidad también
 */
export function handleRepeatNDamage(ctx: EffectContext): void {
  const { state, playerIndex, oppIndex, opp, action } = ctx
  
  // Extraer N del value (formato: "REPEAT_N:3")
  const val = String(action.value ?? '')
  if (!val.startsWith('REPEAT_N:')) {
    console.warn('[REPEAT_N] invalid value format', val)
    return
  }
  
  const n = Math.max(0, parseInt(val.split(':')[1] ?? '0', 10) || 0)
  const damage = action.amount ?? 0
  
  console.log('[REPEAT_N] start', { n, damage })
  
  for (let k = 0; k < n; k++) {
    // Pool: héroe enemigo + todas las criaturas enemigas
    const pool: Array<{ kind: 'HERO' | 'CREATURE'; index?: number }> = [{ kind: 'HERO' }]
    for (let i = 0; i < opp.board.length; i++) {
      pool.push({ kind: 'CREATURE', index: i })
    }
    
    const pick = pool[Math.floor(Math.random() * pool.length)]
    
    if (pick.kind === 'CREATURE' && pick.index != null && opp.board[pick.index]) {
      const c = opp.board[pick.index]
      c.health -= damage
      c.damagedThisTurn = true
      console.log('[REPEAT_N] hit creature', { iteration: k, index: pick.index, cardId: c.cardId })
      
      if (c.health <= 0) {
        const [dead] = opp.board.splice(pick.index, 1)
        opp.graveyard.unshift(dead.cardId)
        notifyLeaveBattlefield(state, oppIndex, dead.id)
        notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
      }
    } else {
      // Golpear al héroe
      if (!hasFinalStandImmunity(state, oppIndex)) {
        const old = opp.life
        opp.life = Math.max(0, opp.life - damage)
        console.log('[REPEAT_N] hit hero', { iteration: k, damage, life: `${old} → ${opp.life}` })
        
        if (opp.life <= 0 && old > 0) {
          checkAndActivateFinalStand(state, oppIndex, playerIndex)
        }
      }
    }
  }
  
  console.log('[REPEAT_N] done')
}

/**
 * REUSE_RANDOM_PAST_CHAOS_EFFECT - Reutilizar un efecto aleatorio de Caos 
 * que ya se jugó este juego
 */
export function handleReuseRandomPastEffect(ctx: EffectContext): void {
  const { state, playerIndex, me } = ctx
  
  const pool = me.playedChaosEffects ?? []
  
  console.log('[REUSE_PAST_CHAOS] start', { poolSize: pool.length })
  
  if (!pool.length) {
    console.log('[REUSE_PAST_CHAOS] no past effects to reuse')
    return
  }
  
  // Elegir efecto aleatorio
  const pick = pool[Math.floor(Math.random() * pool.length)]
  console.log('[REUSE_PAST_CHAOS] picked effect', { type: pick.type, target: pick.target })
  
  // Aplicar el efecto (necesitamos generar hints aleatorios para el objetivo)
  const hints = getRandomHintsForAction(state, playerIndex, pick)
  dispatchAction(state, playerIndex, pick, hints)
  console.log('[REUSE_PAST_CHAOS] effect applied')
}
