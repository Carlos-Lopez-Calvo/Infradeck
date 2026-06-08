import { BASIC_CARDS } from '../cards/basic-cards'
import { CLASS_CARDS } from '../cards/class-cards'
import type { Card } from '../types/cards'
import { CardRarity, ClassType, GAME_CONSTANTS, type DeckValidation, type DeckValidationError } from '../types/cards'
import { isNonCollectibleCardId } from './deck-catalog'

/** Ids permitidos en un mazo: todas las básicas + cartas de la clase elegida (sin Espécimen ni tokens). */
export function legalCardIdsForDeckClass(classType: ClassType): Set<string> {
  const ids = new Set<string>()
  for (const c of BASIC_CARDS) {
    if (!isNonCollectibleCardId(c.id)) ids.add(c.id)
  }
  for (const c of CLASS_CARDS) {
    if (c.classType === classType && !isNonCollectibleCardId(c.id)) ids.add(c.id)
  }
  return ids
}

export function maxCopiesForRarity(rarity: CardRarity): number {
  if (rarity === CardRarity.LEGENDARY) return GAME_CONSTANTS.MAX_COPIES_LEGENDARY
  if (rarity === CardRarity.RARE) return GAME_CONSTANTS.MAX_COPIES_RARE
  return GAME_CONSTANTS.MAX_COPIES_BASIC
}

export type DeckLineInput = { cardId: string; count: number }

function getOwned(
  collectionOwned: Readonly<Record<string, number>> | Map<string, number>,
  cardId: string,
): number {
  if (collectionOwned instanceof Map) return collectionOwned.get(cardId) ?? 0
  return collectionOwned[cardId] ?? 0
}

/** Fusiona líneas duplicadas por cardId y descarta counts <= 0. */
export function mergeDeckLines(lines: DeckLineInput[]): Map<string, number> {
  const merged = new Map<string, number>()
  for (const row of lines) {
    const c = Math.max(0, Math.floor(Number(row.count)) || 0)
    if (c <= 0) continue
    merged.set(row.cardId, (merged.get(row.cardId) ?? 0) + c)
  }
  return merged
}

export function validateDeckPayload(args: {
  classType: ClassType
  lines: DeckLineInput[]
  getCard: (id: string) => Card | undefined
  collectionOwned: Readonly<Record<string, number>> | Map<string, number>
}): DeckValidation {
  const errors: DeckValidationError[] = []
  const { classType, lines, getCard, collectionOwned } = args
  const legal = legalCardIdsForDeckClass(classType)
  const merged = mergeDeckLines(lines)

  let total = 0
  for (const [cardId, count] of merged) {
    total += count
    const card = getCard(cardId)
    if (!card) {
      errors.push({
        type: 'UNKNOWN_CARD',
        cardId,
        message: `Carta desconocida: ${cardId}`,
      })
      continue
    }
    if (!legal.has(cardId)) {
      errors.push({
        type: 'INVALID_CLASS_CARDS',
        cardId,
        message: `"${card.name}" no es válida para esta clase`,
      })
    }
    const maxR = maxCopiesForRarity(card.rarity)
    if (count > maxR) {
      errors.push({
        type: 'TOO_MANY_COPIES',
        cardId,
        message: `Máximo ${maxR} copia(s) de "${card.name}" (${card.rarity})`,
      })
    }
    const owned = getOwned(collectionOwned, cardId)
    if (count > owned) {
      errors.push({
        type: 'INSUFFICIENT_OWNED',
        cardId,
        message: `Solo posees ${owned} copia(s) de "${card.name}"`,
      })
    }
  }

  if (total !== GAME_CONSTANTS.DECK_SIZE) {
    errors.push({
      type: 'DECK_SIZE',
      message:
        total < GAME_CONSTANTS.DECK_SIZE
          ? `El mazo debe tener exactamente ${GAME_CONSTANTS.DECK_SIZE} cartas (llevas ${total})`
          : `El mazo debe tener exactamente ${GAME_CONSTANTS.DECK_SIZE} cartas (tienes ${total})`,
    })
  }

  return { isValid: errors.length === 0, errors }
}
