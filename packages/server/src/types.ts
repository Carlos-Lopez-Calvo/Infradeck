export interface Player {
  id: string
  socketId: string
  name: string
  ready: boolean
}

export interface GameRoom {
  id: string
  players: Player[]
  gameState: any | null
  status: 'waiting' | 'playing' | 'finished'
  createdAt: number
}

export interface ClientToServerEvents {
  // Matchmaking
  'matchmaking:join': (playerName: string) => void
  'matchmaking:leave': () => void
  
  // Game
  'game:ready': () => void
  'game:playCard': (data: { handIndex: number; targets?: any[] }) => void
  'game:attack': (data: { attackerIndex: number; targetType: 'hero' | 'creature'; targetIndex?: number }) => void
  'game:endTurn': () => void
  'game:summonSpecimen': () => void
}

export interface ServerToClientEvents {
  // Connection
  'connection:success': (data: { playerId: string }) => void
  'connection:error': (error: string) => void
  
  // Matchmaking
  'matchmaking:waiting': () => void
  'matchmaking:matched': (data: { roomId: string; opponentName: string }) => void
  'matchmaking:playerJoined': (data: { playerName: string }) => void
  'matchmaking:playerLeft': () => void
  
  // Game
  'game:start': (gameState: any) => void
  'game:stateUpdate': (gameState: any) => void
  'game:end': (data: { winner: number; reason: string }) => void
  'game:error': (error: string) => void
  'game:needsTarget': (data: { handIndex: number; targetType: string }) => void
  
  // Opponent actions (for animations/feedback)
  'opponent:playCard': (data: { cardId: string }) => void
  'opponent:endTurn': () => void
}
