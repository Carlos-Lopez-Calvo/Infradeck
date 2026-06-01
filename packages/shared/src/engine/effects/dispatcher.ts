/**
 * DISPATCHER - Registry central de efectos
 * Punto de entrada único para aplicar cualquier efecto del juego
 */

import { EffectActionType, EffectTarget } from '../../types/cards'
import { EffectContext, EffectHandler, createEffectContext } from './core'
import { GameState, TargetRef } from '../game-state'
import { getOpponentPlayerIndex } from '../turns'

// ===== IMPORTAR TODOS LOS HANDLERS =====

// Efectos globales
import {
  handleDamage,
  handleHeal,
  handleDrawCards,
  handleDiscardCards,
  handleScry,
  handleAdvancedSelection,
  handleBuffAttack,
  handleBuffHealth,
  handleBuffStats,
  handleGainAbility,
  handleLoseAbility,
  handleGrantTempDrawOnKill,
  handleSummonCreature,
  handleDamageAdjacent,
  handleDamageAndDrawIfKill
} from './global-effects'

// Efectos de Caos
import {
  handleGainEntropy,
  handleDiscoverPayEntropy,
  handleRandomByEntropy,
  handleSummonByEntropy,
  handleRepeatNDamage,
  handleReuseRandomPastEffect,
  consumeEntropy
} from './caos-effects'

// Efectos de transformaciones especiales
import { handleTransform } from './transform-effects'

// Efectos de Vitalidad
import {
  handleDiscoverPayLife,
  handleReduceCardCost,
  handleAttackSpell,
  handleBoardNukeAndAbsorb,
  handleDestroyTopHealthCreatures
} from './vitalidad-effects'

// Efectos de Abominación
import {
  handleSummonSpecimen,
  handleDiscoverSummonFromGraveyard,
  handleDamageAndSummonSameCost
} from './abominacion-effects'

// ===== REGISTRY DE HANDLERS =====

const EFFECT_HANDLERS: Partial<Record<EffectActionType, EffectHandler>> = {
  // Efectos globales - Daño y curación
  [EffectActionType.DAMAGE]: handleDamage,
  [EffectActionType.HEAL]: handleHeal,
  [EffectActionType.DAMAGE_ADJACENT]: handleDamageAdjacent,
  [EffectActionType.DAMAGE_AND_DRAW_IF_KILL]: handleDamageAndDrawIfKill,
  
  // Efectos globales - Manipulación de cartas
  [EffectActionType.DRAW_CARDS]: handleDrawCards,
  [EffectActionType.DISCARD_CARDS]: handleDiscardCards,
  [EffectActionType.SCRY]: handleScry,
  [EffectActionType.ADVANCED_SELECTION]: handleAdvancedSelection,
  
  // Efectos globales - Invocación
  [EffectActionType.SUMMON_CREATURE]: handleSummonCreature,
  
  // Efectos globales - Buffs
  [EffectActionType.BUFF_ATTACK]: handleBuffAttack,
  [EffectActionType.BUFF_HEALTH]: handleBuffHealth,
  [EffectActionType.BUFF_STATS]: handleBuffStats,
  
  // Efectos globales - Habilidades
  [EffectActionType.GAIN_ABILITY]: handleGainAbility,
  [EffectActionType.LOSE_ABILITY]: handleLoseAbility,
  [EffectActionType.GRANT_TEMP_DRAW_ON_KILL]: handleGrantTempDrawOnKill,
  
  // Efectos de CAOS
  [EffectActionType.GAIN_ENTROPY]: handleGainEntropy,
  [EffectActionType.DISCOVER_PAY_ENTROPY]: handleDiscoverPayEntropy,
  [EffectActionType.REUSE_RANDOM_PAST_CHAOS_EFFECT]: handleReuseRandomPastEffect,
  
  [EffectActionType.TRANSFORM]: handleTransform,
  
  // Efectos de VITALIDAD
  [EffectActionType.DISCOVER_PAY_LIFE]: handleDiscoverPayLife,
  [EffectActionType.REDUCE_CARD_COST]: handleReduceCardCost,
  [EffectActionType.ATTACK_SPELL]: handleAttackSpell,
  [EffectActionType.BOARD_NUKE_AND_ABSORB]: handleBoardNukeAndAbsorb,
  [EffectActionType.DESTROY_TOP_HEALTH_CREATURES]: handleDestroyTopHealthCreatures,
  
  // Efectos de ABOMINACIÓN
  [EffectActionType.SUMMON_SPECIMEN]: handleSummonSpecimen,
  [EffectActionType.DISCOVER_SUMMON_FROM_GRAVEYARD]: handleDiscoverSummonFromGraveyard,
  [EffectActionType.DAMAGE_AND_SUMMON_SAME_COST_IF_KILL]: handleDamageAndSummonSameCost,
}

