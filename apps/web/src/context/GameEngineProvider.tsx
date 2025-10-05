// apps/web/src/store/GameEngineProvider.tsx
import React, { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react'
import {
  createInitialGameState, GameState,
  startTurn as engineStartTurn, endTurn as engineEndTurn,
  beginCombat, endCombat,
  setCardResolver, setPriorityWindow, playCard,
  BASIC_CARDS_BY_ID, CLASS_CARDS_BY_ID
} from '@infradeck/shared'

type Ctx = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  currentPlayer: GameState['players'][number]
  opponentPlayer: GameState['players'][number]
  isMyTurn: boolean
  actions: {
    startTurn: () => void
    beginCombat: () => void
    endCombat: () => void
    endTurn: () => void
    playFromHand: (handIndex: number) => void
  }
}

const GameEngineContext = createContext<Ctx | null>(null)

export function GameEngineProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())

  const localPlayerId = typeof window !== 'undefined'
    ? (localStorage.getItem('playerId') || 'player1')
    : 'player1'

  const getCardById = (id: string) => BASIC_CARDS_BY_ID[id] ?? CLASS_CARDS_BY_ID[id]

  useLayoutEffect(() => {
    setCardResolver(getCardById)              // disponible antes del primer paint
    setPriorityWindow(() => setGameState(s => ({ ...s })))
  }, [])

  const meIndex = gameState.players[0].id === localPlayerId ? 0 : 1
  const currentPlayer = gameState.players[meIndex]
  const opponentPlayer = gameState.players[1 - meIndex]
  const isMyTurn = gameState.turn.currentPlayerIndex === meIndex

  const actions = useMemo(() => ({
    startTurn: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        engineStartTurn(next)
        return next
      })
    },
    beginCombat: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        beginCombat(next)
        return next
      })
    },
    endCombat: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        endCombat(next)
        return next
      })
    },
    endTurn: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        engineEndTurn(next)
        engineStartTurn(next)
        return next
      })
    },
    playFromHand: (handIndex: number) => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        const res = playCard(next, next.turn.currentPlayerIndex, handIndex, getCardById)
        if (!res.ok) console.warn('playCard failed:', res)
        return next
      })
    },
  }), [isMyTurn, setGameState])

  const value: Ctx = { gameState, setGameState, currentPlayer, opponentPlayer, isMyTurn, actions }
  return <GameEngineContext.Provider value={value}>{children}</GameEngineContext.Provider>
}

export function useGameEngine() {
  const ctx = useContext(GameEngineContext)
  if (!ctx) throw new Error('useGameEngine must be used within GameEngineProvider')
  return ctx
}