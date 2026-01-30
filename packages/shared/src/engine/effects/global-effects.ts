/**
 * EFECTOS GLOBALES
 * Efectos básicos usados por todas las clases:
 * - DAMAGE, HEAL
 * - DRAW_CARDS, DISCARD_CARDS, SCRY
 * - SUMMON_CREATURE
 * - BUFF_ATTACK, BUFF_HEALTH, BUFF_STATS
 * - GAIN_ABILITY, LOSE_ABILITY
 * - Etc.
 */

import { EffectContext } from './core'
import { EffectActionType, EffectTarget, Ability, CardType } from '../../types/cards'
import { TargetRef, TargetResolved, getCardByIdGlobal, onScryRequest, onAdvancedSelectionRequest } from '../game-state'
import { draw } from '../turns'
import { checkAndActivateFinalStand, hasFinalStandImmunity } from '../final-stand'
import { notifyLeaveBattlefield, notifyEffectTriggered, notifyEnterBattlefield } from '../priority'
import { hasAbility } from '../combat'
import { BASIC_CARDS } from '../../cards/basic-cards'
import { CLASS_CARDS } from '../../cards/class-cards'

// ===== FUNCIONES AUXILIARES =====

export function resolveSingleTarget(
  state: any,
  playerIndex: number,
  targetType: EffectTarget,
  hint?: TargetRef
): TargetResolved | undefined {
  // Esta función se mantendrá aquí temporalmente
  // En Fase 4 la moveremos a core.ts
  
  const me = state.players[playerIndex]
  const oppIndex = playerIndex === 0 ? 1 : 0
  const opp = state.players[oppIndex]

  // Si hay hint, usarlo directamente
  if (hint) {
    if (hint.type === 'HERO_SELF') return { kind: 'HERO', playerIndex }
    if (hint.type === 'HERO_ENEMY') return { kind: 'HERO', playerIndex: oppIndex }
    if (hint.type === 'CREATURE_SELF')
      return { kind: 'CREATURE', playerIndex, index: hint.index }
    if (hint.type === 'CREATURE_ENEMY')
      return { kind: 'CREATURE', playerIndex: oppIndex, index: hint.index }
    if (hint.type === 'ANY_CREATURE') {
      const ownerIdx = hint.owner === 'SELF' ? playerIndex : oppIndex
      return { kind: 'CREATURE', playerIndex: ownerIdx, index: hint.index }
    }
  }

  // Resolución automática según targetType
  switch (targetType) {
    case EffectTarget.FRIENDLY_HERO:
      return { kind: 'HERO', playerIndex }
    case EffectTarget.ENEMY_HERO:
      return { kind: 'HERO', playerIndex: oppIndex }
    case EffectTarget.ALL_FRIENDLY_CREATURES:
      return { kind: 'MULTI', scope: 'FRIENDLY' }
    case EffectTarget.ALL_ENEMY_CREATURES:
      return { kind: 'MULTI', scope: 'ENEMY' }
    case EffectTarget.ALL_CREATURES:
      return { kind: 'MULTI', scope: 'FRIENDLY' } // TODO: Need to handle both boards
    case EffectTarget.RANDOM_ENEMY:
      if (opp.board.length > 0) {
        const idx = Math.floor(Math.random() * opp.board.length)
        return { kind: 'CREATURE', playerIndex: oppIndex, index: idx }
      }
      return { kind: 'HERO', playerIndex: oppIndex }
    default:
      return undefined
  }
}

// ===== HANDLERS DE EFECTOS GLOBALES =====

export function handleDrawCards(ctx: EffectContext): void {
  const { state, playerIndex, action } = ctx
  const amount = action.amount ?? 1
  
  // Determinar quién roba (puede ser el oponente si hay hint específico)
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  const pIdx = t?.kind === 'HERO' ? t.playerIndex : playerIndex
  
  for (let i = 0; i < Math.abs(amount); i++) {
    if (amount >= 0) {
      draw(state, pIdx, 1)
    } else {
      // Cantidad negativa = descarte de mano
      state.players[pIdx].hand.shift()
    }
  }
}

