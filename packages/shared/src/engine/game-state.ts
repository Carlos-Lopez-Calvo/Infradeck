import { 
  Card, 
  CardType, 
  Ability, 
  EffectTiming, 
  EffectTarget, 
  EffectActionType, 
  EffectAction 
} from '../types/cards'

import { mulberry32, shuffle } from './utils'

import { draw } from './turns'
import { notifyEnterBattlefield } from './priority'


// Enums y Tipos principales
// =======================
export enum GamePhase {
  PLAYING = 'PLAYING', // Fase única donde puedes hacer todo (como Hearthstone)
}

export interface Entity {
  id: string
}

export interface CardInZone extends Entity {
  cardId: string
  ownerId: string
}

export interface CreatureOnBoard extends CardInZone {
  attack: number
  health: number
  exhausted: boolean
  abilities: string[]
  impatientHeroLockThisTurn?: boolean
  damagedThisTurn?: boolean
  effects: EffectActionType[]
  programmedEffects?: (EffectActionType | string)[]
  tempDrawOnKill?: number  // Temporal: roba N cartas al matar (limpiado al final del turno)
  tempAtkBuff?: number     // Temporal: ataque a revertir al final del turno (duration END_OF_TURN)
  tempHpBuff?: number      // Temporal: vida a revertir al final del turno (duration END_OF_TURN)
  tempAbilities?: string[] // Temporal: habilidades concedidas a retirar al final del turno
  dieAtEndOfTurn?: boolean // Token invocado que muere al final del turno (duration END_OF_TURN)
  conditionalBuff?: string  // Marca de buff condicional activo (para Duelista Frenetico, etc)
  conditionalTauntFromHand?: boolean
  deathScalingBonusApplied?: number
}

export interface PlayerState {
  id: string
  name: string
  classType: string
  life: number
  maxLife: number
  maxMana: number
  mana: number
  deck: string[]
  hand: string[]
  graveyard: string[]
  board: CreatureOnBoard[]
  classResource?: {
    type: 'CEMENTERIO' | 'ENTROPIA' | 'VIDA'
    amount?: number
  }
  specimenSummons?: number
  specimenFreeThisTurn?: boolean
  allyDiedThisTurn?: boolean
  alliesDiedThisTurnCount?: number
  specimenSummonedThisTurn?: boolean
  attackersDeclaredThisTurn?: number
  lastAttackTargetHero?: boolean
  finalStand?: FinalStandState
  freeSpecimenThisTurn?: { attack: number, health: number }
  noEntropyResetThisTurn?: boolean
  finalStandBonusApplied?: boolean 
  freeLifeCosts?: boolean
  programmedSpecimenEffects: (EffectActionType | string)[]
  lifeCredit?: number
  cardCostReduction?: { amount: number, remaining: number | 'ALL' }
  cardCostReductionSkipOnce?: boolean        // ← nuevo
  playedChaosEffects?: EffectAction[]        // ← nuevo historial
  forceDiscoverBuff?: boolean                // ← NUEVO
}

export interface TurnState {
  currentPlayerIndex: number
  phase: GamePhase
  turnNumber: number
}

export interface StackItem {
  id: string
  type: 'CARD_PLAY' | 'EFFECT_TRIGGER' | 'ABILITY_ACTIVATION'
  playerIndex: number
  sourceId: string
  action: EffectAction
  targets?: TargetRef[]
  priority: number
  cardData?: Card
}

export interface GameState {
  players: [PlayerState, PlayerState]
  turn: TurnState
  stack: StackItem[]
  rngSeed?: number
  endOfTurnTasks?: Array<() => void>
  pendingCounters?: [number, number]
  priorityPassed: [boolean, boolean]
  finalStandJustActivated?: number | null
  pendingTargets?: TargetRef[]           // ← objetivos UI pendientes
  /** Robo con mano llena → cementerio; la UI puede animar y luego poner null */
  lastHandOverflowDiscard?: { playerIndex: number; cardId: string; at: number } | null
}

interface FinalStandState {
  used: boolean
  immuneUntilTurn?: number
  triggeredByDamageFrom?: number
}

