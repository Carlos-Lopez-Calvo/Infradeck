import React, { createContext, useCallback, useContext, useState, useEffect, useRef } from 'react'
import { wsService } from '../services/websocket'
import type { GameState } from '@infradeck/shared'
import { getWinnerPlayerIndex } from '@infradeck/shared'
import { useAuth } from './AuthContext'
import type { PlayDeckConfig } from '../utils/play-deck'

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
  connectToServer: () => Promise<string>
  disconnectFromServer: () => void
  beginOnlineMatch: () => Promise<void>
  startMatchmaking: () => void
  cancelMatchmaking: () => void
  playCard: (handIndex: number, targets?: any[]) => void
  attack: (attackerIndex: number, targetType: 'hero' | 'creature', targetIndex?: number) => void
  endTurn: () => void
  surrender: () => void
  sendDiscoverChoice: (handIndex: number, choice: string) => void
  sendScryDecision: (handIndex: number, decision: 'TOP' | 'BOTTOM') => void
  summonSpecimen: (targets?: any[]) => void
  resetGame: () => void
}

const OnlineGameContext = createContext<OnlineGameContextType | null>(null)

export function OnlineGameProvider({
  children,
  matchDeck,
}: {
  children: React.ReactNode
  matchDeck?: PlayDeckConfig | null
}) {
  const { token, user } = useAuth()
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
  const listenersAttachedRef = useRef(false)

  const resetGame = useCallback(() => {
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
  }, [])

  const attachSocketListeners = useCallback(() => {
    if (listenersAttachedRef.current) return
    listenersAttachedRef.current = true

    wsService.onMatchmakingWaiting(() => {
      setIsSearching(true)
    })

    wsService.onMatchFound(({ roomId: matchRoomId, opponentName: matchOpponentName }) => {
      setIsSearching(false)
      setMatchFound(true)
      setOpponentName(matchOpponentName)
      setRoomId(matchRoomId)
    })

    wsService.onGameStart((state) => {
      const id = wsService.getPlayerId()
      if (id) setPlayerId(id)
      setGameState(state)
      setGameEnded(false)
      setWinner(null)
    })

    wsService.onGameStateUpdate((state) => {
      setGameState(state)
      const w = getWinnerPlayerIndex(state)
      if (w !== null) {
        setGameEnded(true)
        setWinner(w)
      }
    })

    wsService.onGameEnd((data) => {
      setGameEnded(true)
      setWinner(data.winner)
    })

    wsService.onGameError((error) => {
      if (!error.includes('needs target')) {
        alert(`Error: ${error}`)
      }
    })

    wsService.onNeedsTarget((data) => {
      setPendingTargetSelection(data)
    })

    wsService.onNeedsDiscover((data) => {
      setPendingDiscoverSelection(data)
    })

    wsService.onNeedsScry((data) => {
      setPendingScryDecision(data)
    })

    wsService.onPlayerLeft(() => {
      alert('El oponente se desconectó')
      resetGame()
    })

    wsService.onOpponentPlayCard(() => {})
    wsService.onOpponentEndTurn(() => {})
  }, [resetGame])

  const connectToServer = useCallback(async (): Promise<string> => {
    const id = await wsService.connect()
    setPlayerId(id)
    setIsConnected(true)
    attachSocketListeners()
    return id
  }, [attachSocketListeners])

  const disconnectFromServer = useCallback(() => {
    wsService.disconnect()
    listenersAttachedRef.current = false
    setIsConnected(false)
    setPlayerId(null)
    resetGame()
  }, [resetGame])

  const startMatchmaking = useCallback(() => {
    const playerName = user?.username?.trim()
    if (!playerName) {
      alert('Tu cuenta no tiene nombre de usuario')
      return
    }
    if (!wsService.isConnected()) {
      alert('No estás conectado al servidor')
      return
    }
    if (!matchDeck) {
      alert('Selecciona un mazo en Play antes de buscar partida')
      return
    }
    if (!token) {
      alert('Sesión no válida. Vuelve a iniciar sesión.')
      return
    }
    const id = wsService.getPlayerId()
    if (id) setPlayerId(id)
    wsService.joinMatchmaking({
      playerName,
      deckId: matchDeck.id,
      token,
    })
    setIsSearching(true)
  }, [user?.username, matchDeck, token])

  const beginOnlineMatch = useCallback(async () => {
    await connectToServer()
    startMatchmaking()
  }, [connectToServer, startMatchmaking])

  const cancelMatchmaking = useCallback(() => {
    if (wsService.isConnected()) {
      wsService.leaveMatchmaking()
    }
    setIsSearching(false)
  }, [])

  const playCard = (handIndex: number, targets?: any[]) => {
    if (!gameState || gameEnded) return
    wsService.playCard(handIndex, targets)
  }

  const attack = (attackerIndex: number, targetType: 'hero' | 'creature', targetIndex?: number) => {
    if (!gameState || gameEnded) return
    wsService.attack(attackerIndex, targetType, targetIndex)
  }

  const endTurn = () => {
    if (!gameState || gameEnded) return
    wsService.endTurn()
  }

  const surrender = () => {
    if (!gameState || gameEnded) return
    wsService.surrender()
  }

  const sendDiscoverChoice = (handIndex: number, choice: string) => {
    if (!gameState || gameEnded) return
    console.log('[CLIENT] Sending discover choice:', { handIndex, choice })
    wsService.sendDiscoverChoice(handIndex, choice)
    setPendingDiscoverSelection(null)
  }

  const sendScryDecision = (handIndex: number, decision: 'TOP' | 'BOTTOM') => {
    if (!gameState || gameEnded) return
    console.log('[CLIENT] Sending scry decision:', { handIndex, decision })
    wsService.sendScryDecision(handIndex, decision)
    setPendingScryDecision(null)
  }

  const summonSpecimen = (targets?: any[]) => {
    if (!gameState || gameEnded) return
    wsService.summonSpecimen(targets)
  }

  const effectivePlayerId = playerId ?? wsService.getPlayerId()

  const isMyTurn = gameState && effectivePlayerId
    ? gameState.players[gameState.turn.currentPlayerIndex].id === effectivePlayerId
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
    beginOnlineMatch,
    startMatchmaking,
    cancelMatchmaking,
    playCard,
    attack,
    endTurn,
    surrender,
    sendDiscoverChoice,
    sendScryDecision,
    summonSpecimen,
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