export function handleDiscardCards(ctx: EffectContext): void {
  const { state, playerIndex, action } = ctx
  const amount = action.amount ?? 1
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  const pIdx = t?.kind === 'HERO' ? t.playerIndex : playerIndex
  
  if (amount > 0) {
    state.players[pIdx].hand.splice(0, Math.min(amount, state.players[pIdx].hand.length))
  } else if (amount < 0) {
    // Cantidad negativa = robar cartas
    draw(state, pIdx, -amount)
  }
}

export function handleHeal(ctx: EffectContext): void {
  const { state, playerIndex, action, me, opp } = ctx
  const amount = action.amount ?? 0
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t) return

  if (t.kind === 'HERO') {
    const tgt = state.players[t.playerIndex]
    tgt.life = Math.min(tgt.maxLife, tgt.life + amount)
  } else if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (cr) cr.health += amount
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? me.board : opp.board
    for (const c of list) {
      c.health += amount
    }
  }
}

export function handleScry(ctx: EffectContext): void {
  const { state, playerIndex, action } = ctx
  const amount = action.amount ?? 1
  const p = state.players[playerIndex]
  
  console.log('[SCRY] start', { amount, deckSize: p.deck.length })
  
  if (p.deck.length === 0) {
    console.log('[SCRY] no cards in deck')
    return
  }
  
  // Obtener las N cartas del tope
  const scryCount = Math.min(amount, p.deck.length)
  const topCards = p.deck.slice(0, scryCount)
  console.log('[SCRY] top cards to reveal', topCards)
  
  // Activar el modal para que el jugador vea las cartas y decida
  const decision = onScryRequest(state, {
    playerIndex,
    cards: topCards
  })
  
  console.log('[SCRY] decision', decision)
  
  // Si la decisión es BOTTOM, mover las cartas al fondo
  if (decision === 'BOTTOM') {
    p.deck.splice(0, scryCount)
    p.deck.push(...topCards)
    console.log('[SCRY] moved to bottom')
  } else {
    console.log('[SCRY] kept at top')
  }
}

export function handleAdvancedSelection(ctx: EffectContext): void {
  const { state, playerIndex, action } = ctx
  const amount = action.amount ?? 3
  const p = state.players[playerIndex]
  
  console.log('[ADVANCED_SELECTION] start', { amount, deckSize: p.deck.length })
  
  if (p.deck.length === 0) {
    console.log('[ADVANCED_SELECTION] no cards in deck')
    return
  }
  
  const selectCount = Math.min(amount, p.deck.length)
  const topCards = p.deck.slice(0, selectCount)
  console.log('[ADVANCED_SELECTION] cards to show', topCards)
  
  // TODO: Advanced selection necesita una interfaz diferente para seleccionar una carta
  // Por ahora, simplemente mostramos las cartas al jugador y tomamos la primera
  onAdvancedSelectionRequest(state, {
    playerIndex,
    cards: topCards
  })
  
  // Temporalmente tomar la primera carta del grupo revelado
  if (topCards.length > 0) {
    const chosenId = topCards[0]
    const chosenIdx = p.deck.indexOf(chosenId)
    if (chosenIdx !== -1) {
      const [chosen] = p.deck.splice(chosenIdx, 1)
      p.hand.push(chosen)
    }
    const rest = topCards.filter(id => id !== chosenId)
    p.deck = p.deck.filter(id => !rest.includes(id))
    p.deck.push(...rest)
    console.log('[ADVANCED_SELECTION] resolved (auto-selected first)', { hand: p.hand.length, deck: p.deck.length })
  }
}

// ===== EFECTOS DE BUFF =====

export function handleBuffAttack(ctx: EffectContext): void {
  const { state, playerIndex, action, me, opp } = ctx
  const amount = action.amount ?? 0
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t) return
  
  if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (cr) cr.attack += amount
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? me.board : opp.board
    for (const c of list) c.attack += amount
  }
}

export function handleBuffHealth(ctx: EffectContext): void {
  const { state, playerIndex, action, me, opp } = ctx
  const amount = action.amount ?? 0
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t) return
  
  if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (cr) cr.health += amount
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? me.board : opp.board
    for (const c of list) c.health += amount
  }
}

