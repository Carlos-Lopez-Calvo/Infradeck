import { BASIC_CARDS } from '../cards/basic-cards'
import { CLASS_CARDS } from '../cards/class-cards'
import type { Card } from '../types/cards'

export const SPECIMEN_CARD_IDS = [
  'Especimen_Perfecto',
  'Especimen_Perfecto_Final_Stand',
  'Especimen_Perfecto_Evolucionado',
] as const

export type SpecimenCardId = (typeof SPECIMEN_CARD_IDS)[number]

const SPECIMEN_SET = new Set<string>(SPECIMEN_CARD_IDS)

export const isSpecimenCardId = (cardId: string): boolean => SPECIMEN_SET.has(cardId)

export const ALL_GAME_CARDS: Card[] = [...BASIC_CARDS, ...CLASS_CARDS]

export const COLLECTION_CATALOG_CARDS: Card[] = ALL_GAME_CARDS.filter((c) => !isSpecimenCardId(c.id))
