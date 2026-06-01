import {
  setCardResolver,
  BASIC_CARDS_BY_ID,
  CLASS_CARDS_BY_ID,
  type Card,
} from '@infradeck/shared'

export function getCardById(id: string): Card | undefined {
  return BASIC_CARDS_BY_ID[id] ?? CLASS_CARDS_BY_ID[id]
}

export function initCardResolver(): void {
  setCardResolver(getCardById)
}