export function handleBuffStats(ctx: EffectContext): void {
  const { state, playerIndex, action, me, opp } = ctx
  let addAtk = 0, addHp = 0
  const val = String(action.value ?? '')
  
  console.log('[BUFF_STATS] start', { value: val })
  
  if (val === 'UNIQUE_ABILITIES_IN_GRAVEYARD') {
    const gy = state.players[playerIndex].graveyard
    console.log('[BUFF_STATS][UAG] graveyard ids:', gy)
    const set = new Set<string>()
    for (const cid of gy) {
      const cc = getCardByIdGlobal(cid)
      if (cc && cc.type === CardType.CREATURE && Array.isArray(cc.abilities)) {
        for (const ab of cc.abilities) set.add(String(ab))
      }
    }
    const x = set.size
    console.log('[BUFF_STATS][UAG] uniqueAbilitiesCount:', x, 'abilities:', Array.from(set))
    addAtk = x
    addHp = x
  } else if (val === 'LIFE_DIFFERENTIAL') {
    const x = Math.max(0, (me.maxLife ?? 20) - me.life)
    addAtk = x
    addHp = x
  } else {
    const m = val.match(/^\+?(-?\d+)\/\+?(-?\d+)$/)
    addAtk = m ? parseInt(m[1], 10) : 0
    addHp = m ? parseInt(m[2], 10) : 0
  }
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  console.log('[BUFF_STATS] target resolved:', t, 'add', { atk: addAtk, hp: addHp })
  if (!t) return
  
  if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (cr) {
      const before = { atk: cr.attack, hp: cr.health }
      cr.attack += addAtk
      cr.health += addHp
      console.log('[BUFF_STATS] applied to CREATURE', { 
        before, 
        add: { atk: addAtk, hp: addHp }, 
        after: { atk: cr.attack, hp: cr.health } 
      })
    }
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? me.board : opp.board
    console.log('[BUFF_STATS] applying to MULTI', { scope: t.scope, count: list.length })
    for (const c of list) {
      c.attack += addAtk
      c.health += addHp
    }
  }
}

// ===== EFECTOS DE HABILIDADES =====

export function handleGainAbility(ctx: EffectContext): void {
  const { state, playerIndex, action, me, opp } = ctx
  const val = String(action.value ?? '')
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t) return

  // Especial: heredar TODAS las habilidades únicas de TODOS los cementerios
  if (val === 'INHERIT_FROM_GRAVEYARD') {
    const gather = (pi: number) => {
      const set = new Set<string>()
      for (const cid of state.players[pi].graveyard) {
        const card = getCardByIdGlobal(cid)
        if (card && card.type === CardType.CREATURE && card.abilities) {
          for (const ab of card.abilities) set.add(String(ab))
        }
      }
      return Array.from(set)
    }
    const inherited = Array.from(new Set([...gather(0), ...gather(1)]))

    const applyTo = (c: any) => {
      for (const ab of inherited) {
        if (!c.abilities.includes(String(ab))) c.abilities.push(String(ab))
      }
    }

    if (t.kind === 'CREATURE') {
      const owner = state.players[t.playerIndex]
      const cr = owner.board[t.index]
      if (cr) applyTo(cr)
    } else if (t.kind === 'MULTI') {
      const list = t.scope === 'FRIENDLY' ? me.board : opp.board
      for (const c of list) applyTo(c)
    }
    return
  }

  // Comportamiento normal: añadir una habilidad concreta
  const abil = val as Ability
  if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (cr && !cr.abilities.includes(String(abil))) {
      cr.abilities.push(String(abil))
      if (abil === Ability.PRISA) cr.exhausted = false
    }
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? me.board : opp.board
    for (const c of list) {
      if (!c.abilities.includes(String(abil))) c.abilities.push(String(abil))
      if (abil === Ability.PRISA) c.exhausted = false
    }
  }
}

export function handleLoseAbility(ctx: EffectContext): void {
  const { state, playerIndex, action, me, opp } = ctx
  const abil = action.value as Ability
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t) return
  
  if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (cr) cr.abilities = cr.abilities.filter(a => a !== String(abil))
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? me.board : opp.board
    for (const c of list) c.abilities = c.abilities.filter(a => a !== String(abil))
  }
}

