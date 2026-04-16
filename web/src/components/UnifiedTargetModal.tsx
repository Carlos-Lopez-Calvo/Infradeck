/**
 * MODAL UNIFICADO DE SELECCIÓN DE OBJETIVOS
 * 
 * Una sola interfaz para seleccionar cualquier tipo de objetivo:
 * - Criaturas enemigas
 * - Criaturas aliadas  
 * - Héroe enemigo
 * - Héroe aliado
 * - Múltiples objetivos (ej: atacante + defensor)
 */

import React from 'react'
import { Card as UICard } from './Card'

export type TargetType = 
  | 'HERO_SELF'           // Solo héroe aliado
  | 'HERO_ENEMY'          // Solo héroe enemigo
  | 'CREATURE_SELF'       // Solo criaturas aliadas
  | 'CREATURE_ENEMY'      // Solo criaturas enemigas
  | 'CHARACTER_ENEMY'     // Héroe enemigo + criaturas enemigas
  | 'ANY_CREATURE'        // Cualquier criatura (aliada o enemiga)
  | 'ANY_CHARACTER'       // Cualquier objetivo (héroes + criaturas)
  | 'DUAL_CREATURES'      // Dos criaturas (ej: atacante + defensor para ATTACK_SPELL)

export interface UnifiedTargetModalProps {
  title: string
  subtitle?: string
  targetType: TargetType
  
  // Información del juego
  selfPlayer: {
    id: string
    name: string
    board: Array<{ id: string; cardId: string; attack: number; health: number; abilities: string[] }>
  }
  enemyPlayer: {
    id: string
    name: string
    board: Array<{ id: string; cardId: string; attack: number; health: number; abilities: string[] }>
  }
  
  // Función para obtener la carta por ID
  getCardById: (id: string) => any
  
  // Callbacks
  onSelect: (selection: TargetSelection) => void
  onCancel: () => void
  
  // Opcionales
  step?: number  // Para selecciones en múltiples pasos (ej: DUAL_CREATURES)
  maxStep?: number
  previousSelection?: any  // Para guardar la selección previa en multi-step
}

export type TargetSelection = 
  | { type: 'HERO'; playerType: 'SELF' | 'ENEMY' }
  | { type: 'CREATURE'; playerType: 'SELF' | 'ENEMY'; index: number }
  | { type: 'DUAL'; attacker: { playerType: 'SELF'; index: number }; defender: { playerType: 'ENEMY'; index: number } }

