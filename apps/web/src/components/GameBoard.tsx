import { motion } from 'framer-motion'
import { useGameEngine } from '../hooks/useGameEngine'
import { Hand } from './Hand'
import { Card } from './Card'
import { hasFinalStandImmunity } from '@infradeck/shared'
import { getCardById } from '../utils/gameHelpers'
import React, { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'

export function GameBoard() {
  const { gameState, logs, actions, stack } = useGameEngine()
  
  const [combatState, setCombatState] = useState<{
    attackingCreatureIndex: number | null
    targetingMode: 'HERO' | 'CREATURE' | null
  }>({
    attackingCreatureIndex: null,
    targetingMode: null
  })

  const [spellTargeting, setSpellTargeting] = useState<{
    cardId: string
    needsTarget: boolean
  } | null>(null)

  const [shownFinalStand, setShownFinalStand] = useState([false, false])
  const [showFinalStand, setShowFinalStand] = useState(false)
  const lastLife = useRef([gameState.players[0].life, gameState.players[1].life])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    gameState.players.forEach((p, idx) => {
      const prevLife = lastLife.current[idx]
      const nowLife = p.life
      const activated = p.finalStand?.used

      if (
        prevLife > 0 &&
        nowLife === 1 &&
        activated &&
        !shownFinalStand[idx]
      ) {
        setShowFinalStand(true)
        setShownFinalStand(prev => {
          const copy = [...prev]
          copy[idx] = true
          return copy
        })
        setTimeout(() => {
          setShowFinalStand(false)
        }, 5000)
      }
      lastLife.current[idx] = nowLife
    })
  }, [
    gameState.players[0].life,
    gameState.players[1].life,
    gameState.players[0].finalStand?.used,
    gameState.players[1].finalStand?.used,
    shownFinalStand
  ])

  useEffect(() => {
    if (showFinalStand !== null) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setShowFinalStand(false)
        timerRef.current = null
      }, 5000)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [showFinalStand])

  const player = gameState.players[0]
  const specimenSummons = player.specimenSummons ?? 0
  const specimenCost = Math.min(10, 5 + 2 * specimenSummons)
  const specimenCardId = 'Especimen_Perfecto' // ID real del espécimen

  // Lógica para saber si puedes invocar el espécimen
  const canSummonSpecimen =
    player.classType === 'ABOMINACION' &&
    player.mana >= specimenCost &&
    /* añade aquí cualquier otra condición necesaria, por ejemplo: */
    // player.board.length < maxBoardSize
    true // <-- elimina o ajusta según tu lógica

  const opponent = gameState.players[1]
  const isPlayerTurn = gameState.turn.currentPlayerIndex === 0
  const isCombatPhase = gameState.turn.phase === 'COMBAT'

  const handleCreatureClick = (creatureIndex: number, isPlayerCreature: boolean) => {
    if (spellTargeting) {
      const targetId = isPlayerCreature 
        ? `player-creature-${creatureIndex}`
        : `opponent-creature-${creatureIndex}`
      actions.playCard(spellTargeting.cardId, targetId)
      setSpellTargeting(null)
      return
    }
    if (!isPlayerTurn || !isCombatPhase) return
    if (isPlayerCreature) {
      const creature = player.board[creatureIndex]
      if (!creature || creature.exhausted) return
      setCombatState({
        attackingCreatureIndex: creatureIndex,
        targetingMode: 'CREATURE'
      })
    } else {
      if (combatState.attackingCreatureIndex !== null) {
        actions.attackCreature(combatState.attackingCreatureIndex, creatureIndex)
        setCombatState({
          attackingCreatureIndex: null,
          targetingMode: null
        })
      }
    }
  }

  const handleHeroClick = () => {
    if (spellTargeting) {
      actions.playCard(spellTargeting.cardId, 'opponent-hero')
      setSpellTargeting(null)
      return
    }
    if (!isPlayerTurn || !isCombatPhase) return
    if (combatState.attackingCreatureIndex !== null) {
      actions.attackHero(combatState.attackingCreatureIndex)
      setCombatState({
        attackingCreatureIndex: null,
        targetingMode: null
      })
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Game Header */}
      <div className="flex justify-between items-center p-4 bg-slate-800/80 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Infradeck</h1>
          <div className="text-sm text-slate-400">
            Turn: {gameState.turn.turnNumber} | Phase: {gameState.turn.phase}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {stack.length > 0 && (
            <div className="bg-orange-600 px-3 py-1 rounded text-white text-sm">
              Stack: {stack.length}
            </div>
          )}
          <div className={clsx(
            'px-3 py-1 rounded text-sm font-bold',
            isPlayerTurn 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          )}>
            {isPlayerTurn ? 'Your Turn' : 'Opponent Turn'}
          </div>
          <button
            onClick={() => {
              if (isPlayerTurn) {
                if (gameState.turn.phase === 'MAIN') {
                  actions.beginCombat()
                } else if (gameState.turn.phase === 'COMBAT') {
                  actions.endTurn()
                }
              }
            }}
            disabled={!isPlayerTurn}
            className={clsx(
              'px-4 py-2 rounded text-sm font-bold transition-colors',
              isPlayerTurn 
                ? gameState.turn.phase === 'MAIN'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
            )}
          >
            {!isPlayerTurn 
              ? 'Opponent Turn' 
              : gameState.turn.phase === 'MAIN' 
                ? 'Go to Combat' 
                : 'End Turn'
            }
          </button>
          <button onClick={() => setShowFinalStand(true)}>Test Final Stand Overlay</button>
          {isCombatPhase && combatState.attackingCreatureIndex !== null && (
            <div className="bg-yellow-600 px-3 py-1 rounded text-white text-sm animate-pulse">
              Select Target
            </div>
          )}
          {spellTargeting && (
            <div className="bg-purple-600 px-3 py-1 rounded text-white text-sm animate-pulse">
              🎯 Select Target for Spell
            </div>
          )}
          {spellTargeting && (
            <button
              onClick={() => {
                setSpellTargeting(null)
              }}
              className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-white text-xs"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Opponent Area */}
        <div className="p-4 bg-red-900/20 border-b border-red-800">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-red-300">{opponent.name}</h3>
              <div className="flex items-center gap-2">
                <motion.div 
                  className={clsx(
                    "bg-red-600 px-2 py-1 rounded text-white text-sm transition-all",
                    (isCombatPhase && isPlayerTurn && combatState.attackingCreatureIndex !== null) ||
                    spellTargeting
                      ? "ring-2 ring-yellow-400 hover:ring-yellow-300 cursor-pointer"
                      : ""
                  )}
                  onClick={handleHeroClick}
                  whileHover={
                    ((isCombatPhase && combatState.attackingCreatureIndex !== null) || spellTargeting)
                      ? { scale: 1.05, filter: "brightness(1.2)" } 
                      : {}
                  }
                >
                  ❤️ {opponent.life}
                </motion.div>
                <div className="bg-blue-600 px-2 py-1 rounded text-white text-sm">
                  🔷 {opponent.mana}
                </div>
              </div>
            </div>
            <div className="text-sm text-red-400">
              Hand: {opponent.hand.length} | Deck: {opponent.deck.length}
            </div>
          </div>
          <div className="min-h-24 bg-red-900/30 rounded-lg p-2 border border-red-800">
            <div className="flex gap-2 flex-wrap">
              {opponent.board.length === 0 ? (
                <div className="text-red-400 text-sm italic w-full text-center py-4">
                  No creatures in play
                </div>
              ) : (
                opponent.board.map((creature, index) => {
                  const card = getCardById(creature.cardId)
                  if (!card || !('abilities' in card)) return null
                  const isValidCombatTarget = isCombatPhase && isPlayerTurn && combatState.attackingCreatureIndex !== null
                  const isValidSpellTarget = spellTargeting !== null
                  const isValidTarget = isValidCombatTarget || isValidSpellTarget
                  return (
                    <motion.div
                      key={`opponent-${creature.cardId}-${index}`}
                      onClick={() => handleCreatureClick(index, false)}
                      className={clsx(
                        isValidTarget && "cursor-pointer"
                      )}
                      whileHover={isValidTarget ? { scale: 1.05 } : {}}
                    >
                      <Card
                        card={card}
                        isPlayable={false}
                        isInHand={false}
                        className={clsx(
                          "opacity-80 transition-all",
                          creature.exhausted && "grayscale",
                          isValidCombatTarget && "ring-2 ring-yellow-400 hover:ring-yellow-300 brightness-110",
                          isValidSpellTarget && "ring-2 ring-purple-400 hover:ring-purple-300 brightness-110"
                        )}
                      />
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Battle Zone / Stack */}
        <div className="flex-1 flex items-center justify-center p-4">
          {stack.length > 0 ? (
            <motion.div 
              className="bg-orange-900/50 rounded-lg p-4 border border-orange-600"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h4 className="text-orange-300 font-bold mb-2 text-center">Stack</h4>
              <div className="flex gap-2">
                {stack.map((stackItem, index) => {
                  const card = stackItem.cardData
                  const displayName = card ? card.name : stackItem.sourceId
                  const displayDescription = card ? card.description : `${stackItem.type} effect`
                  return (
                    <div
                      key={index}
                      className="bg-orange-800 p-2 rounded border border-orange-600 text-white text-sm max-w-48"
                    >
                      <div className="font-bold">{displayName}</div>
                      <div className="text-xs opacity-80">{displayDescription}</div>
                      <div className="text-xs mt-1 text-orange-300">
                        Player {stackItem.playerIndex + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <div className="text-slate-500 italic text-center">
              {spellTargeting 
                ? "🎯 Select a target for your spell"
                : isCombatPhase && combatState.attackingCreatureIndex !== null
                  ? "🎯 Click on opponent's hero or creatures to attack"
                  : "Battle zone - Play your cards here"
              }
            </div>
          )}
        </div>

        {/* Player Field */}
        <div className="p-4 bg-green-900/20 border-t border-green-800">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-green-400">
              Hand: {player.hand.length} | Deck: {player.deck.length}
            </div>
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-green-300">{player.name}</h3>
              <div className="flex items-center gap-2">
                <div className="bg-red-600 px-2 py-1 rounded text-white text-sm">
                  ❤️ {player.life}
                </div>
                <div className="bg-blue-600 px-2 py-1 rounded text-white text-sm">
                  🔷 {player.mana}
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-24 bg-green-900/30 rounded-lg p-2 border border-green-800 mb-4">
            <div className="flex gap-2 flex-wrap">
              {player.board.length === 0 ? (
                <div className="text-green-400 text-sm italic w-full text-center py-4">
                  No creatures in play
                </div>
              ) : (
                player.board.map((creature, index) => {
                  const card = getCardById(creature.cardId)
                  if (!card || !('abilities' in card)) return null
                  const canAttack = isCombatPhase && isPlayerTurn && !creature.exhausted
                  const isSelected = combatState.attackingCreatureIndex === index
                  const isValidSpellTarget = spellTargeting !== null
                  return (
                    <motion.div
                      key={`player-${creature.cardId}-${index}`}
                      onClick={() => handleCreatureClick(index, true)}
                      className={clsx(
                        (canAttack || isValidSpellTarget) && "cursor-pointer"
                      )}
                      whileHover={canAttack || isValidSpellTarget ? { scale: 1.05 } : {}}
                    >
                      <Card
                        card={card}
                        isPlayable={false}
                        isInHand={false}
                        className={clsx(
                          "transition-all",
                          creature.exhausted && "grayscale opacity-50",
                          canAttack && "brightness-110 hover:brightness-125",
                          isSelected && "ring-2 ring-green-400 brightness-125",
                          isValidSpellTarget && "ring-2 ring-purple-400 hover:ring-purple-300"
                        )}
                      />
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <Hand
  cards={player.hand}
  availableMana={player.mana}
  onCardPlay={(cardId) => {
    const card = getCardById(cardId)
    if (card && card.type === 'SPELL' && 'targeting' in card && card.targeting && card.targeting !== 'NONE') {
      setSpellTargeting({ cardId, needsTarget: true })
    } else {
      actions.playCard(cardId)
    }
  }}
  canSummonSpecimen={canSummonSpecimen}
  specimenCost={specimenCost}
  onSummonSpecimen={() => {
    actions.playCard('Especimen_Perfecto')
  }}
  specimenCardId={'Especimen_Perfecto'}
  classType={player.classType}
/>

        {/* Final Stand Indicators */}
        {showFinalStand && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(80,0,120,0.25)' }}
          >
            <div className="bg-purple-900/90 border-4 border-yellow-400 rounded-xl px-8 py-6 text-center shadow-xl animate-pulse">
              <div className="text-3xl font-bold text-yellow-300 mb-2">
                ⚡ FINAL STAND ⚡
              </div>
              <div className="text-lg text-white">
                ¡Un jugador ha entrado en Final Stand!<br />
                <span className="text-yellow-200">¡Vida máxima reducida a 10!</span>
              </div>
              <div className="mt-4 text-xs text-gray-200">
                Se cerrará automáticamente
              </div>
            </div>
          </div>
        )}

        {player.finalStand?.used && (
          <div className="text-sm text-purple-300 mt-1">
            Bonus de clase activo: <span className="font-bold">{player.classType}</span>
          </div>
        )}
      </div>
    </div>
  )
}