// ===== FUNCIÓN PRINCIPAL DE DISPATCH =====

/**
 * Aplica una acción de efecto usando el handler correspondiente del registry
 */
export function applyAction(
  state: GameState,
  playerIndex: number,
  action: any,
  targetHints?: TargetRef[]
): void {
  if (!action || !action.type) {
    console.warn('[DISPATCHER] invalid action', action)
    return
  }
  
  // Casos especiales que requieren preprocessing
  
  // CASO 1: RANDOM_BY_ENTROPY (variante especial de DAMAGE)
  if (String(action.value) === 'RANDOM_BY_ENTROPY' && 
      action.target === EffectTarget.RANDOM_CHARACTER &&
      action.type === EffectActionType.DAMAGE) {
    const ctx = createEffectContext(state, playerIndex, action, targetHints)
    handleRandomByEntropy(ctx)
    return
  }
  
  // CASO 2: Portal Inestable — invocación aleatoria escalada por entropía
  if (String(action.value) === 'RANDOM_BY_ENTROPY' &&
      action.type === EffectActionType.SUMMON_CREATURE) {
    const ctx = createEffectContext(state, playerIndex, action, targetHints)
    handleSummonByEntropy(ctx)
    return
  }

  // CASO 3: REPEAT_N (variante especial de DAMAGE)
  if (typeof action.value === 'string' && 
      action.value.startsWith('REPEAT_N:') &&
      action.target === EffectTarget.RANDOM_ENEMY &&
      action.type === EffectActionType.DAMAGE) {
    const ctx = createEffectContext(state, playerIndex, action, targetHints)
    handleRepeatNDamage(ctx)
    return
  }
  
  // CASO 3: Consumir entropía si el efecto lo requiere (antes de ejecutar)
  if (action.consumeEntropy && action.consumeEntropy > 0) {
    // Solo para efectos que NO sean RANDOM_BY_ENTROPY (que ya consume por disparo)
    if (String(action.value) !== 'RANDOM_BY_ENTROPY') {
      if (!consumeEntropy(state, playerIndex, action.consumeEntropy)) {
        console.warn('[DISPATCHER] failed to consume entropy', {
          required: action.consumeEntropy,
          available: state.players[playerIndex].classResource?.amount
        })
        return
      }
    }
  }
  
  // Buscar handler en el registry
  const handler = EFFECT_HANDLERS[action.type as EffectActionType]
  
  if (!handler) {
    console.warn('[DISPATCHER] no handler for action type', action.type)
    return
  }
  
  // Crear contexto y ejecutar handler
  const ctx = createEffectContext(state, playerIndex, action, targetHints)
  
  console.log('[DISPATCHER] executing', {
    type: action.type,
    playerIndex,
    target: action.target,
    amount: action.amount,
    value: action.value
  })
  
  try {
    handler(ctx)
  } catch (error) {
    console.error('[DISPATCHER] error executing handler', {
      type: action.type,
      error
    })
  }
}

/**
 * Re-export para mantener compatibilidad con código existente
 */
export { createEffectContext } from './core'