import React, { createContext, useContext, useState, useEffect } from 'react'
import { wsService } from '../services/websocket'
import type { GameState } from '@infradeck/shared'

interface OnlineGameContextType {
  // Connection
  isConnected: boolean
  playerId: string | null
  
  // Matchmaking
  isSearching: boolean
  matchFound: boolean
  opponentName: string | null
  roomId: string | null
  
  // Game
  gameState: GameState | null
  isMyTurn: boolean
  gameEnded: boolean
  winner: number | null
  
  // Advanced interactions
  pendingTargetSelection: { handIndex: number; targetType: string } | null
  setPendingTargetSelection: (data: { handIndex: number; targetType: string } | null) => void
  pendingDiscoverSelection: { handIndex: number; options: Array<{ id: string; label: string; preview?: any }> } | null
  setPendingDiscoverSelection: (data: { handIndex: number; options: Array<{ id: string; label: string; preview?: any }> } | null) => void
  pendingScryDecision: { handIndex: number; cards: string[] } | null
  setPendingScryDecision: (data: { handIndex: number; cards: string[] } | null) => void
  
  // Actions
  connectToServer: () => Promise<void>
  disconnectFromServer: () => void
  startMatchmaking: (playerName: string) => void
  cancelMatchmaking: () => void
  playCard: (handIndex: number, targets?: any[]) => void
  attack: (attackerIndex: number, targetType: 'hero' | 'creature', targetIndex?: number) => void
  endTurn: () => void
  sendDiscoverChoice: (handIndex: number, choice: string) => void
  sendScryDecision: (handIndex: number, decision: 'TOP' | 'BOTTOM') => void
  resetGame: () => void
}

const OnlineGameContext = createContext<OnlineGameContextType | null>(null)

