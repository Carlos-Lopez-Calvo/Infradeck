import { prisma } from './db.js'
import type { GameRoom } from './types.js'

export async function recordMatchResults(
  room: GameRoom,
  winnerPlayerIndex: number
): Promise<void> {
  const players = room.players
  if (players.length < 2) return

  const records: { userId: string; result: string; opponentName: string }[] = []

  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    if (!player.userId) continue
    const opponent = players[1 - i]
    if (!opponent) continue
    records.push({
      userId: player.userId,
      result: i === winnerPlayerIndex ? 'win' : 'loss',
      opponentName: opponent.name,
    })
  }

  if (records.length === 0) return

  await prisma.matchRecord.createMany({ data: records })
}
