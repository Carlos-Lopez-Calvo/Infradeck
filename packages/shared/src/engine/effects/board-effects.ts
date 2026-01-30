/**
 * BOARD EFFECTS - Efectos que se aplican en el tablero
 * Funciones para triggers, buffs condicionales y aplicación en ON_ENTER
 */

import { GameState, CreatureOnBoard, TargetRef, getCardByIdGlobal } from '../game-state'
import { Card, EffectTiming, EffectTarget } from '../../types/cards'
import { effectConditionPasses } from './core'
import { applyAction } from './dispatcher'
import { notifyEffectTriggered } from '../priority'

/**
 * Triggers de efectos en criaturas del tablero (START_OF_TURN, END_OF_TURN, etc.)
 */
export function triggerBoardEffects(
  state: GameState, 
  playerIndex: number, 
  timing: EffectTiming
): void {
  const p = state.players[playerIndex]
  
  for (let i = 0; i < p.board.length; i++) {
    const ent = p.board[i]
    const card = getCardByIdGlobal(ent.cardId)
    if (!card || !card.effects) continue
    
    for (const eff of card.effects) {
      if (eff.timing !== timing) continue
      
      // Condición especial: SELF_NOT_DAMAGED_THIS_TURN
      if (timing === EffectTiming.END_OF_TURN && 
          eff.condition?.type === 'SELF_NOT_DAMAGED_THIS_TURN' && 
          ent.damagedThisTurn) {
        continue
      }
      
      if (!effectConditionPasses(state, playerIndex, eff)) continue
      
      // Hints para targets SELF -> criatura actual
      const hints: TargetRef[] | undefined =
        eff.action?.target === EffectTarget.SELF
          ? ([{ type: 'CREATURE_SELF', index: i }] as TargetRef[])
          : undefined
      
      applyAction(state, playerIndex, eff.action, hints)
      notifyEffectTriggered(
        state, 
        playerIndex, 
        card.id, 
        timing === EffectTiming.START_OF_TURN ? 'ON_PLAY' : 'END_OF_TURN'
      )
    }
  }
}

/**
 * Aplicar efectos ON_ENTER de una criatura que acaba de entrar al tablero
 */
export function applyOnEnterEffects(
  state: GameState,
  creature: CreatureOnBoard,
  playerIndex: number,
  card: Card
): void {
  if (!card.effects) return
  
  for (const eff of card.effects) {
    if (eff.timing === EffectTiming.ON_ENTER && effectConditionPasses(state, playerIndex, eff)) {
      console.log('[ON_ENTER] applying', { cardId: card.id, effectId: eff.id })
      
      // Priorizar objetivos UI (pendingTargets); si no hay y el target es SELF, usar SELF
      const uiHints: TargetRef[] =
        state.pendingTargets && state.pendingTargets.length
          ? ([...(state.pendingTargets as TargetRef[])] as TargetRef[])
          : ([] as TargetRef[])
      
      const selfHints: TargetRef[] =
        eff.action?.target === EffectTarget.SELF
          ? ([{ type: 'CREATURE_SELF', index: state.players[playerIndex].board.length - 1 }] as TargetRef[])
          : ([] as TargetRef[])
      
      const hints: TargetRef[] = uiHints.length ? uiHints : selfHints
      
      console.log('[ON_ENTER] hints', { hints, action: eff.action })
      applyAction(state, playerIndex, eff.action, hints)
    }
  }
  
  state.pendingTargets = []
}

/**
 * Triggers de efectos TRIGGERED (condiciones especiales como ALLY_DIED_THIS_TURN)
 */