export function handleGrantTempDrawOnKill(ctx: EffectContext): void {
  const { state, playerIndex, action } = ctx
  const amount = action.amount ?? 1
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t) return
  
  console.log('[GRANT_TEMP_DRAW_ON_KILL] start', { amount })
  
  if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (cr) {
      cr.tempDrawOnKill = (cr.tempDrawOnKill ?? 0) + amount
      console.log('[GRANT_TEMP_DRAW_ON_KILL] applied', { 
        creature: cr.cardId, 
        tempDrawOnKill: cr.tempDrawOnKill 
      })
    }
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? ctx.me.board : ctx.opp.board
    for (const c of list) {
      c.tempDrawOnKill = (c.tempDrawOnKill ?? 0) + amount
    }
    console.log('[GRANT_TEMP_DRAW_ON_KILL] applied to MULTI', { 
      scope: t.scope, 
      count: list.length 
    })
  }
}

// ===== EFECTOS DE DAÑO =====

export function handleDamage(ctx: EffectContext): void {
  const { state, playerIndex, oppIndex, me, opp, action } = ctx
  
  // Caso especial: SUM_FRIENDLY_ATTACK
  if (String(action.value) === 'SUM_FRIENDLY_ATTACK') {
    const sum = (me.board ?? []).reduce((s, c) => s + Math.max(0, c.attack ?? 0), 0)
    const targetPi = action.target === EffectTarget.ENEMY_HERO ? oppIndex : playerIndex
    if (!hasFinalStandImmunity(state, targetPi)) {
      const tgt = state.players[targetPi]
      const old = tgt.life
      tgt.life = Math.max(0, tgt.life - sum)
      if (tgt.life <= 0 && old > 0) checkAndActivateFinalStand(state, targetPi, playerIndex)
    }
    return
  }
  
  // Casos especiales de CAOS: RANDOM_BY_ENTROPY y REPEAT_N
  // Los manejaremos en caos-effects.ts (Fase 3.2)
  if (String(action.value) === 'RANDOM_BY_ENTROPY') {
    console.warn('[DAMAGE] RANDOM_BY_ENTROPY debe ser manejado por caos-effects.ts')
    return
  }
  if (typeof action.value === 'string' && action.value.startsWith('REPEAT_N:')) {
    console.warn('[DAMAGE] REPEAT_N debe ser manejado por caos-effects.ts o vitalidad-effects.ts')
    return
  }

  const amount = action.amount ?? 0

  // ALL_CREATURES (ambos tableros)
  if (action.target === EffectTarget.ALL_CREATURES) {
    const doBoard = (ownerIdx: number) => {
      const owner = state.players[ownerIdx]
      for (const c of owner.board) {
        c.health -= amount
        c.damagedThisTurn = true
      }
      const kept: typeof owner.board = []
      for (const c of owner.board) {
        if (c.health > 0) {
          kept.push(c)
        } else {
          owner.graveyard.unshift(c.cardId)
          notifyLeaveBattlefield(state, ownerIdx, c.id)
          notifyEffectTriggered(state, ownerIdx, c.cardId, 'ON_DEATH')
        }
      }
      owner.board = kept
    }
    doBoard(playerIndex)
    doBoard(oppIndex)
    return
  }

  // RANDOM_CHARACTER (cualquier héroe o criatura)
  if (action.target === EffectTarget.RANDOM_CHARACTER) {
    const pool: Array<{ type: 'HERO' | 'CREATURE'; pi: number; bi?: number }> = [
      { type: 'HERO', pi: playerIndex },
      { type: 'HERO', pi: oppIndex }
    ]
    me.board.forEach((_, i) => pool.push({ type: 'CREATURE', pi: playerIndex, bi: i }))
    opp.board.forEach((_, i) => pool.push({ type: 'CREATURE', pi: oppIndex, bi: i }))
    
    if (pool.length) {
      const pick = pool[Math.floor(Math.random() * pool.length)]
      if (pick.type === 'HERO') {
        const tgt = state.players[pick.pi]
        if (!hasFinalStandImmunity(state, pick.pi)) {
          const old = tgt.life
          tgt.life = Math.max(0, tgt.life - amount)
          if (tgt.life <= 0 && old > 0) checkAndActivateFinalStand(state, pick.pi, playerIndex)
        }
      } else if (pick.bi != null) {
        const owner = state.players[pick.pi]
        const cr = owner.board[pick.bi]
        if (cr) {
          cr.health -= amount
          cr.damagedThisTurn = true
          if (cr.health <= 0) {
            const [dead] = owner.board.splice(pick.bi, 1)
            owner.graveyard.unshift(dead.cardId)
            notifyLeaveBattlefield(state, pick.pi, dead.id)
            notifyEffectTriggered(state, pick.pi, dead.cardId, 'ON_DEATH')
          }
        }
      }
    }
    return
  }

  // Resto: usa target explícito (HERO / CREATURE / MULTI / RANDOM_ENEMY)
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t) return

  if (t.kind === 'HERO') {
    const tgt = state.players[t.playerIndex]
    if (!hasFinalStandImmunity(state, t.playerIndex)) {
      const old = tgt.life
      tgt.life = Math.max(0, tgt.life - amount)
      if (tgt.life <= 0 && old > 0) {
        checkAndActivateFinalStand(state, t.playerIndex, playerIndex)
      }
    }
  } else if (t.kind === 'CREATURE') {
    const owner = state.players[t.playerIndex]
    const cr = owner.board[t.index]
    if (!cr) return
    cr.health -= amount
    cr.damagedThisTurn = true
    if (cr.health <= 0) {
      const [dead] = owner.board.splice(t.index, 1)
      owner.graveyard.unshift(dead.cardId)
      notifyLeaveBattlefield(state, t.playerIndex, dead.id)
      notifyEffectTriggered(state, t.playerIndex, dead.cardId, 'ON_DEATH')
    }
  } else if (t.kind === 'MULTI') {
    const list = t.scope === 'FRIENDLY' ? me.board : opp.board
    for (const c of list) {
      c.health -= amount
      c.damagedThisTurn = true
    }
    const ownerIdx = t.scope === 'FRIENDLY' ? playerIndex : oppIndex
    const owner = state.players[ownerIdx]
    const kept: typeof owner.board = []
    for (const c of owner.board) {
      if (c.health > 0) {
        kept.push(c)
      } else {
        owner.graveyard.unshift(c.cardId)
        notifyLeaveBattlefield(state, ownerIdx, c.id)
        notifyEffectTriggered(state, ownerIdx, c.cardId, 'ON_DEATH')
      }
    }
    owner.board = kept
  } else if (t.kind === 'RANDOM_ENEMY') {
    if (opp.board.length > 0) {
      const idx = Math.floor(Math.random() * opp.board.length)
      opp.board[idx].health -= amount
      opp.board[idx].damagedThisTurn = true
      if (opp.board[idx].health <= 0) {
        const [dead] = opp.board.splice(idx, 1)
        opp.graveyard.unshift(dead.cardId)
        notifyLeaveBattlefield(state, oppIndex, dead.id)
        notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
      }
    } else {
      if (!hasFinalStandImmunity(state, oppIndex)) {
        const old = opp.life
        opp.life = Math.max(0, opp.life - amount)
        if (opp.life <= 0 && old > 0) {
          checkAndActivateFinalStand(state, oppIndex, playerIndex)
        }
      }
    }
  }
}

