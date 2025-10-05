import { useState } from 'react'
import { createInitialGameState, GameState, startTurn as engineStartTurn, endTurn as engineEndTurn, beginCombat, endCombat, setCardResolver, setPriorityWindow, playCard } from '@infradeck/shared'
import { BASIC_CARDS, BASIC_CARDS_BY_ID, CLASS_CARDS, CLASS_CARDS_BY_ID } from '@infradeck/shared'
import { useEffect } from 'react'


export function useGameEngine() {
    const [gameState, setGameState] = useState<GameState>(() => createInitialGameState())

    const localPlayerId = typeof window !== 'undefined'
        ? (localStorage.getItem('playerId') || 'player1') // TODO: auth real
        : 'player1'
    // Resolver de cartas y priority window → re-render
    const getCardById = (id: string) => BASIC_CARDS_BY_ID[id] ?? CLASS_CARDS_BY_ID[id]

    useEffect(() => {
        setCardResolver(getCardById)
        setPriorityWindow(() => {
        // Evita setState durante el render de otro componente
        setTimeout(() => setGameState(s => ({ ...s })), 0)
      })
    }, [])
     const meIndex = gameState.players[0].id === localPlayerId ? 0 : 1
     const currentPlayer = gameState.players[meIndex]
     const opponentPlayer = gameState.players[1 - meIndex]
     const isMyTurn = gameState.turn.currentPlayerIndex === meIndex

    const actions = {
        startTurn: () => {
                   if (!isMyTurn) return
            setGameState(prev => {
                const next: GameState = JSON.parse(JSON.stringify(prev))
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
                    engineEndTurn(next)     // cierra turno actual (cambia jugador y pone START)
                    engineStartTurn(next)   // entra automáticamente en MAIN del oponente
                    return next
                })
            },
    }

    return {
        gameState,
        setGameState,
        currentPlayer,
        opponentPlayer,
        actions,
        isMyTurn,
    }
}