// =======================
// Creación de partida y estado inicial
// =======================
export function createGame(
  p1: Omit<PlayerState, 'deck' | 'hand' | 'graveyard' | 'board' | 'mana' | 'maxMana' | 'life' | 'maxLife'> & { deck: string[] }, 
  p2: Omit<PlayerState, 'deck' | 'hand' | 'graveyard' | 'board' | 'mana' | 'maxMana' | 'life' | 'maxLife'> & { deck: string[] },
  rngSeed?: number
): GameState {
  const rng = rngSeed != null ? mulberry32(rngSeed) : Math.random
  const base = (p: typeof p1): PlayerState => ({
    id: p.id,
    name: p.name,
    classType: p.classType,
    life: 20,
    maxLife: 20,
    maxMana: 0,
    mana: 0,
    deck: shuffle(p.deck, rng),
    hand: [],
    graveyard: [],
    board: [],
    classResource: initialClassResource(p.classType),  // <- debe existir
    specimenSummons: 0,
    specimenFreeThisTurn: false,
    allyDiedThisTurn: false,
    alliesDiedThisTurnCount: 0,
    specimenSummonedThisTurn: false,
    attackersDeclaredThisTurn: 0,
    lastAttackTargetHero: false,
    programmedSpecimenEffects: [],
    playedChaosEffects: [],                           // ← inicializa historial
  })
  return {
    players: [base(p1), base(p2)],
    turn: { currentPlayerIndex: 0, phase: GamePhase.PLAYING, turnNumber: 0 }, // Empieza en 0, startTurn lo incrementa
    stack: [],
    rngSeed,
    endOfTurnTasks: [],
    pendingCounters: [0, 0],
    priorityPassed: [false, false],
    lastHandOverflowDiscard: null,
  }
}

export function createInitialGameState(): GameState {
  const basicDeck = [
    'Ultima_Oportunidad', 'Ultima_Oportunidad', 'Ultima_Oportunidad', 'Ultima_Oportunidad',
    'Mercenario_Agil', 'Mercenario_Agil', 'Mercenario_Agil', 'Mercenario_Agil', 
    'Explorador_Astuto', 'Explorador_Astuto', 'Asesino_Silencioso', 'Asesino_Silencioso',
    'Guardian_Novato', 'Guardian_Novato', 'Reflejo_Rapido', 'Reflejo_Rapido'
  ]
  const player1 = {
    id: 'player1',
    name: 'Player 1',
    classType: 'ABOMINACION',
    deck: [...basicDeck],
    programmedSpecimenEffects: []
  }
  const player2 = {
    id: 'player2', 
    name: 'Player 2',
    classType: 'CAOS',
    deck: [...basicDeck],
    programmedSpecimenEffects: []
  }
  const gameState = createGame(player1, player2)
  startGame(gameState)
  return gameState
}

export function startGame(state: GameState): void {
  // Robar mano inicial (5 cartas cada jugador)
  draw(state, 0, 5)
  draw(state, 1, 5)
  
  // El jugador 0 empieza con 1 de maná (como Hearthstone)
  state.players[0].maxMana = 1
  state.players[0].mana = 1
  
  // Establecer fase de juego
  state.turn.phase = GamePhase.PLAYING
  console.log('[GAME] Game started - Player 0 begins')
}


function initialClassResource(classType: string): PlayerState['classResource'] {
  switch (classType) {
    case 'CAOS':         return { type: 'ENTROPIA', amount: 0 }
    case 'VITALIDAD':    return { type: 'VIDA' }
    case 'ABOMINACION':  return { type: 'CEMENTERIO', amount: 0 }
    default:             return undefined
  }
}

// =======================
// Priority windows (instants)
// =======================
export type PriorityHandler = (state: GameState, info: { phase: GamePhase, activePlayer: number }) => void
export let onPriorityWindow: PriorityHandler = () => {}
export function setPriorityWindow(handler: PriorityHandler) {
  onPriorityWindow = handler
}

// =======================
// Card resolver global
// =======================
export type CardResolver = (id: string) => Card | undefined
export let getCardByIdGlobal: CardResolver = () => undefined
export function setCardResolver(r: CardResolver) { getCardByIdGlobal = r }

// =======================
// Targeting & Actions
// =======================
export type TargetRef =
| { type: 'HERO_SELF' }
| { type: 'HERO_ENEMY' }
| { type: 'CREATURE_SELF'; index: number }
| { type: 'CREATURE_ENEMY'; index: number }
| { type: 'ANY_CREATURE'; owner: 'SELF'|'ENEMY'; index: number }

export interface PlayOptions {
  targets?: TargetRef[]
}

export type TargetResolved =
  | { kind: 'HERO'; playerIndex: number }
  | { kind: 'CREATURE'; playerIndex: number; index: number }
  | { kind: 'MULTI'; scope: 'FRIENDLY' | 'ENEMY' }
  | { kind: 'RANDOM_ENEMY' }
  | { kind: 'SELF' }
  | { kind: 'STACK_TOP_ENEMY' }

