// apps/web/src/store/GameEngineProvider.tsx
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  GameState, createGame, startGame,
  startTurn as engineStartTurn, endTurn as engineEndTurn,
  beginCombat, endCombat,
  setCardResolver, setPriorityWindow, playCard,
  BASIC_CARDS_BY_ID, CLASS_CARDS_BY_ID, declareAttackHero, declareAttackCreature,
} from '@infradeck/shared'
import { sampleDecks } from '../utils/sample-decks'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
 const BOT_ENABLED = true
 const processedTurnRefInit = null as string | null

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
    attackHero: (attackerBoardIndex: number) => void
    attackCreature: (attackerBoardIndex: number, defenderBoardIndex: number) => void
  }
}

const GameEngineContext = createContext<Ctx | null>(null)

export function GameEngineProvider({ children }: { children: React.ReactNode }) {
      const [gameState, setGameState] = useState<GameState>(() => {
    // Elige aquí los mazos a probar
    const p1Class = 'ABOMINACION' as const
    const p2Class = 'CAOS' as const
    const state = createGame(
        { id: 'player1', name: 'Player 1', classType: p1Class, deck: [...sampleDecks[p1Class]], programmedSpecimenEffects: [] },
        { id: 'player2', name: 'Player 2', classType: p2Class, deck: [...sampleDecks[p2Class]], programmedSpecimenEffects: [] },
      )
    startGame(state)
    return state
  })

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
  const processedTurnRef = useRef(processedTurnRefInit)
const botTurnKey = `${gameState.turn.turnNumber}:${gameState.turn.currentPlayerIndex}`

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
        {
            const i = next.turn.currentPlayerIndex
            next.players[i].board.forEach(c => { c.exhausted = false; c.damagedThisTurn = false })
            }
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
    attackHero: (attackerBoardIndex: number) => {
             if (!isMyTurn) return
             setGameState(prev => {
             const next: GameState = JSON.parse(JSON.stringify(prev))
             const res = declareAttackHero(next, next.turn.currentPlayerIndex, attackerBoardIndex)
             if (!res.ok) console.warn('attackHero failed:', res.error)
             return next
             })
        },
        attackCreature: (attackerBoardIndex: number, defenderBoardIndex: number) => {
             if (!isMyTurn) return
             setGameState(prev => {
             const next: GameState = JSON.parse(JSON.stringify(prev))
             const res = declareAttackCreature(next, next.turn.currentPlayerIndex, attackerBoardIndex, defenderBoardIndex)
             if (!res.ok) console.warn('attackCreature failed:', res.error)
             return next
             })
        },
  }), [isMyTurn, setGameState])

   useLayoutEffect(() => {
    if (!BOT_ENABLED) return
    const isBotTurn = !isMyTurn && (gameState.turn.phase === 'MAIN')
 if (!isBotTurn) return
  // Evita re-ejecutar el bot más de una vez por el mismo turno
  if (processedTurnRef.current === botTurnKey) return
  processedTurnRef.current = botTurnKey
    ;(async () => {
         // Jugar 1-2 cartas que pueda pagar
         for (let plays = 0; plays < 2; plays++) {
           let played = false
           setGameState(prev => {
             const next: GameState = JSON.parse(JSON.stringify(prev))
             const botIdx = next.turn.currentPlayerIndex
             if (botIdx === meIndex) return next
             const bot = next.players[botIdx]
             const handIdx = bot.hand.findIndex(id => {
             const card = getCardById(id)
             return card && bot.mana >= (card.mana ?? 0)
             })
             if (handIdx >= 0) {
             const res = playCard(next, botIdx, handIdx, getCardById)
             if (res.ok) played = true
             }
             return next
             })
             if (!played) break
             await delay(300)
             }
         // Combate: atacar héroe con todo lo que pueda
         setGameState(prev => {
             const next: GameState = JSON.parse(JSON.stringify(prev))
             if (next.turn.currentPlayerIndex === meIndex) return next
             beginCombat(next)
             return next
             })
             await delay(200)
             setGameState(prev => {
             const next: GameState = JSON.parse(JSON.stringify(prev))
             const botIdx = next.turn.currentPlayerIndex
             if (botIdx === meIndex) return next
             const bot = next.players[botIdx]
           for (let i = 0; i < bot.board.length; i++) {
             // Declarar ataque al héroe si no está exhausta
             if (!bot.board[i].exhausted && bot.board[i].attack > 0 && bot.board[i].health > 0) {
             // Preferimos atacar criatura rival 0 si existe y no tiene Sigilo; si no, héroe
             // Para simplificar: héroe
             declareAttackHero(next, botIdx, i)
             }
           }
           endCombat(next)
           return next
         })
         await delay(200)
         // Terminar turno del bot (esto activa automáticamente el MAIN del oponente en tu provider)
         setGameState(prev => {
           const next: GameState = JSON.parse(JSON.stringify(prev))
           if (next.turn.currentPlayerIndex !== meIndex) {
            engineEndTurn(next)
            engineStartTurn(next)
            const i = next.turn.currentPlayerIndex
            next.players[i].board.forEach(c => { c.exhausted = false; c.damagedThisTurn = false })
           }
           return next
         })
       })()
    }, [isMyTurn, gameState.turn.phase, botTurnKey])

  const value: Ctx = { gameState, setGameState, currentPlayer, opponentPlayer, isMyTurn, actions }
  return <GameEngineContext.Provider value={value}>{children}</GameEngineContext.Provider>
}

export function useGameEngine() {
  const ctx = useContext(GameEngineContext)
  if (!ctx) throw new Error('useGameEngine must be used within GameEngineProvider')
  return ctx
}