import { useState, useCallback, useEffect, useReducer } from 'react'
import { getCardById as getCardByIdHelper } from '../utils/gameHelpers'
import { sampleDecks } from '../utils/sample-decks'

import { 
  GameState,
  createInitialGameState,
  playCard as enginePlayCard,
  passPriority as enginePassPriority,
  beginCombat as engineBeginCombat,
  nextTurn as engineNextTurn,
  declareAttackHero as engineAttackHero,
  declareAttackCreature as engineAttackCreature,
  getStack,
  setCardResolver,
  hasFinalStandImmunity,
  summonSpecimen as engineSummonSpecimen,
  getCardByIdGlobal,
  
} from '@infradeck/shared'

type GetCardById = (id: string) => ReturnType<typeof getCardByIdHelper> | undefined;

const getCardById: GetCardById = (id: string) => {
  const card = getCardByIdHelper(id)
  return card && 'abilities' in card ? card : undefined
}

export function useGameEngine(selectedClass: keyof typeof sampleDecks = 'ABOMINACION') {
  const [gameState, dispatch] = useReducer(
    (prev: GameState & { _version?: number }, action: any) => ({ 
      ...prev, 
      _version: (prev._version || 0) + 1 
    }),
    undefined,  
    () => {     
      setCardResolver(getCardByIdGlobal)
      const initial = createInitialGameState()
      // Inicializa el mazo y la clase del jugador 0
      initial.players[0].deck = [...sampleDecks[selectedClass]]
      initial.players[0].classType = selectedClass
      // Inicializa el mazo y la clase del jugador 1 (por defecto CAOS, puedes cambiarlo)
      initial.players[1].deck = [...sampleDecks['CAOS']]
      initial.players[1].classType = 'CAOS'
      return { ...initial, _version: 0 }
    }
  )
  
  const updateGameState = useCallback(() => {
    dispatch({ type: 'UPDATE' })
  }, [])
  
  const [logs, setLogs] = useState<string[]>([])

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }, [])

  const findCardInHand = useCallback((cardId: string): number => {
    const hand = gameState.players[0].hand
    return hand.findIndex(card => card === cardId)
  }, [gameState])

  const playCard = useCallback((cardId: string, targetId?: string): boolean => {
    try {
      const cardIndex = findCardInHand(cardId)
      if (cardIndex === -1) {
        addLog(`Card not found in hand: ${cardId}`)
        return false
      }
      const options = targetId ? { 
        targets: [{ 
          type: 'ANY_CREATURE' as const, 
          owner: 'ENEMY' as const,
          index: 0
        }] 
      } : undefined

      const result = enginePlayCard(gameState, 0, cardIndex, getCardByIdGlobal, options)
      if (result.ok) {
        dispatch({ type: 'UPDATE' })
        addLog(`Played card: ${getCardById(cardId)?.name || cardId}`)
      } else {
        addLog(`Failed to play card: ${result.error}`)
      }
      return result.ok
    } catch (error) {
      console.error('Error playing card:', error)
      addLog(`Error playing card: ${String(error)}`)
      return false
    }
  }, [gameState, addLog, findCardInHand])

  const passPriority = useCallback(() => {
    try {
      enginePassPriority(gameState, 0)
      dispatch({ type: 'UPDATE' })
      addLog('Priority passed')
    } catch (error) {
      console.error('Error passing priority:', error)
      addLog(`Error passing priority: ${String(error)}`)
    }
  }, [gameState, addLog])

  const beginCombat = useCallback(() => {
    console.log('🔴 beginCombat called', {
      currentPlayer: gameState.turn.currentPlayerIndex,
      phase: gameState.turn.phase
    })
    if (gameState.turn.currentPlayerIndex === 0 && gameState.turn.phase === 'MAIN') {
      engineBeginCombat(gameState)
      dispatch({ type: 'UPDATE' })
      addLog(`Turn ${gameState.turn.turnNumber}: Combat phase begins`)
    } else {
      addLog(`Cannot begin combat: wrong player or phase`)
    }
  }, [gameState, addLog])

  const attackHero = useCallback((attackerBoardIndex: number) => {
    console.log('⚔️ attackHero called', { attackerBoardIndex, phase: gameState.turn.phase })
    if (gameState.turn.currentPlayerIndex !== 0) {
      addLog('Cannot attack: not your turn')
      return false
    }
    if (gameState.turn.phase !== 'COMBAT') {
      addLog('Cannot attack: not in combat phase')
      return false
    }
    try {
      const result = engineAttackHero(gameState, 0, attackerBoardIndex)
      if (result.ok) {
        dispatch({ type: 'UPDATE' })
        const attacker = gameState.players[0].board[attackerBoardIndex]
        if (attacker) {
          const card = getCardById(attacker.cardId)
          addLog(`⚔️ ${card?.name || 'Creature'} attacks opponent for ${'attack' in (card ?? {}) ? (card as any).attack : '?'} damage`)
        }
        return true
      } else {
        addLog(`❌ Attack failed: ${result.error}`)
        return false
      }
    } catch (error) {
      console.error('Error attacking hero:', error)
      addLog(`❌ Error attacking: ${String(error)}`)
      return false
    }
  }, [gameState, addLog])

  const attackCreature = useCallback((attackerBoardIndex: number, defenderBoardIndex: number) => {
    console.log('⚔️ attackCreature called', { attackerBoardIndex, defenderBoardIndex })
    if (gameState.turn.currentPlayerIndex !== 0) {
      addLog('Cannot attack: not your turn')
      return false
    }
    if (gameState.turn.phase !== 'COMBAT') {
      addLog('Cannot attack: not in combat phase')
      return false
    }
    try {
      const result = engineAttackCreature(gameState, 0, attackerBoardIndex, defenderBoardIndex)
      console.log('📋 Attack result:', result)
      if (result && result.ok) {
        dispatch({ type: 'UPDATE' })
        const attacker = gameState.players[0].board[attackerBoardIndex]
        const defender = gameState.players[1].board[defenderBoardIndex]
        if (attacker && defender) {
          const attackerCard = getCardById(attacker.cardId)
          const defenderCard = getCardById(defender.cardId)
          addLog(`⚔️ ${attackerCard?.name || 'Attacker'} attacks ${defenderCard?.name || 'Defender'}`)
        }
        return true
      } else {
        console.log('❌ Attack failed, result:', result)
        addLog(`❌ Attack failed: ${result?.error || 'Unknown error'}`)
        return false
      }
    } catch (error) {
      console.error('💥 Error attacking creature:', error)
      addLog(`❌ Error attacking: ${String(error)}`)
      return false
    }
  }, [gameState, addLog])

  const endTurn = useCallback(() => {
    console.log('🔵 endTurn called', {
      currentPlayer: gameState.turn.currentPlayerIndex,
      phase: gameState.turn.phase
    })
    if (gameState.turn.currentPlayerIndex === 0) {
      engineNextTurn(gameState)
      dispatch({ type: 'UPDATE' })
      addLog(`Turn ${gameState.turn.turnNumber}: Player ends turn`)
    } else {
      addLog(`Cannot end turn: not player's turn`)
    }
  }, [gameState, addLog])

 const summonSpecimen = useCallback(() => {
    const ok = engineSummonSpecimen(gameState, 0)
    if (ok) {
      dispatch({ type: 'UPDATE' })
    }
    return ok
  }, [gameState])

  useEffect(() => {
    if (gameState.turn.currentPlayerIndex === 1) {
      const timer = setTimeout(() => {
        const opponent = gameState.players[1]
        const playableCards = opponent.hand.filter(cardId => {
          const card = getCardById(cardId)
          return card && card.mana <= opponent.mana
        })
        if (playableCards.length > 0 && Math.random() > 0.3) {
          const randomCard = playableCards[
            Math.floor(Math.random() * playableCards.length)
          ]
          const handIndex = opponent.hand.indexOf(randomCard)
          try {
            const result = enginePlayCard(gameState, 1, handIndex, getCardByIdGlobal)
            if (result.ok) {
              dispatch({ type: 'UPDATE' })
              const card = getCardById(randomCard)
              addLog(`🤖 Opponent plays ${card?.name || randomCard}`)
            }
          } catch (error) {
            console.error('AI play error:', error)
          }
        }
        setTimeout(() => {
          engineNextTurn(gameState)
          dispatch({ type: 'UPDATE' })
          addLog('🤖 Opponent ends turn')
        }, 1000)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState.turn.currentPlayerIndex, gameState.turn.turnNumber, addLog])

  useEffect(() => {
    if (gameState.players[0].life <= 0) {
      addLog('💀 GAME OVER - You lose!')
      // Mostrar modal de derrota
    } else if (gameState.players[1].life <= 0) {
      addLog('🎉 VICTORY - You win!')
      // Mostrar modal de victoria
    }
  }, [gameState.players[0].life, gameState.players[1].life, addLog])

  return {
    gameState,
    logs,
    actions: {
      playCard,
      passPriority,
      beginCombat,
      endTurn,
      attackHero,
      attackCreature,
      summonSpecimen
    },
    stack: getStack(gameState),
  }
}