// =======================
// PlayCard y helpers
// =======================
export type PlayResult = { ok: true } | { ok: false, error: string }

export function playCard(
  state: GameState,
  playerIndex: number,
  handIndex: number,
  getCardById: (id: string) => Card | undefined,
  options?: PlayOptions
): PlayResult {
  const player = state.players[playerIndex]
  const cardId = player.hand[handIndex]
  if (!cardId) return { ok: false, error: 'No hay carta en esa posición' }

  const card = getCardById(cardId)
  if (!card) return { ok: false, error: 'Carta no encontrada' }

  // Restricción de juego por umbral de vida: un hechizo cuyos efectos ON_PLAY
  // están todos condicionados a la vida (HEALTH_THRESHOLD) no puede jugarse si
  // no se cumple ninguna (p.ej. "Última Oportunidad", "Frenesí Final": vida <= 10).
  // No afecta a otras condiciones (ENTROPÍA, cementerio, etc.), que se resuelven
  // saltando el efecto si no se cumplen.
  if (card.type === CardType.SPELL) {
    const onPlayEffects = card.effects?.filter(e => e.timing === EffectTiming.ON_PLAY) ?? []
    const hasOnPlay = onPlayEffects.length > 0
    const allLifeGated = hasOnPlay && onPlayEffects.every(e => e.condition?.type === 'HEALTH_THRESHOLD')
    const anyConditionPasses = onPlayEffects.some(e => effectConditionPasses(state, playerIndex, e))
    if (hasOnPlay && allLifeGated && !anyConditionPasses) {
      return { ok: false, error: 'No cumples las condiciones para jugar esta carta' }
    }
  }

     // Verifica coste de maná (aplica reducción global de coste de carta si existe)
    // Verifica coste de maná (aplica reducción global de coste de carta si existe)
    let effectiveCost = card.mana ?? 0
    {
      const red = player.cardCostReduction
      if (red && red.amount > 0 && (red.remaining === 'ALL' || (red.remaining ?? 0) > 0)) {
        console.log('[COST] applying reduction', { base: effectiveCost, red })  // ← trace
        effectiveCost = Math.max(0, effectiveCost - red.amount)
      }
    }
    console.log('[COST] paying', { cardId: card.id, effectiveCost })             // ← trace
    if (player.mana < effectiveCost) {
      return { ok: false, error: 'No tienes suficiente maná' }
    }
    player.mana -= effectiveCost

  // Elimina la carta de la mano
  player.hand.splice(handIndex, 1)
  updateConditionalBuffs(state, playerIndex)

  // Entropía base: +1 por cada carta jugada si tu clase usa ENTROPIA
  gainEntropyOnPlay(player)
  if (player.classResource?.type === 'ENTROPIA') {
    console.log('[ENTROPIA] on any play', { playerIndex, after: player.classResource.amount })
  }

  // Si es criatura, invócala al campo
  if (card.type === CardType.CREATURE) {
    // Permite que la UI pase objetivos para efectos ON_ENTER (p.ej. TARGET_FRIENDLY_CREATURE)
    if (options?.targets && options.targets.length) {
      state.pendingTargets = [...options.targets]
    }
    const hasPrisa = card.abilities?.includes(Ability.PRISA) ?? false
    const hasImpaciente = card.abilities?.includes(Ability.IMPACIENTE) ?? false
    const entity: CreatureOnBoard = {
      id: `creature-${Date.now()}`,
      cardId: card.id,
      ownerId: player.id,
      attack: card.attack ?? 0,
      health: card.health ?? 1,
      // IMPACIENTE funciona como PRISA para poder atacar al entrar.
      exhausted: !(hasPrisa || hasImpaciente),
      // Pero en ese primer turno no puede atacar al héroe.
      impatientHeroLockThisTurn: hasImpaciente,
      abilities: card.abilities ? [...card.abilities] : [],
      effects: [],
    }
    player.board.push(entity)
    // Aplica efectos ON_ENTER
    applyOnEnterEffects(state, entity, playerIndex, card)
    notifyEnterBattlefield(state, playerIndex, entity.id)
    // Los buffs condicionales se actualizan en inicio de turno y después de combate
  } else {
    // Si es hechizo, resuelve efectos y manda al cementerio
    console.log('[SPELL] playing spell', { cardId: card.id, effects: card.effects })
    if (card.effects) {
      for (const eff of card.effects) {
        console.log('[SPELL] checking effect', { timing: eff.timing, action: eff.action })
        if (eff.timing === EffectTiming.ON_PLAY) {
          // Respeta condiciones del efecto (p.ej., ENTROPÍA >= 5)
          if (!effectConditionPasses(state, playerIndex, eff)) {
            console.log('[SPELL] condition failed, skipping effect', eff.id)
            continue
          }
          console.log('[SPELL] applying ON_PLAY effect', eff.action)

         const autoHints = (!options?.targets || options.targets.length === 0)
           ? getRandomHintsForAction(state, playerIndex, eff.action as any)
           : []
         const hints = (options?.targets && options.targets.length ? options.targets : autoHints)
         applyAction(state, playerIndex, eff.action, hints)
        }
      }
    }
    player.graveyard.unshift(card.id)
  }

  recordChaosEffectsFromCard(state, playerIndex, card)
  notifyCardPlayed(state, playerIndex, card.id)
  const cr = state.players[playerIndex].classResource
  if (cr?.type === 'ENTROPIA') {
    console.log('[ENTROPIA] after playCard', { playerIndex, amount: cr.amount })
  }
  // Consumir 1 uso de reducción si aplica y no es 'ALL'
    // Consumir 1 uso de reducción si aplica y no es 'ALL'
      // Consumir 1 uso de reducción si aplica y no es 'ALL'
  {
    const red = player.cardCostReduction
    if (player.cardCostReductionSkipOnce) {
      player.cardCostReductionSkipOnce = false
    } else if (red && typeof red.remaining === 'number' && red.remaining > 0) {
      red.remaining -= 1
      console.log('[COST] use consumed', red)
    }
  }
  updateConditionalBuffs(state, playerIndex)
  return { ok: true }
}

