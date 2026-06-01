import type { GameRoom } from './types.js'

export async function finishGameIfNeeded(
  room: GameRoom
): Promise<{ winner: number; newlyFinished: boolean } | null> {
  if (!room.gameState) return null

  const { getWinnerPlayerIndex } = await import('@infradeck/shared')
  const winner = getWinnerPlayerIndex(room.gameState)
  if (winner === null) return null

  const newlyFinished = room.status !== 'finished'
  room.status = 'finished'
  return { winner, newlyFinished }
}
