import { describe, it, expect } from 'vitest'
import { BASIC_CARDS_BY_ID } from '../cards/basic-cards'
import { CLASS_CARDS_BY_ID } from '../cards/class-cards'
import { ClassType, CardRarity } from '../types/cards'
import { SPECIMEN_CARD_IDS } from './deck-catalog'
import { mergeDeckLines, validateDeckPayload, legalCardIdsForDeckClass } from './deck-validation'

function getCard(id: string) {
  return BASIC_CARDS_BY_ID[id] ?? CLASS_CARDS_BY_ID[id]
}

describe('legalCardIdsForDeckClass', () => {
  it('includes all basics and only matching class cards', () => {
    const caos = legalCardIdsForDeckClass(ClassType.CAOS)
    expect(caos.has('Mercenario')).toBe(true)
    expect(caos.has('Mago_del_Caos')).toBe(true)
    expect(caos.has('Fanatico_Desesperado')).toBe(false)
  })

  it('excludes specimen cards from deck pool', () => {
    const abom = legalCardIdsForDeckClass(ClassType.ABOMINACION)
    for (const id of SPECIMEN_CARD_IDS) {
      expect(abom.has(id)).toBe(false)
    }
  })
})

describe('mergeDeckLines', () => {
  it('merges duplicate cardIds', () => {
    const m = mergeDeckLines([
      { cardId: 'A', count: 2 },
      { cardId: 'A', count: 1 },
    ])
    expect(m.get('A')).toBe(3)
  })
})

describe('validateDeckPayload', () => {
  it('rejects deck not exactly 30', () => {
    const lines = Array.from({ length: 10 }, () => ({ cardId: 'Mercenario', count: 1 }))
    const v = validateDeckPayload({
      classType: ClassType.VITALIDAD,
      lines,
      getCard,
      collectionOwned: Object.fromEntries(Array.from({ length: 30 }, () => ['Mercenario', 2] as const)),
    })
    expect(v.isValid).toBe(false)
    expect(v.errors.some((e) => e.type === 'DECK_SIZE')).toBe(true)
  })

  it('accepts 30 basics with enough owned', () => {
    const pool = Object.keys(BASIC_CARDS_BY_ID).filter((id) => getCard(id)?.rarity === CardRarity.BASIC)
    expect(pool.length).toBeGreaterThanOrEqual(15)
    const lines: { cardId: string; count: number }[] = []
    const owned: Record<string, number> = {}
    for (let i = 0; i < 15; i++) {
      const id = pool[i]!
      lines.push({ cardId: id, count: 2 })
      owned[id] = 2
    }
    const v = validateDeckPayload({
      classType: ClassType.CAOS,
      lines,
      getCard,
      collectionOwned: owned,
    })
    expect(v.isValid).toBe(true)
  })

  it('rejects legendary with 2 copies', () => {
    const legendaryId = Object.keys(CLASS_CARDS_BY_ID).find(
      (id) =>
        getCard(id)?.rarity === CardRarity.LEGENDARY && getCard(id)?.classType === ClassType.CAOS,
    )
    expect(legendaryId).toBeDefined()
    const other = Object.keys(BASIC_CARDS_BY_ID).find((id) => getCard(id)?.rarity === CardRarity.BASIC)!
    const lines = [
      { cardId: legendaryId!, count: 2 },
      ...Array.from({ length: 28 }, () => ({ cardId: other, count: 1 })),
    ]
    const v = validateDeckPayload({
      classType: ClassType.CAOS,
      lines,
      getCard,
      collectionOwned: { [legendaryId!]: 2, [other]: 30 },
    })
    expect(v.isValid).toBe(false)
    expect(v.errors.some((e) => e.type === 'TOO_MANY_COPIES' && e.cardId === legendaryId)).toBe(true)
  })

  it('rejects class card from wrong class', () => {
    const vitalCard = Object.keys(CLASS_CARDS_BY_ID).find(
      (id) => getCard(id)?.classType === ClassType.VITALIDAD,
    )!
    const basicId = Object.keys(BASIC_CARDS_BY_ID)[0]!
    const lines = [
      { cardId: vitalCard, count: 1 },
      ...Array.from({ length: 29 }, () => ({ cardId: basicId, count: 1 })),
    ]
    const owned: Record<string, number> = { [vitalCard]: 2, [basicId]: 30 }
    const v = validateDeckPayload({
      classType: ClassType.CAOS,
      lines,
      getCard,
      collectionOwned: owned,
    })
    expect(v.isValid).toBe(false)
    expect(v.errors.some((e) => e.type === 'INVALID_CLASS_CARDS')).toBe(true)
  })

  it('rejects more copies than owned', () => {
    const id = Object.keys(BASIC_CARDS_BY_ID)[0]!
    const lines = Array.from({ length: 30 }, () => ({ cardId: id, count: 1 }))
    const v = validateDeckPayload({
      classType: ClassType.ABOMINACION,
      lines,
      getCard,
      collectionOwned: { [id]: 5 },
    })
    expect(v.isValid).toBe(false)
    expect(v.errors.some((e) => e.type === 'INSUFFICIENT_OWNED')).toBe(true)
  })

  it('rejects unknown card id', () => {
    const basicId = Object.keys(BASIC_CARDS_BY_ID)[0]!
    const lines = [
      { cardId: 'NOT_A_REAL_CARD_ID_XXX', count: 1 },
      ...Array.from({ length: 29 }, () => ({ cardId: basicId, count: 1 })),
    ]
    const v = validateDeckPayload({
      classType: ClassType.VITALIDAD,
      lines,
      getCard,
      collectionOwned: { NOT_A_REAL_CARD_ID_XXX: 1, [basicId]: 30 },
    })
    expect(v.isValid).toBe(false)
    expect(v.errors.some((e) => e.type === 'UNKNOWN_CARD')).toBe(true)
  })
})
