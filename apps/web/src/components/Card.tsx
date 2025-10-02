import { motion } from 'framer-motion'
import { Card as CardType } from '@infradeck/shared'
import { getCardStyling, isCardPlayable, getCardTypeInfo, formatAbilities } from '../utils/cardHelpers'
import { CARD_DIMENSIONS } from '../utils/constants'
import clsx from 'clsx'

const ANIMATION_VARIANTS = {
  cardEntrance: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 }
  },
  cardHover: { scale: 1.05, y: -4 },
  cardTap: { scale: 0.95 }
}

interface CardProps {
  card: CardType
  isPlayable?: boolean
  isInHand?: boolean
  onClick?: () => void
  className?: string
}

export function Card({ 
  card, 
  isPlayable = false, 
  isInHand = false,
  onClick, 
  className 
}: CardProps) {
  const styling = getCardStyling(card.classType)
  const typeInfo = getCardTypeInfo(card)
  const abilities = formatAbilities(card.abilities)
  
  const cardSize = isInHand ? CARD_DIMENSIONS.hand : CARD_DIMENSIONS.field

  return (
    <motion.div
      className={clsx(
        // Base styles
        'relative rounded-lg border-2 bg-gradient-to-b cursor-pointer',
        'flex flex-col p-2 text-xs text-white overflow-hidden',
        cardSize,
        
        // Class-based styling
        styling.bg,
        styling.border,
        
        // Interactive states
        {
          [styling.shadow]: isPlayable,
          'border-green-400 shadow-green-400/50 shadow-lg': isPlayable,
          'opacity-50 cursor-not-allowed': !isPlayable && onClick,
          'hover:scale-105 hover:-translate-y-1 transition-all duration-200': isPlayable
        },
        
        className
      )}
      variants={ANIMATION_VARIANTS.cardEntrance}
      initial="initial"
      animate="animate"
      whileHover={isPlayable ? ANIMATION_VARIANTS.cardHover : undefined}
      whileTap={isPlayable ? ANIMATION_VARIANTS.cardTap : undefined}
      onClick={isPlayable ? onClick : undefined}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-white truncate flex-1 text-xs">
          {card.name}
        </span>
        <div className="bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
          {card.mana}
        </div>
      </div>

      {/* Card Art Placeholder */}
      <div className="bg-black/30 rounded h-12 mb-1 flex items-center justify-center">
        <span className="text-xs opacity-70 capitalize">{typeInfo.displayType}</span>
      </div>


      {/* Abilities */}
      {abilities && (
        <div className="text-xs font-semibold text-yellow-300 mb-1">
          {abilities}
        </div>
      )}

      {/* Description */}
      <div className="flex-1 text-xs opacity-80 overflow-hidden">
        <p className="line-clamp-2 leading-tight">{card.description}</p>
      </div>

      {/* Class indicator */}
      {card.classType && (
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full opacity-75"
             style={{ backgroundColor: `var(--${styling.primary})` }}
        />
      )}

      {/* Playable indicator */}
      {isPlayable && (
        <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse pointer-events-none" />
      )}

      {card.type === 'CREATURE' && (
        <div className="absolute bottom-1 right-1 flex gap-1">
          <div className="bg-red-600/90 px-1 py-0.5 rounded text-xs text-white font-bold shadow-sm">
            {card.attack}
          </div>
          <div className="bg-green-600/90 px-1 py-0.5 rounded text-xs text-white font-bold shadow-sm">
            {card.health}
          </div>
        </div>
      )}
    </motion.div>
  )
}