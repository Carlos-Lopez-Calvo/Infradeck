/**
 * CORE - Lógica central de efectos
 * Tipos, interfaces y funciones compartidas por todos los efectos
 */

import { GameState, PlayerState, CreatureOnBoard, TargetRef } from '../game-state'
import { EffectAction, EffectActionType, EffectTarget, EffectTiming } from '../../types/cards'
import { getOpponentPlayerIndex } from '../turns'

// ===== INTERFACES =====

export interface EffectContext {
  state: GameState
  playerIndex: number
  oppIndex: number
  me: PlayerState
  opp: PlayerState
  action: EffectAction
  targetHints?: TargetRef[]
}

export type EffectHandler = (ctx: EffectContext) => void

// ===== CONDICIONES DE EFECTOS =====

export function effectConditionPasses(state: GameState, playerIndex: number, eff: any): boolean {
  if (!eff.condition) return true
  const p = state.players[playerIndex]
  const c = eff.condition
  
  if (c.type === 'CLASS_RESOURCE') {
    const cr = p.classResource
    if (!cr) return false
    const want = c.value
    if (typeof want === 'number' && 'amount' in cr) {
      if (c.comparison === 'EQUAL') return (cr.amount ?? 0) === want
      if (c.comparison === 'GREATER_EQUAL') return (cr.amount ?? 0) >= want
    }
    if (typeof want === 'string' && 'state' in cr) {
      return cr.state === want
    }
    return false
  }
  
  if (c.type === 'HEALTH_THRESHOLD') {
    if (c.comparison === 'LESS_EQUAL') return p.life <= c.value
    if (c.comparison === 'EQUAL') return p.life === c.value
    if (c.comparison === 'GREATER_EQUAL') return p.life >= c.value
    return false
  }
  
  if (c.type === 'HAND_SIZE') {
    if (c.comparison === 'LESS_EQUAL') return p.hand.length <= c.value
    if (c.comparison === 'EQUAL') return p.hand.length === c.value
    if (c.comparison === 'GREATER_EQUAL') return p.hand.length >= c.value
    return false
  }
  
  if (c.type === 'GRAVEYARD_COUNT') {
    const n = state.players[playerIndex].graveyard.length
    if (c.comparison === 'EQUAL') return n === (c.value ?? 0)
    if (c.comparison === 'GREATER') return n > (c.value ?? 0)
    if (c.comparison === 'LESS') return n < (c.value ?? 0)
    if (c.comparison === 'GREATER_EQUAL') return n >= (c.value ?? 0)
    if (c.comparison === 'LESS_EQUAL') return n <= (c.value ?? 0)
    return false
  }
  
  if (c.type === 'MANA_X_PLUS') {
    return p.mana >= (c.value ?? 0)
  }
  
  if (c.type === 'CREATURE_COUNT_3_PLUS') {
    return p.board.length >= 3
  }
  
  if (c.type === 'BOARD_STATE') {
    switch (String(c.value)) {
      case 'ALLY_DIED_THIS_TURN':       return !!p.allyDiedThisTurn
      case 'SPECIMEN_SUMMONED':         return !!p.specimenSummonedThisTurn
      case 'NO_STATE_CHANGE_THIS_TURN': return !p.manualCycleChangedThisTurn
      case 'MANA_5_PLUS':               return p.mana >= 5
      case 'MANA_6_PLUS':               return p.mana >= 6
      case 'SOLO_ATTACKER':             return (p.attackersDeclaredThisTurn ?? 0) === 1
      case 'ONLY_CREATURE_ON_BOARD':    return p.board.length === 1
      case 'ATTACKING_HERO':            return !!p.lastAttackTargetHero
      case 'DID_NOT_ATTACK':            return (p.attackersDeclaredThisTurn ?? 0) === 0
      case 'HAS_OTHER_CREATURES':       return p.board.length > 1
      default:                          return false
    }
  }
  
  return false
}

// ===== UTILIDADES =====

export function createEffectContext(
  state: GameState,
  playerIndex: number,
  action: EffectAction,
  targetHints?: TargetRef[]
): EffectContext {
  const oppIndex = playerIndex === 0 ? 1 : 0
  return {
    state,
    playerIndex,
    oppIndex,
    me: state.players[playerIndex],
    opp: state.players[oppIndex],
    action,
    targetHints
  }
}