export function handleDamageAdjacent(ctx: EffectContext): void {
  const { state, playerIndex, action } = ctx
  const mainDamage = action.amount ?? 0
  const adjacentDamage = Number(action.value) ?? 0
  
  console.log('[DAMAGE_ADJACENT] start', { mainDamage, adjacentDamage })
  
  // Resolver objetivo principal
  const resolved = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!resolved || resolved.kind !== 'CREATURE') {
    console.log('[DAMAGE_ADJACENT] no valid target')
    return
  }
  
  const ownerIdx = resolved.playerIndex
  const owner = state.players[ownerIdx]
  const mainIndex = resolved.index
  const mainCr = owner.board[mainIndex]
  
  if (!mainCr) {
    console.log('[DAMAGE_ADJACENT] main creature not found')
    return
  }
  
  console.log('[DAMAGE_ADJACENT] main target', { mainIndex, cardId: mainCr.cardId })
  
  // Daño a la criatura principal
  mainCr.health -= mainDamage
  mainCr.damagedThisTurn = true
  
  // Daño a adyacentes
  const leftIndex = mainIndex - 1
  const rightIndex = mainIndex + 1
  
  if (leftIndex >= 0 && owner.board[leftIndex]) {
    console.log('[DAMAGE_ADJACENT] hitting left adjacent', leftIndex)
    owner.board[leftIndex].health -= adjacentDamage
    owner.board[leftIndex].damagedThisTurn = true
  }
  
  if (rightIndex < owner.board.length && owner.board[rightIndex]) {
    console.log('[DAMAGE_ADJACENT] hitting right adjacent', rightIndex)
    owner.board[rightIndex].health -= adjacentDamage
    owner.board[rightIndex].damagedThisTurn = true
  }
  
  // Limpiar criaturas muertas
  const kept: typeof owner.board = []
  for (const c of owner.board) {
    if (c.health > 0) {
      kept.push(c)
    } else {
      owner.graveyard.unshift(c.cardId)
      notifyLeaveBattlefield(state, ownerIdx, c.id)
      notifyEffectTriggered(state, ownerIdx, c.cardId, 'ON_DEATH')
    }
  }
  owner.board = kept
  
  console.log('[DAMAGE_ADJACENT] done', { remainingBoard: owner.board.length })
}

