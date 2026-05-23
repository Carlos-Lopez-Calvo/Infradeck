import React, { useState } from 'react'
import { GameBoard } from './GameBoard'
import { GameEngineContext } from '../context/GameEngineProvider'
import { useOnlineGame } from '../context/OnlineGameProvider'
import { UnifiedTargetModal, TargetType } from './UnifiedTargetModal'
import { DiscoverModal } from './DiscoverModal'
import { ScryModal } from './ScryModal'
import { getCardById } from '../utils/card-resolver'
import { GameEndOverlay } from './GameEndOverlay'
import { GameEndMenuModal } from './GameEndMenuModal'

type OnlineGameBoardProps = {
  onExitToMenu?: () => void
}

export function OnlineGameBoard({ onExitToMenu }: OnlineGameBoardProps) {
  const { 
    gameState, 
    isMyTurn, 
    playerId,
    playCard: onlinePlayCard,
    attack: onlineAttack,
    endTurn: onlineEndTurn,
    pendingTargetSelection,
    setPendingTargetSelection,
    pendingDiscoverSelection,
    setPendingDiscoverSelection,
    pendingScryDecision,
    setPendingScryDecision,
    sendDiscoverChoice,
    sendScryDecision,
    summonSpecimen: onlineSummonSpecimen,
    gameEnded,
    winner,
    resetGame,
    surrender,
  } = useOnlineGame()

  const [pauseMenuOpen, setPauseMenuOpen] = useState(false)

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-2xl">Esperando que el juego comience...</div>
      </div>
    )
  }

  // Determinar qué jugador soy yo
  const myPlayerIndex = gameState.players.findIndex(p => p.id === playerId)
  const opponentIndex = 1 - myPlayerIndex

  if (myPlayerIndex === -1) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-2xl text-red-500">Error: No se encontró el jugador</div>
      </div>
    )
  }

  const currentPlayer = gameState.players[myPlayerIndex]
  const opponentPlayer = gameState.players[opponentIndex]

  // Crear un contexto mock que simula el GameEngineProvider
  const mockContext = {
    gameState,
    setGameState: () => {}, // En modo online, los cambios se hacen vía WebSocket
    currentPlayer,
    opponentPlayer,
    isMyTurn,
    isGameOver: gameEnded,
    onMyLifeClick: () => setPauseMenuOpen(true),
    actions: {
      startTurn: () => {},
      endTurn: () => onlineEndTurn(),
      playFromHand: (handIndex: number) => onlinePlayCard(handIndex),
      attackHero: (attackerIndex: number) => onlineAttack(attackerIndex, 'hero'),
      attackCreature: (attackerIndex: number, targetIndex: number) => 
        onlineAttack(attackerIndex, 'creature', targetIndex),
      summonSpecimen: () => {
        const needsTarget = (currentPlayer.programmedSpecimenEffects ?? []).includes('DAMAGE_3_ON_ENTER')
        if (needsTarget) {
          setPendingTargetSelection({ handIndex: -1, targetType: 'CREATURE_ENEMY' })
          return
        }
        onlineSummonSpecimen()
      },
    }
  }

  // Convertir el targetType del servidor al tipo esperado por el modal
  const convertTargetType = (serverType: string): TargetType => {
    switch (serverType) {
      case 'CREATURE_ENEMY':
        return 'CREATURE_ENEMY'
      case 'CREATURE_FRIENDLY':
        return 'CREATURE_SELF'
      case 'CREATURE_ANY':
        return 'ANY_CREATURE'
      case 'HERO_ENEMY':
        return 'HERO_ENEMY'
      default:
        return 'CREATURE_ENEMY'
    }
  }

  const toTargetRefs = (selection: { type: string; playerType?: string; index?: number }) => {
    if (selection.type === 'HERO') {
      return [{ type: selection.playerType === 'SELF' ? 'HERO_SELF' : 'HERO_ENEMY' }]
    }
    return [{
      type: selection.playerType === 'SELF' ? 'CREATURE_SELF' : 'CREATURE_ENEMY',
      index: selection.index,
    }]
  }

  return (
    <>
      <GameEngineContext.Provider value={mockContext as any}>
        <GameBoard />
      </GameEngineContext.Provider>
      
      {/* Modal de selección de targets */}
      {pendingTargetSelection && (
        <UnifiedTargetModal
          title="Selecciona objetivo"
          subtitle="Elige un objetivo válido para tu carta"
          targetType={convertTargetType(pendingTargetSelection.targetType)}
          selfPlayer={{
            id: currentPlayer.id,
            name: currentPlayer.name,
            board: currentPlayer.board
          }}
          enemyPlayer={{
            id: opponentPlayer.id,
            name: opponentPlayer.name,
            board: opponentPlayer.board
          }}
          getCardById={getCardById}
          onSelect={(selection) => {
            const targets = toTargetRefs(selection)

            if (pendingTargetSelection.handIndex === -1) {
              onlineSummonSpecimen(targets)
            } else {
              onlinePlayCard(pendingTargetSelection.handIndex, targets)
            }

            setPendingTargetSelection(null)
          }}
          onCancel={() => {
            console.log('[ONLINE] Target selection cancelled')
            setPendingTargetSelection(null)
          }}
          step={1}
          maxStep={1}
        />
      )}

      {/* Modal de Discover (elegir entre opciones) */}
      {pendingDiscoverSelection && (
        <DiscoverModal
          isOpen={true}
          options={pendingDiscoverSelection.options}
          onSelect={(choiceId) => {
            console.log('[ONLINE] Discover choice selected:', choiceId)
            sendDiscoverChoice(pendingDiscoverSelection.handIndex, choiceId)
          }}
          onCancel={() => {
            console.log('[ONLINE] Discover cancelled')
            setPendingDiscoverSelection(null)
          }}
        />
      )}

      {/* Modal de Scry (ver y decidir sobre cartas del mazo) */}
      {pendingScryDecision && (
        <ScryModal
          isOpen={true}
          cardIds={pendingScryDecision.cards}
          onDecision={(decision) => {
            console.log('[ONLINE] Scry decision:', decision)
            sendScryDecision(pendingScryDecision.handIndex, decision)
          }}
          onCancel={() => {
            console.log('[ONLINE] Scry cancelled')
            setPendingScryDecision(null)
          }}
        />
      )}

      {gameEnded && winner !== null && (
        <GameEndOverlay
          isVictory={winner === myPlayerIndex}
          onExitToMenu={() => {
            resetGame()
            onExitToMenu?.()
          }}
        />
      )}

      {pauseMenuOpen && !gameEnded && (
        <GameEndMenuModal
          onSurrender={() => {
            setPauseMenuOpen(false)
            surrender()
          }}
          onResumeGame={() => setPauseMenuOpen(false)}
        />
      )}
    </>
  )
}