export function triggerTriggeredEffects(state: GameState, playerIndex: number): void {
  const p = state.players[playerIndex]
  
  for (let i = 0; i < p.board.length; i++) {
    const ent = p.board[i]
    const card = getCardByIdGlobal(ent.cardId)
    if (!card || !card.effects) continue
    
    for (const eff of card.effects) {
      if (eff.timing !== EffectTiming.TRIGGERED) continue
      if (!effectConditionPasses(state, playerIndex, eff)) continue
      
      const hints: TargetRef[] | undefined =
        eff.action?.target === EffectTarget.SELF
          ? ([{ type: 'CREATURE_SELF', index: i }] as TargetRef[])
          : undefined
      
      applyAction(state, playerIndex, eff.action, hints)
      notifyEffectTriggered(state, playerIndex, card.id, 'ON_PLAY')
    }
  }
}

/**
 * Actualiza buffs condicionales basados en el estado del tablero
 * (Por ejemplo: Duelista Frenético que se buffea si es la única criatura)
 */
export function updateConditionalBuffs(state: GameState, playerIndex: number): void {
  const p = state.players[playerIndex]
  
  // Optimización: solo ejecutar si hay Duelista Frenetico en el tablero
  const hasDuelista = p.board.some(c => c.cardId === 'Duelista_Frenetico')
  if (!hasDuelista) return
  
  console.log('[updateConditionalBuffs]', { playerIndex, boardLength: p.board.length })
  
  for (let i = 0; i < p.board.length; i++) {
    const ent = p.board[i]
    
    // Solo procesamos Duelista Frenetico
    if (ent.cardId !== 'Duelista_Frenetico') continue
    
    const isOnlyCreature = p.board.length === 1
    const hasConditionalBuff = !!ent.conditionalBuff
    
    console.log('[updateConditionalBuffs] Duelista check', {
      index: i,
      isOnlyCreature,
      hasConditionalBuff,
      currentAttack: ent.attack,
      currentHealth: ent.health
    })
    
    // Aplicar buff si es la única criatura y no lo tiene
    if (isOnlyCreature && !hasConditionalBuff) {
      ent.attack += 2
      ent.health += 1
      ent.conditionalBuff = 'DUELISTA_SOLO'
      console.log('[updateConditionalBuffs] Applied buff', {
        newAttack: ent.attack,
        newHealth: ent.health
      })
    }
    
    // Quitar buff si hay otras criaturas y lo tiene
    if (!isOnlyCreature && hasConditionalBuff) {
      ent.attack -= 2
      ent.health -= 1
      delete ent.conditionalBuff
      console.log('[updateConditionalBuffs] Removed buff', {
        newAttack: ent.attack,
        newHealth: ent.health
      })
    }
  }
}

/**
 * Genera hints aleatorios para una acción específica
 */
export function getRandomHintsForAction(
  state: GameState,
  playerIndex: number,
  action: any
): TargetRef[] {
  const me = state.players[playerIndex]
  const oppIdx = playerIndex === 0 ? 1 : 0
  const opp = state.players[oppIdx]
  const hints: TargetRef[] = []
  
  switch (action?.target) {
    case EffectTarget.TARGET_CREATURE: {
      if (opp.board.length > 0) {
        const i = Math.floor(Math.random() * opp.board.length)
        hints.push({ type: 'CREATURE_ENEMY', index: i } as any)
      } else {
        hints.push({ type: 'HERO_ENEMY' } as any)
      }
      break
    }
    case EffectTarget.TARGET_FRIENDLY_CREATURE: {
      if (me.board.length > 0) {
        const i = Math.floor(Math.random() * me.board.length)
        hints.push({ type: 'CREATURE_SELF', index: i } as any)
      }
      break
    }
    case EffectTarget.ALL_FRIENDLY_CREATURES:
    case EffectTarget.ALL_ENEMY_CREATURES:
    case EffectTarget.ALL_CREATURES:
    case EffectTarget.RANDOM_ENEMY:
    case EffectTarget.RANDOM_CREATURE:
    case EffectTarget.RANDOM_CHARACTER:
    case EffectTarget.FRIENDLY_HERO:
    case EffectTarget.ENEMY_HERO:
    case EffectTarget.SELF:
    default:
      break
  }
  
  return hints
}