export function handleDamageAndDrawIfKill(ctx: EffectContext): void {
  const { state, playerIndex, action } = ctx
  const damage = action.amount ?? 0
  
  const t = resolveSingleTarget(state, playerIndex, action.target, ctx.targetHints?.[0])
  if (!t || t.kind !== 'CREATURE') return
  
  const owner = state.players[t.playerIndex]
  const cr = owner.board[t.index]
  if (!cr) return
  
  const willDie = cr.health <= damage
  
  cr.health -= damage
  cr.damagedThisTurn = true
  
  if (cr.health <= 0) {
    const [dead] = owner.board.splice(t.index, 1)
    owner.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, t.playerIndex, dead.id)
    notifyEffectTriggered(state, t.playerIndex, dead.cardId, 'ON_DEATH')
    
    // Si mató, robar carta
    if (willDie) {
      draw(state, playerIndex, 1)
    }
  }
}

// ===== EFECTOS DE INVOCACIÓN =====

function isCreatureCard(c: any): boolean {
  return c && c.type === CardType.CREATURE
}

export function handleSummonCreature(ctx: EffectContext): void {
  const { state, playerIndex, me, action } = ctx
  const val = String(action.value ?? '')

  // Caso especial: invocación aleatoria por coste exacto → 'RANDOM_COST:X'
  if (val.startsWith('RANDOM_COST:')) {
    const n = Math.max(0, parseInt(val.split(':')[1] ?? '0', 10) || 0)
    const pool = [...BASIC_CARDS, ...CLASS_CARDS]
      .filter(isCreatureCard)
      .filter(c => (c.mana ?? 0) === n)

    if (!pool.length) return
    const ref = pool[Math.floor(Math.random() * pool.length)]
    const refCard = getCardByIdGlobal(ref.id)
    
    const entity: any = {
      id: `creature-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      cardId: ref.id,
      ownerId: me.id,
      attack: refCard?.attack ?? 0,
      health: refCard?.health ?? 1,
      exhausted: !(refCard?.abilities?.includes(Ability.PRISA)),
      abilities: refCard?.abilities ? refCard.abilities.map(a => String(a)) : [],
      effects: [],
    }
    me.board.push(entity)
    notifyEnterBattlefield(state, playerIndex, entity.id)
    return
  }

  // Caso normal: invocar por ID específico
  const ref = getCardByIdGlobal(val)
  if (!ref) {
    console.warn('[SUMMON_CREATURE] cardId not found in catalog:', val)
    return
  }
  const entity: any = {
    id: `creature-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    cardId: ref.id,
    ownerId: me.id,
    attack: ref.attack ?? 0,
    health: ref.health ?? 1,
    exhausted: !(ref.abilities?.includes(Ability.PRISA)),
    abilities: ref.abilities ? ref.abilities.map(a => String(a)) : [],
    effects: [],
  }
  me.board.push(entity)
  notifyEnterBattlefield(state, playerIndex, entity.id)
}
