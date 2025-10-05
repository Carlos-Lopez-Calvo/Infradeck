import { useState } from 'react'
import { createInitialGameState, GameState } from '@infradeck/shared'


export function useGameEngine() {
    const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())

  const activePlayerIndex = gameState.turn.currentPlayerIndex
const currentPlayer = gameState.players[activePlayerIndex]
const opponentPlayer = gameState.players[1 - activePlayerIndex]
    return {
        gameState,
        setGameState,
        currentPlayer,
        opponentPlayer,
    }
}