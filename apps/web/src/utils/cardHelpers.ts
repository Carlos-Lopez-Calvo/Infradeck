import { Card, CardType, ClassType } from '@infradeck/shared'
import { CLASS_COLORS, BASIC_CARD_COLORS } from './constants'

/**
 * Get class-specific styling for a card
 */
/**
 * Get class-specific styling for a card
 */
export function getCardStyling(classType?: ClassType) {
  if (!classType) {
    return BASIC_CARD_COLORS
  }
  
  // ✅ Type-safe lookup con default fallback
  const validClassTypes = ['ABOMINACION', 'CAOS', 'CICLO', 'VITALIDAD'] as const
  
  if (validClassTypes.includes(classType as any)) {
    return CLASS_COLORS[classType as keyof typeof CLASS_COLORS]
  }
  
  return BASIC_CARD_COLORS
}

/**
 * Check if a card is playable given current game state
 */
export function isCardPlayable(card: Card, availableMana: number): boolean {
  return card.mana <= availableMana
}

/**
 * Get card type display info
 */
export function getCardTypeInfo(card: Card) {
  return {
    isCreature: card.type === CardType.CREATURE,
    isSpell: card.type === CardType.SPELL,
    isInstant: card.type === CardType.INSTANT,
    displayType: card.type.toLowerCase()
  }
}

/**
 * Format card abilities for display
 */
export function formatAbilities(abilities?: string[]): string {
  if (!abilities || abilities.length === 0) return ''
  return abilities.join(', ')
}

/**
 * Get short description for card (truncated)
 */
export function getShortDescription(description: string, maxLength: number = 60): string {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength) + '...'
}

/**
 * Get card rarity styling
 */
export function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'BASIC': return 'text-gray-400'
    case 'RARE': return 'text-blue-400' 
    case 'LEGENDARY': return 'text-orange-400'
    default: return 'text-gray-400'
  }
}