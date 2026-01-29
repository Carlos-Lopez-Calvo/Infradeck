/**
 * EFECTOS DE CICLO 🌓
 * Efectos específicos de la clase Ciclo:
 * - CHANGE_CYCLE_STATE
 * - ACTIVATE_ECLIPSE
 * - TRANSFORM
 */

import { EffectContext } from './core'
import { EffectActionType, CycleState } from '../../types/cards'

// Los handlers se implementarán en la Fase 3.3

// ===== FUNCIONES DE UTILIDAD PARA CICLO =====

export function getNextCycleState(current: CycleState): CycleState {
  switch (current) {
    case 'DIA':
      return 'NOCHE'
    case 'NOCHE':
      return 'DIA'
    case 'ECLIPSE':
      return 'DIA'
    default:
      return 'DIA'
  }
}
