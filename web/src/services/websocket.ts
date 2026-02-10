import { io, Socket } from 'socket.io-client'
import type { GameState } from '@infradeck/shared'

// Tipos de eventos del servidor
interface ServerToClientEvents {
  'connection:success': (data: { playerId: string }) => void
  'connection:error': (error: string) => void
  'matchmaking:waiting': () => void
  'matchmaking:matched': (data: { roomId: string; opponentName: string }) => void
  'matchmaking:playerLeft': () => void
  'game:start': (gameState: GameState) => void
  'game:stateUpdate': (gameState: GameState) => void
  'game:end': (data: { winner: number; reason: string }) => void
  'game:error': (error: string) => void
  'game:needsTarget': (data: { handIndex: number; targetType: string }) => void
  'game:needsDiscover': (data: { handIndex: number; options: Array<{ id: string; label: string; preview?: any }> }) => void
  'game:needsScry': (data: { handIndex: number; cards: string[] }) => void
  'opponent:playCard': (data: { cardId: string }) => void
  'opponent:endTurn': () => void
}

// Tipos de eventos del cliente
interface ClientToServerEvents {
  'matchmaking:join': (playerName: string) => void
  'matchmaking:leave': () => void
  'game:playCard': (data: { handIndex: number; targets?: any[] }) => void
  'game:attack': (data: { attackerIndex: number; targetType: 'hero' | 'creature'; targetIndex?: number }) => void
  'game:endTurn': () => void
  'game:summonSpecimen': () => void
  'game:discoverResponse': (data: { handIndex: number; choice: string }) => void
  'game:scryResponse': (data: { handIndex: number; decision: 'TOP' | 'BOTTOM' }) => void
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export class WebSocketService {
  private socket: TypedSocket | null = null
  private playerId: string | null = null

  connect(serverUrl: string = 'http://localhost:3001'): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      }) as TypedSocket

      this.socket.on('connection:success', ({ playerId }) => {
        console.log('[WS] Connected with player ID:', playerId)
        this.playerId = playerId
        resolve(playerId)
      })

      this.socket.on('connection:error', (error) => {
        console.error('[WS] Connection error:', error)
        reject(error)
      })

      this.socket.on('connect_error', (error) => {
        console.error('[WS] Socket connection error:', error)
        reject(error)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.playerId = null
    }
  }

  getPlayerId(): string | null {
    return this.playerId
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  // ==========================================
  // MATCHMAKING
  // ==========================================
  joinMatchmaking(playerName: string) {
    if (!this.socket) throw new Error('Not connected')
    this.socket.emit('matchmaking:join', playerName)
  }

  leaveMatchmaking() {
    if (!this.socket) throw new Error('Not connected')
    this.socket.emit('matchmaking:leave')
  }

  onMatchmakingWaiting(callback: () => void) {
    if (!this.socket) return
    this.socket.on('matchmaking:waiting', callback)
  }

  onMatchFound(callback: (data: { roomId: string; opponentName: string }) => void) {
    if (!this.socket) return
    this.socket.on('matchmaking:matched', callback)
  }

  onPlayerLeft(callback: () => void) {
    if (!this.socket) return
    this.socket.on('matchmaking:playerLeft', callback)
  }

  // ==========================================
  // GAME
  // ==========================================
  playCard(handIndex: number, targets?: any[]) {
    if (!this.socket) throw new Error('Not connected')
    console.log('[WS] Sending playCard:', { handIndex, targets })
    this.socket.emit('game:playCard', { handIndex, targets })
  }

  attack(attackerIndex: number, targetType: 'hero' | 'creature', targetIndex?: number) {
    if (!this.socket) throw new Error('Not connected')
    console.log('[WS] Sending attack:', { attackerIndex, targetType, targetIndex })
    this.socket.emit('game:attack', { attackerIndex, targetType, targetIndex })
  }

  endTurn() {
    if (!this.socket) throw new Error('Not connected')
    console.log('[WS] Sending endTurn')
    this.socket.emit('game:endTurn')
  }

  onGameStart(callback: (gameState: GameState) => void) {
    if (!this.socket) return
    this.socket.on('game:start', callback)
  }

  onGameStateUpdate(callback: (gameState: GameState) => void) {
    if (!this.socket) return
    this.socket.on('game:stateUpdate', callback)
  }

  onGameEnd(callback: (data: { winner: number; reason: string }) => void) {
    if (!this.socket) return
    this.socket.on('game:end', callback)
  }

  onGameError(callback: (error: string) => void) {
    if (!this.socket) return
    this.socket.on('game:error', callback)
  }

  onNeedsTarget(callback: (data: { handIndex: number; targetType: string }) => void) {
    if (!this.socket) return
    this.socket.on('game:needsTarget', callback)
  }

  onNeedsDiscover(callback: (data: { handIndex: number; options: Array<{ id: string; label: string; preview?: any }> }) => void) {
    if (!this.socket) return
    this.socket.on('game:needsDiscover', callback)
  }

  onNeedsScry(callback: (data: { handIndex: number; cards: string[] }) => void) {
    if (!this.socket) return
    this.socket.on('game:needsScry', callback)
  }

  sendDiscoverChoice(handIndex: number, choice: string) {
    if (!this.socket) throw new Error('Not connected')
    console.log('[WS] Sending discoverResponse:', { handIndex, choice })
    this.socket.emit('game:discoverResponse', { handIndex, choice })
  }

  sendScryDecision(handIndex: number, decision: 'TOP' | 'BOTTOM') {
    if (!this.socket) throw new Error('Not connected')
    console.log('[WS] Sending scryResponse:', { handIndex, decision })
    this.socket.emit('game:scryResponse', { handIndex, decision })
  }

  onOpponentPlayCard(callback: (data: { cardId: string }) => void) {
    if (!this.socket) return
    this.socket.on('opponent:playCard', callback)
  }

  onOpponentEndTurn(callback: () => void) {
    if (!this.socket) return
    this.socket.on('opponent:endTurn', callback)
  }

  // ==========================================
  // UTILITY
  // ==========================================
  off(event: keyof ServerToClientEvents, callback?: (...args: any[]) => void) {
    if (!this.socket) return
    this.socket.off(event as any, callback)
  }

  removeAllListeners() {
    if (!this.socket) return
    this.socket.removeAllListeners()
  }
}

// Singleton
export const wsService = new WebSocketService()
