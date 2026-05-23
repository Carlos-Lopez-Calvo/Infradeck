import type { GameState } from '../engine/game-state'

/** Índice del jugador con vida > 0, o null si la partida sigue. */
export function getWinnerPlayerIndex(state: GameState): number | null {
  const alive = state.players
    .map((p, index) => ({ index, life: p.life }))
    .filter((p) => p.life > 0)

  if (alive.length === 1) return alive[0].index
  if (alive.length === 0) return state.players[0].life >= state.players[1].life ? 0 : 1
  return null
}

export function isGameOver(state: GameState): boolean {
  return getWinnerPlayerIndex(state) !== null
}

/** Rendición: el jugador indicado pierde (vida a 0). */
export function applySurrender(state: GameState, surrenderingPlayerIndex: number): GameState {
  return {
    ...state,
    players: state.players.map((p, i) =>
      i === surrenderingPlayerIndex ? { ...p, life: 0 } : p
    ),
  }
}
