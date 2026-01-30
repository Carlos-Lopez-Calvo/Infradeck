import React, { useState } from 'react'
import { GameBoard } from './GameBoard'
import { GameEngineContext } from '../context/GameEngineProvider'
import { useOnlineGame } from '../context/OnlineGameProvider'
import { UnifiedTargetModal, TargetType } from './UnifiedTargetModal'
import { getCardByIdGlobal } from '@infradeck/shared'

export function OnlineGameBoard() {
  const { 
    gameState, 
    isMyTurn, 
    playerId,
    playCard: onlinePlayCard,
    attack: onlineAttack,
    endTurn: onlineEndTurn,
    pendingTargetSelection,
    setPendingTargetSelection
  } = useOnlineGame()

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
    actions: {
      startTurn: () => {},
      endTurn: () => onlineEndTurn(),
      playFromHand: (handIndex: number) => onlinePlayCard(handIndex),
      attackHero: (attackerIndex: number) => onlineAttack(attackerIndex, 'hero'),
      attackCreature: (attackerIndex: number, targetIndex: number) => 
        onlineAttack(attackerIndex, 'creature', targetIndex),
      summonSpecimen: () => {
        console.log('summonSpecimen not implemented in online mode')
      }
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
        return 'CREATURE_ENEMY' // Por defecto enemigos
      case 'HERO_ENEMY':
        return 'CREATURE_ENEMY' // Reutilizamos el modal con héroes
      default:
        return 'CREATURE_ENEMY'
    }
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
          getCardById={getCardByIdGlobal}
          onSelect={(selection) => {
            console.log('[ONLINE] Target selected:', selection)
            
            // Convertir la selección al formato de TargetRef
            const targets: any[] = selection.type === 'HERO'
              ? [{ type: selection.playerType === 'SELF' ? 'HERO_SELF' : 'HERO_ENEMY' }]
              : [{ 
                  type: selection.playerType === 'SELF' ? 'CREATURE_SELF' : 'CREATURE_ENEMY', 
                  index: selection.index 
                }]
            
            // Enviar la carta con los targets al servidor
            onlinePlayCard(pendingTargetSelection.handIndex, targets)
            
            // Limpiar el estado del modal
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
    </>
  )
}
