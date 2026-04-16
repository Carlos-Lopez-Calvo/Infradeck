import { beforeAll, describe, expect, it } from 'vitest'
import { BASIC_CARDS } from '../cards/basic-cards'
import { CLASS_CARDS } from '../cards/class-cards'
import {
  createGame,
  playCard,
  setAdvancedSelectionRequest,
  setCardResolver,
  setDiscoverRequest,
  setScryRequest,
  type CardResolver,
  type CreatureOnBoard,
  type GameState,
  type PlayerState,
  type TargetRef,
} from './game-state'
import { CardType, EffectActionType, EffectTarget, type Card } from '../types/cards'

const ALL_CARDS: Card[] = [...BASIC_CARDS, ...CLASS_CARDS]
const ALL_CARDS_BY_ID = Object.fromEntries(ALL_CARDS.map((card) => [card.id, card])) as Record<string, Card>

function buildPlayer(input: {
  id: string
  name: string
  classType: string
  deck: string[]
}): Omit<
  PlayerState,
  'deck' | 'hand' | 'graveyard' | 'board' | 'mana' | 'maxMana' | 'life' | 'maxLife'
> & { deck: string[] } {
  return {
    id: input.id,
    name: input.name,
    classType: input.classType,
    deck: input.deck,
    classResource: input.classType === 'CAOS' ? { type: 'ENTROPIA', amount: 10 } : undefined,
    specimenSummons: 0,
    specimenFreeThisTurn: false,
    allyDiedThisTurn: false,
    specimenSummonedThisTurn: false,
    attackersDeclaredThisTurn: 0,
    lastAttackTargetHero: false,
    programmedSpecimenEffects: [],
    playedChaosEffects: [],
  }
}

function sampleCreature(ownerId: string, cardId = 'Soldado_Veterano'): CreatureOnBoard {
  return {
    id: `${ownerId}-${cardId}-${Math.random().toString(36).slice(2, 8)}`,
    cardId,
    ownerId,
    attack: 2,
    health: 2,
    exhausted: false,
    abilities: [],
    effects: [],
  }
}

function createStateForCard(card: Card): GameState {
  const state = createGame(
    buildPlayer({
      id: 'p1',
      name: 'Player 1',
      classType: card.classType ?? 'CAOS',
      deck: Array(30).fill('Soldado_Veterano'),
    }),
    buildPlayer({
      id: 'p2',
      name: 'Player 2',
      classType: 'ABOMINACION',
      deck: Array(30).fill('Soldado_Veterano'),
    }),
    42,
  )

  state.turn.currentPlayerIndex = 0
  state.turn.phase = 'PLAYING' as GameState['turn']['phase']
  state.players[0].maxMana = 20
  state.players[0].mana = 20
  state.players[0].life = 5 // helps cards with low-health conditions
  state.players[0].hand = [card.id]
  state.players[0].board = [sampleCreature(state.players[0].id)]
  state.players[1].board = [sampleCreature(state.players[1].id)]
  state.players[0].classResource = state.players[0].classResource ?? { type: 'ENTROPIA', amount: 10 }
  if (state.players[0].classResource.type === 'ENTROPIA') {
    state.players[0].classResource.amount = 10
  }

  // Specific setup for hard requirements
  if (card.id === 'Evolucion_Perfecta') {
    state.players[0].board.push({
      ...sampleCreature(state.players[0].id, 'Especimen_Perfecto'),
      cardId: 'Especimen_Perfecto',
      attack: 5,
      health: 5,
    })
  }

  return state
}

function buildGenericTargets(card: Card): TargetRef[] {
  const hints: TargetRef[] = [
    { type: 'CREATURE_SELF', index: 0 },
    { type: 'CREATURE_ENEMY', index: 0 },
    { type: 'ANY_CREATURE', owner: 'SELF', index: 0 },
    { type: 'ANY_CREATURE', owner: 'ENEMY', index: 0 },
    { type: 'HERO_SELF' },
    { type: 'HERO_ENEMY' },
  ]

  // Ensure ATTACK_SPELL has both needed refs
  const hasAttackSpell = card.effects.some((eff) => eff.action.type === EffectActionType.ATTACK_SPELL)
  if (hasAttackSpell) {
    return [{ type: 'CREATURE_SELF', index: 0 }, { type: 'CREATURE_ENEMY', index: 0 }]
  }

  // Prefer friendly target for pure buffs
  const hasFriendlyBuff = card.effects.some(
    (eff) =>
      (eff.action.target === EffectTarget.TARGET_FRIENDLY_CREATURE ||
        eff.action.target === EffectTarget.SELF) &&
      (eff.action.type === EffectActionType.BUFF_STATS ||
        eff.action.type === EffectActionType.GAIN_ABILITY ||
        eff.action.type === EffectActionType.BUFF_ATTACK ||
        eff.action.type === EffectActionType.BUFF_HEALTH),
  )

  if (hasFriendlyBuff) {
    return [{ type: 'CREATURE_SELF', index: 0 }, ...hints]
  }

  return hints
}

describe('All cards smoke tests', () => {
  beforeAll(() => {
    const resolver: CardResolver = (id) => ALL_CARDS_BY_ID[id]
    setCardResolver(resolver)
    setDiscoverRequest(() => 'BASE')
    setScryRequest(() => 'TOP')
    setAdvancedSelectionRequest(() => {})
  })

  it('has unique card ids', () => {
    const ids = ALL_CARDS.map((card) => card.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('can attempt to play every card without runtime crashes', () => {
    const failures: string[] = []

    for (const card of ALL_CARDS) {
      try {
        const state = createStateForCard(card)
        const result = playCard(state, 0, 0, (id) => ALL_CARDS_BY_ID[id], {
          targets: buildGenericTargets(card),
        })

        if (!result.ok) {
          failures.push(`${card.id}: ${result.error}`)
        }
      } catch (error) {
        failures.push(`${card.id}: threw ${(error as Error).message}`)
      }
    }

    expect(failures).toEqual([])
  })
})