export function OnlineGameProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [matchFound, setMatchFound] = useState(false)
  const [opponentName, setOpponentName] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameEnded, setGameEnded] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [pendingTargetSelection, setPendingTargetSelection] = useState<{ handIndex: number; targetType: string } | null>(null)
  const [pendingDiscoverSelection, setPendingDiscoverSelection] = useState<{ handIndex: number; options: Array<{ id: string; label: string; preview?: any }> } | null>(null)
  const [pendingScryDecision, setPendingScryDecision] = useState<{ handIndex: number; cards: string[] } | null>(null)

  const connectToServer = async () => {
    try {
      console.log('[CLIENT] Connecting to server...')
      const id = await wsService.connect()
      setPlayerId(id)
      setIsConnected(true)
      console.log('[CLIENT] Connected successfully')

      // Setup listeners
      wsService.onMatchmakingWaiting(() => {
        console.log('[CLIENT] Waiting for opponent...')
        setIsSearching(true)
      })

      wsService.onMatchFound(({ roomId: matchRoomId, opponentName: matchOpponentName }) => {
        console.log('[CLIENT] Match found!', { matchRoomId, matchOpponentName })
        setIsSearching(false)
        setMatchFound(true)
        setOpponentName(matchOpponentName)
        setRoomId(matchRoomId)
      })

      wsService.onGameStart((state) => {
        console.log('[CLIENT] Game started!', state)
        setGameState(state)
        setGameEnded(false)
        setWinner(null)
      })

      wsService.onGameStateUpdate((state) => {
        console.log('[CLIENT] State updated')
        setGameState(state)
      })

      wsService.onGameEnd((data) => {
        console.log('[CLIENT] Game ended', data)
        setGameEnded(true)
        setWinner(data.winner)
        alert(`¡Juego terminado! ${data.winner === 0 ? 'Jugador 1' : 'Jugador 2'} ganó. Razón: ${data.reason}`)
      })

      wsService.onGameError((error) => {
        console.error('[CLIENT] Game error:', error)
        // Solo mostrar alerta si no es un error de necesitar targets
        if (!error.includes('needs target')) {
          alert(`Error: ${error}`)
        }
      })

      wsService.onNeedsTarget((data) => {
        console.log('[CLIENT] Card needs target selection:', data)
        setPendingTargetSelection(data)
      })

      wsService.onNeedsDiscover((data) => {
        console.log('[CLIENT] Card needs discover selection:', data)
        setPendingDiscoverSelection(data)
      })

      wsService.onNeedsScry((data) => {
        console.log('[CLIENT] Card needs scry decision:', data)
        setPendingScryDecision(data)
      })

      wsService.onPlayerLeft(() => {
        console.log('[CLIENT] Opponent disconnected')
        alert('El oponente se desconectó')
        resetGame()
      })

      wsService.onOpponentPlayCard((data) => {
        console.log('[CLIENT] Opponent played card:', data)
        // Aquí podrías agregar animaciones
      })

      wsService.onOpponentEndTurn(() => {
        console.log('[CLIENT] Opponent ended turn')
        // Aquí podrías agregar efectos visuales
      })
    } catch (error) {
      console.error('[CLIENT] Failed to connect:', error)
      alert('No se pudo conectar al servidor. Asegúrate de que el servidor esté corriendo en http://localhost:3001')
    }
  }

  const disconnectFromServer = () => {
    wsService.disconnect()
    setIsConnected(false)
    setPlayerId(null)
    resetGame()
  }

  const startMatchmaking = (playerName: string) => {
    if (!isConnected) {
      alert('No estás conectado al servidor')
      return
    }
    console.log('[CLIENT] Starting matchmaking as:', playerName)
    wsService.joinMatchmaking(playerName)
  }

  const cancelMatchmaking = () => {
    console.log('[CLIENT] Cancelling matchmaking')
    wsService.leaveMatchmaking()
    setIsSearching(false)
  }

  const playCard = (handIndex: number, targets?: any[]) => {
    if (!gameState) return
    wsService.playCard(handIndex, targets)
  }

  const attack = (attackerIndex: number, targetType: 'hero' | 'creature', targetIndex?: number) => {
    if (!gameState) return
    wsService.attack(attackerIndex, targetType, targetIndex)
  }

  const endTurn = () => {
    if (!gameState) return
    wsService.endTurn()
  }

  const sendDiscoverChoice = (handIndex: number, choice: string) => {
    if (!gameState) return
    console.log('[CLIENT] Sending discover choice:', { handIndex, choice })
    wsService.sendDiscoverChoice(handIndex, choice)
    setPendingDiscoverSelection(null)
  }

  const sendScryDecision = (handIndex: number, decision: 'TOP' | 'BOTTOM') => {
    if (!gameState) return
    console.log('[CLIENT] Sending scry decision:', { handIndex, decision })
    wsService.sendScryDecision(handIndex, decision)
    setPendingScryDecision(null)
  }

  const resetGame = () => {
    setIsSearching(false)
    setMatchFound(false)
    setOpponentName(null)
    setRoomId(null)
    setGameState(null)
    setGameEnded(false)
    setWinner(null)
    setPendingTargetSelection(null)
    setPendingDiscoverSelection(null)
    setPendingScryDecision(null)
  }

  const isMyTurn = gameState && playerId
    ? gameState.players[gameState.turn.currentPlayerIndex].id === playerId
    : false

  useEffect(() => {
    return () => {
      wsService.disconnect()
    }
  }, [])

  const value: OnlineGameContextType = {
    isConnected,
    playerId,
    isSearching,
    matchFound,
    opponentName,
    roomId,
    gameState,
    isMyTurn,
    gameEnded,
    winner,
    pendingTargetSelection,
    setPendingTargetSelection,
    pendingDiscoverSelection,
    setPendingDiscoverSelection,
    pendingScryDecision,
    setPendingScryDecision,
    connectToServer,
    disconnectFromServer,
    startMatchmaking,
    cancelMatchmaking,
    playCard,
    attack,
    endTurn,
    sendDiscoverChoice,
    sendScryDecision,
    resetGame
  }

  return (
    <OnlineGameContext.Provider value={value}>
      {children}
    </OnlineGameContext.Provider>
  )
}

export function useOnlineGame() {
  const context = useContext(OnlineGameContext)
  if (!context) {
    throw new Error('useOnlineGame must be used within OnlineGameProvider')
  }
  return context
}
