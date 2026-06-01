import type { ClassType } from '@infradeck/shared'

export type DeckCardLine = { cardId: string; count: number }

export type SavedDeck = {
  id: string
  name: string
  classType: string
  cards: DeckCardLine[]
}

export type PlayDeckConfig = {
  id: string
  name: string
  classType: ClassType
  deck: string[]
}

const CLASS_LABELS: Record<string, string> = {
  ABOMINACION: 'Abominación',
  CAOS: 'Caos',
  VITALIDAD: 'Vitalidad',
}

export function classLabel(classType: string): string {
  return CLASS_LABELS[classType] ?? classType
}

export function expandDeckCards(cards: DeckCardLine[]): string[] {
  const out: string[] = []
  for (const { cardId, count } of cards) {
    const n = Math.max(0, Math.floor(count))
    for (let i = 0; i < n; i++) out.push(cardId)
  }
  return out
}

export function toPlayDeckConfig(deck: SavedDeck): PlayDeckConfig | null {
  const expanded = expandDeckCards(deck.cards)
  if (expanded.length === 0) return null
  return {
    id: deck.id,
    name: deck.name,
    classType: deck.classType as ClassType,
    deck: expanded,
  }
}

export const SELECTED_DECK_STORAGE_KEY = 'infradeck_selected_deck_id'
