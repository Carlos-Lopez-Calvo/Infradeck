/**
 * EFECTOS DE CAOS 🎲
 * Efectos específicos de la clase Caos:
 * - GAIN_ENTROPY
 * - DISCOVER_PAY_ENTROPY
 * - REUSE_RANDOM_PAST_CHAOS_EFFECT
 * - RANDOM_BY_ENTROPY (variante especial de DAMAGE)
 */

import { EffectContext } from './core'
import { EffectActionType } from '../../types/cards'
import { GameState, PlayerState } from '../game-state'

// Los handlers se implementarán en la Fase 3.2

// ===== FUNCIONES DE UTILIDAD PARA ENTROPÍA =====

export function consumeEntropy(state: GameState, playerIndex: number, amount: number): boolean {
  const p = state.players[playerIndex]
  if (p.classResource?.type !== 'ENTROPIA') return false
  const current = p.classResource.amount ?? 0
  if (current < amount) return false
  p.classResource.amount = current - amount
  return true
}

export function gainEntropyOnPlay(player: PlayerState) {
  if (player.classResource?.type === 'ENTROPIA') {
    const current = player.classResource.amount ?? 0
    player.classResource.amount = Math.min(10, current + 1)
  }
}
