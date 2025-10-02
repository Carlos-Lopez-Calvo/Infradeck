import { motion } from 'framer-motion'
import { Card } from './Card'
import { getCardById } from '../utils/gameHelpers'
import { isCardPlayable } from '../utils/cardHelpers'
import clsx from 'clsx'

interface HandProps {
  cards: string[]  // Array of card IDs in hand
  availableMana: number
  onCardPlay: (cardId: string) => void
  maxHandSize?: number
  className?: string
}

export function Hand({ 
  cards, 
  availableMana, 
  onCardPlay, 
  maxHandSize = 10,
  className 
}: HandProps) {
  const isHandFull = cards.length >= maxHandSize

  return (
    <div className={clsx(
      'relative flex items-end justify-center p-4 bg-slate-800/50 rounded-t-lg border-t-2 border-slate-700',
      className
    )}>
      {/* Hand size indicator */}
      <div className="absolute top-2 right-4 text-xs text-slate-400">
        {cards.length}/{maxHandSize}
        {isHandFull && (
          <span className="ml-2 text-red-400 font-bold">FULL</span>
        )}
      </div>

      {/* Cards container */}
      <div className="flex gap-1 overflow-x-auto max-w-full">
        {cards.length === 0 ? (
          // Empty hand state
          <div className="text-slate-500 text-sm italic py-8">
            No cards in hand
          </div>
        ) : (
          cards.map((cardId, index) => {
            const card = getCardById(cardId)
            
            if (!card) {
              console.warn(`Card not found: ${cardId}`)
              return null
            }

            // Check if card has required properties for isCardPlayable
            if (!('abilities' in card)) {
              console.warn(`Card ${cardId} is not a playable card type`)
              return null
            }

            const playable = isCardPlayable(card, availableMana)

            return (
              <motion.div
                key={`${cardId}-${index}`}
                initial={{ 
                  opacity: 0, 
                  y: 50, 
                  scale: 0.8,
                  rotateZ: Math.random() * 20 - 10 // Random slight rotation
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotateZ: 0
                }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                whileHover={{
                  y: -8,
                  scale: 1.05,
                  zIndex: 10,
                  transition: { duration: 0.2 }
                }}
                className="transform-gpu" // GPU acceleration
                style={{
                  // Fan out effect for many cards
                  transformOrigin: 'bottom center',
                  rotate: cards.length > 5 ? `${(index - cards.length/2) * 2}deg` : '0deg'
                }}
              >
                <Card
                  card={card}
                  isPlayable={playable}
                  isInHand={true}
                  onClick={() => playable && onCardPlay(cardId)}
                  className={clsx(
                    'transition-all duration-200',
                    {
                      'hover:shadow-2xl': playable,
                      'hover:shadow-green-400/50': playable
                    }
                  )}
                />
              </motion.div>
            )
          })
        )}
      </div>

      {/* Mana indicator */}
      <div className="absolute top-2 left-4 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{availableMana}</span>
          </div>
          <span className="text-xs text-slate-400">Mana</span>
        </div>
      </div>

      {/* Play hint */}
      {cards.some(cardId => {
        const card = getCardById(cardId)
        return card && 'abilities' in card && isCardPlayable(card, availableMana)
      }) && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-600 text-white px-2 py-1 rounded text-xs animate-pulse">
            Click playable cards to play them!
          </div>
        </div>
      )}
    </div>
  )
}