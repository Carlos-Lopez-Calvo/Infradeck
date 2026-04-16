/**
 * BOARD EFFECTS - Efectos que se aplican en el tablero
 * Funciones para triggers, buffs condicionales y aplicación en ON_ENTER
 */

import { GameState, CreatureOnBoard, TargetRef, getCardByIdGlobal } from '../game-state'
import { Ability, Card, EffectTiming, EffectTarget } from '../../types/cards'
import { effectConditionPasses } from './core'
import { applyAction } from './dispatcher'

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

    // Coloso de Hierro: reforzar condición explícitamente al inicio de turno.
    // Si hay 3+ criaturas totales en tablero, gana Prisa.
    if (timing === EffectTiming.START_OF_TURN && ent.cardId === 'Coloso_de_Hierro') {
      const oppIdx = playerIndex === 0 ? 1 : 0
      const totalCreatures = p.board.length + state.players[oppIdx].board.length
      if (totalCreatures >= 3 && !ent.abilities.includes(String(Ability.PRISA))) {
        ent.abilities.push(String(Ability.PRISA))
        ent.exhausted = false
      }
    }
    
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
      
      // Priorizar objetivos UI (pendingTargets). Si no hay, solo usamos auto-SELF
      // cuando el efecto lo declara explícitamente (SELF) o en excepciones concretas
      // de diseño de carta (por ejemplo, Maestro_de_Armas: "puede ser él mismo").
      const uiHints: TargetRef[] =
        state.pendingTargets && state.pendingTargets.length
          ? ([...(state.pendingTargets as TargetRef[])] as TargetRef[])
          : ([] as TargetRef[])
      
      const selfHints: TargetRef[] =
        (
          eff.action?.target === EffectTarget.SELF ||
          (card.id === 'Maestro_de_Armas' && eff.action?.target === EffectTarget.TARGET_FRIENDLY_CREATURE)
        )
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
    }
  }
}

/**
 * Actualiza buffs condicionales basados en el estado del tablero
 * (Por ejemplo: Duelista Frenético que se buffea si es la única criatura)
 */
export function updateConditionalBuffs(state: GameState, playerIndex: number): void {
  const p = state.players[playerIndex]
  
  // Optimización: solo ejecutar si hay criaturas con buffs condicionales conocidos.
  const hasDuelista = p.board.some(c => c.cardId === 'Duelista_Frenetico')
  const hasComerciante = p.board.some(c => c.cardId === 'Comerciante_Sagaz')
  const hasVampiro = p.board.some(c => c.cardId === 'Vampiro_Ancestral')
  const hasCampeon = p.board.some(c => c.cardId === 'Campeon_Caido')
  if (!hasDuelista && !hasComerciante && !hasVampiro && !hasCampeon) return
  
  console.log('[updateConditionalBuffs]', { playerIndex, boardLength: p.board.length })
  
  for (let i = 0; i < p.board.length; i++) {
    const ent = p.board[i]
    
    // Solo procesamos Duelista Frenetico
    if (ent.cardId === 'Duelista_Frenetico') {
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
      continue
    }

    if (ent.cardId === 'Comerciante_Sagaz') {
      const hasSixOrMore = p.hand.length >= 6
      const hasTaunt = ent.abilities.includes('TAUNT')
      const grantedByCondition = !!ent.conditionalTauntFromHand

      if (hasSixOrMore && !hasTaunt) {
        ent.abilities.push('TAUNT')
        ent.conditionalTauntFromHand = true
      } else if (!hasSixOrMore && grantedByCondition) {
        ent.abilities = ent.abilities.filter(a => a !== 'TAUNT')
        delete ent.conditionalTauntFromHand
      }
      continue
    }

    if (ent.cardId === 'Vampiro_Ancestral') {
      const lowLife = p.life <= 10
      const hasBuff = ent.conditionalBuff === 'VAMPIRO_LOW_LIFE'
      if (lowLife && !hasBuff) {
        ent.attack += 2
        ent.health += 2
        ent.conditionalBuff = 'VAMPIRO_LOW_LIFE'
      } else if (!lowLife && hasBuff) {
        ent.attack -= 2
        ent.health -= 2
        delete ent.conditionalBuff
      }
      continue
    }

    if (ent.cardId === 'Campeon_Caido') {
      const desired = p.alliesDiedThisTurnCount ?? 0
      const applied = ent.deathScalingBonusApplied ?? 0
      if (desired !== applied) {
        const delta = desired - applied
        ent.attack += delta
        ent.health += delta
        ent.deathScalingBonusApplied = desired
      }
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