// =======================
// Combat basics
// =======================
export type AttackResult = { ok: true } | { ok: false, error: string }

// =======================
// Combate (estilo Hearthstone - sin fases separadas)
// =======================
// En Hearthstone, puedes atacar en cualquier momento durante tu turno
// No hay funciones beginCombat/endCombat, todo ocurre en la fase PLAYING

export type DiscoverHandler = (state: GameState, info: {
  playerIndex: number
  options: Array<{ id: string; label: string; preview?: Partial<Card> }>
}) => string

export let onDiscoverRequest: DiscoverHandler = () => 'BASE'
export function setDiscoverRequest(handler: DiscoverHandler) { onDiscoverRequest = handler }

export type ScryHandler = (state: GameState, info: {
  playerIndex: number
  cards: string[]
}) => 'TOP' | 'BOTTOM'

export let onScryRequest: ScryHandler = () => 'TOP'
export function setScryRequest(handler: ScryHandler) { onScryRequest = handler }

// Advanced Selection: ver N cartas, elegir 1 para robar, resto al fondo
export type AdvancedSelectionHandler = (state: GameState, info: {
  playerIndex: number
  cards: string[]
}) => void

export let onAdvancedSelectionRequest: AdvancedSelectionHandler = () => {}
export function setAdvancedSelectionRequest(handler: AdvancedSelectionHandler) { 
  onAdvancedSelectionRequest = handler 
}

// Targeting request: permite a la UI pedir objetivos puntuales (e.g., ON_DEATH TARGET_CREATURE)

// =======================
// Import helpers de otros módulos
// =======================
import { triggerPriority, addToStack, getStack, passPriority, resolveStack, notifyCardPlayed, notifyEffectTriggered, notifyLeaveBattlefield, applyStackItem, recordChaosEffectsFromCard } from './priority'

import { applyAction } from './effects/dispatcher'
import { effectConditionPasses } from './effects/core'
import { consumeEntropy, gainEntropyOnPlay } from './effects/caos-effects'
import { applyOnEnterEffects, getRandomHintsForAction, updateConditionalBuffs } from './effects/board-effects'

// Re-exportar funciones que todavía se usan en otros módulos
export { effectConditionPasses, consumeEntropy, gainEntropyOnPlay }
import { summonSpecimen, handleSpecimenOnEnter, getUniqueAbilitiesFromGraveyard, hasSpecimenOnBoard, getSpecimenCost } from './specimen'
import { declareAttackHero, declareAttackCreature, hasAbility, enemyHasTaunt, applyAbilityEffects, canTargetCreature } from './combat'
import { activateFinalStand, checkAndActivateFinalStand, hasFinalStandImmunity, applyFinalStandBonus } from './final-stand'
import { getCurrentPlayerIndex, getOpponentPlayerIndex, startTurn, endTurn, nextTurn } from './turns'

// =======================
// Exporta lo necesario
// =======================
// (Ya tienes las exportaciones arriba)