export function UnifiedTargetModal({
  title,
  subtitle,
  targetType,
  selfPlayer,
  enemyPlayer,
  getCardById,
  onSelect,
  onCancel,
  step = 1,
  maxStep = 1,
  previousSelection
}: UnifiedTargetModalProps) {
  
  // Determinar qué mostrar según el targetType
  const shouldShowSelfHero = ['HERO_SELF', 'ANY_CHARACTER'].includes(targetType)
  const shouldShowEnemyHero = ['HERO_ENEMY', 'CHARACTER_ENEMY', 'ANY_CHARACTER'].includes(targetType)
  const shouldShowSelfCreatures = ['CREATURE_SELF', 'ANY_CREATURE', 'ANY_CHARACTER', 'DUAL_CREATURES'].includes(targetType)
  const shouldShowEnemyCreatures = ['CREATURE_ENEMY', 'CHARACTER_ENEMY', 'ANY_CREATURE', 'ANY_CHARACTER', 'DUAL_CREATURES'].includes(targetType)
  
  // Para DUAL_CREATURES (como ATTACK_SPELL)
  const isDualSelection = targetType === 'DUAL_CREATURES'
  const isSelectingAttacker = isDualSelection && step === 1
  const isSelectingDefender = isDualSelection && step === 2

  // Título dinámico para selección dual
  const displayTitle = isDualSelection 
    ? (isSelectingAttacker ? 'Selecciona tu atacante' : 'Selecciona el defensor')
    : title

  const displaySubtitle = isDualSelection
    ? (isSelectingAttacker ? 'Elige la criatura aliada que atacará' : 'Elige la criatura enemiga que será atacada')
    : subtitle

  // Color del borde según el tipo de selección
  const borderColor = isDualSelection
    ? (isSelectingAttacker ? 'border-green-400' : 'border-red-400')
    : 'border-blue-400'

  const handleHeroClick = (playerType: 'SELF' | 'ENEMY') => {
    onSelect({ type: 'HERO', playerType })
  }

  const handleCreatureClick = (playerType: 'SELF' | 'ENEMY', index: number) => {
    if (isDualSelection) {
      if (isSelectingAttacker) {
        // Pasar a seleccionar defensor
        onSelect({ 
          type: 'DUAL' as any, 
          attacker: { playerType: 'SELF', index },
          defender: null as any
        })
      } else {
        // Completar la selección dual
        onSelect({
          type: 'DUAL',
          attacker: previousSelection?.attacker || { playerType: 'SELF', index: 0 },
          defender: { playerType: 'ENEMY', index }
        })
      }
    } else {
      onSelect({ type: 'CREATURE', playerType, index })
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 text-white">
      <div className={`bg-gray-900 rounded-xl border-2 ${borderColor} px-6 py-5 shadow-2xl w-[95%] max-w-5xl text-center`}>
        
        {/* Header */}
        <div className="mb-6">
          <div className={`text-3xl font-bold mb-2 ${
            isDualSelection 
              ? (isSelectingAttacker ? 'text-green-300' : 'text-red-300')
              : 'text-blue-300'
          }`}>
            {displayTitle}
          </div>
          {displaySubtitle && (
            <div className="text-lg text-gray-300">{displaySubtitle}</div>
          )}
          {isDualSelection && maxStep > 1 && (
            <div className="text-sm text-gray-400 mt-2">
              Paso {step} de {maxStep}
            </div>
          )}
        </div>

        {/* Contenido - Grid con secciones */}
        <div className="space-y-6">
          
          {/* Héroes */}
          {(shouldShowSelfHero || shouldShowEnemyHero) && (
            <div className="flex justify-center gap-8">
              {shouldShowSelfHero && (
                <button
                  className="px-6 py-3 rounded-lg border-2 border-blue-400 hover:bg-blue-500/10 text-blue-300 font-semibold text-lg transition"
                  onClick={() => handleHeroClick('SELF')}
                >
                  🛡️ Tu Héroe
                </button>
              )}
              {shouldShowEnemyHero && (
                <button
                  className="px-6 py-3 rounded-lg border-2 border-red-400 hover:bg-red-500/10 text-red-300 font-semibold text-lg transition"
                  onClick={() => handleHeroClick('ENEMY')}
                >
                  ⚔️ Héroe Enemigo
                </button>
              )}
            </div>
          )}

          {/* Criaturas Enemigas */}
          {shouldShowEnemyCreatures && (!isDualSelection || isSelectingDefender) && enemyPlayer.board.length > 0 && (
            <div>
              <div className="text-lg font-semibold text-red-300 mb-3">
                🎯 Criaturas Enemigas
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-center">
                {enemyPlayer.board.map((creature, idx) => {
                  const card = getCardById(creature.cardId)
                  const preview = card ? {
                    ...card,
                    attack: creature.attack,
                    health: creature.health,
                    abilities: creature.abilities
                  } : null

                  return (
                    <button
                      key={creature.id}
                      className="rounded-lg border border-red-400 hover:bg-red-500/10 hover:border-red-300 hover:scale-105 p-2 transition transform"
                      onClick={() => handleCreatureClick('ENEMY', idx)}
                    >
                      {preview && <UICard card={preview as any} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Criaturas Aliadas */}
          {shouldShowSelfCreatures && (!isDualSelection || isSelectingAttacker) && selfPlayer.board.length > 0 && (
            <div>
              <div className="text-lg font-semibold text-green-300 mb-3">
                🛡️ Tus Criaturas
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-center">
                {selfPlayer.board.map((creature, idx) => {
                  const card = getCardById(creature.cardId)
                  const preview = card ? {
                    ...card,
                    attack: creature.attack,
                    health: creature.health,
                    abilities: creature.abilities
                  } : null

                  // Para DUAL_CREATURES (atacante), solo mostrar criaturas válidas
                  const canAttack = !isDualSelection || (creature.attack > 0 && creature.health > 0)

                  return (
                    <button
                      key={creature.id}
                      className={`rounded-lg border p-2 transition transform ${
                        canAttack
                          ? 'border-green-400 hover:bg-green-500/10 hover:border-green-300 hover:scale-105'
                          : 'border-gray-600 opacity-50 cursor-not-allowed'
                      }`}
                      disabled={!canAttack}
                      onClick={() => canAttack && handleCreatureClick('SELF', idx)}
                    >
                      {preview && <UICard card={preview as any} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Mensaje si no hay objetivos */}
          {shouldShowEnemyCreatures && enemyPlayer.board.length === 0 && 
           shouldShowSelfCreatures && selfPlayer.board.length === 0 && (
            <div className="text-gray-400 text-center py-8">
              No hay criaturas disponibles
            </div>
          )}
        </div>

        {/* Footer - Botones */}
        <div className="mt-6 flex justify-center gap-4">
          {isDualSelection && step > 1 && (
            <button
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white transition"
              onClick={onCancel}
            >
              ← Volver
            </button>
          )}
          <button
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
