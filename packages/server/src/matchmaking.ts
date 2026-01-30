import { nanoid } from 'nanoid'
import type { Player } from './types.js'

export class MatchmakingQueue {
  private queue: Array<{ player: Player; timestamp: number }> = []

  addPlayer(player: Player): void {
    this.queue.push({ player, timestamp: Date.now() })
  }

  removePlayer(playerId: string): void {
    this.queue = this.queue.filter(item => item.player.id !== playerId)
  }

  findMatch(): { player1: Player; player2: Player; roomId: string } | null {
    if (this.queue.length < 2) return null

    const [first, second] = this.queue.splice(0, 2)
    const roomId = nanoid(10)

    return {
      player1: first.player,
      player2: second.player,
      roomId
    }
  }

  getQueueSize(): number {
    return this.queue.length
  }
}
