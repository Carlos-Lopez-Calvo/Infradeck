/**
 * INFRADECK - Card System Types
 * Definiciones TypeScript para las 70 cartas del juego
 */

// ===== ENUMS BÁSICOS =====
export function Card({ card, showMana = true }: { card: any; showMana?: boolean }) {
  // Normalizaciones seguras
  const abilities = Array.isArray(card.abilities) ? card.abilities : []
  const effects = Array.isArray(card.effects) ? card.effects : []
  const attack = typeof card.attack === 'number' ? card.attack : 0
  const health = typeof card.health === 'number' ? card.health : 0

  // ...resto del componente

  // Donde antes hacías:
  // {card.abilities.map(...)}  -> usa:
  // {abilities.map(...)}

  // Si iteras efectos:
  // {effects.map(...)}
}

export enum CardType {
  CREATURE = 'CREATURE',
  SPELL = 'SPELL', 
}

export enum CardRarity {
  BASIC = 'BASIC',
  RARE = 'RARE',
  LEGENDARY = 'LEGENDARY'
}

export enum ClassType {
  ABOMINACION = 'ABOMINACION',
  CAOS = 'CAOS', 
  VITALIDAD = 'VITALIDAD'
}

// ===== HABILIDADES (9 KEYWORDS) =====

export enum Ability {
  // Ofensivas
  PRISA = 'PRISA',
  IMPACIENTE = 'IMPACIENTE',
  ROBO_DE_VIDA = 'ROBO_DE_VIDA',
  VENENO = 'VENENO',

  // Defensivas
  TAUNT = 'TAUNT',
  SIGILO = 'SIGILO',
  ESCUDO = 'ESCUDO',
  REGENERACION = 'REGENERACION',

  // Especiales
  VUELO = 'VUELO',
  DOBLE_GOLPE = 'DOBLE_GOLPE'
}

// ===== RECURSOS DE CLASE =====

export type ClassResourceCost = 
  | { type: 'VIDA', amount: number }              // VITALIDAD: pagar vida
  | { type: 'ENTROPIA', amount: number }          // CAOS: requiere Entropía
  | { type: 'CEMENTERIO', amount: number }        // ABOMINACIÓN: cartas en cementerio

// ===== EFECTOS DE CARTAS =====

export enum EffectActionType {
  // Damage & Healing
  DAMAGE = 'DAMAGE',
  HEAL = 'HEAL',
  DAMAGE_ADJACENT = 'DAMAGE_ADJACENT',
  
  // Card manipulation  
  DRAW_CARDS = 'DRAW_CARDS',
  DISCARD_CARDS = 'DISCARD_CARDS',
  SCRY = 'SCRY',
  
  // Creature creation
  SUMMON_CREATURE = 'SUMMON_CREATURE',
  
  // Stats modification
  BUFF_ATTACK = 'BUFF_ATTACK',
  BUFF_HEALTH = 'BUFF_HEALTH', 
  BUFF_STATS = 'BUFF_STATS',
  
  // Abilities
  GAIN_ABILITY = 'GAIN_ABILITY',
  LOSE_ABILITY = 'LOSE_ABILITY',
  
  // State changes
  GAIN_ENTROPY = 'GAIN_ENTROPY',
  DISCOVER_PAY_ENTROPY = 'DISCOVER_PAY_ENTROPY',
  
  // Special effects
  SUMMON_SPECIMEN = 'SUMMON_SPECIMEN',
  TRANSFORM = 'TRANSFORM',        
  DISCOVER_PAY_LIFE = 'DISCOVER_PAY_LIFE',

  ATTACK_SPELL = 'ATTACK_SPELL',
  REDUCE_CARD_COST = 'REDUCE_CARD_COST',

  REUSE_RANDOM_PAST_CHAOS_EFFECT = 'REUSE_RANDOM_PAST_CHAOS_EFFECT',

  // NUEVO: Avatar destruye y absorbe
  BOARD_NUKE_AND_ABSORB = 'BOARD_NUKE_AND_ABSORB',
  DISCOVER_SUMMON_FROM_GRAVEYARD = 'DISCOVER_SUMMON_FROM_GRAVEYARD',
  DAMAGE_AND_SUMMON_SAME_COST_IF_KILL = 'DAMAGE_AND_SUMMON_SAME_COST_IF_KILL',
  DESTROY_TOP_HEALTH_CREATURES = 'DESTROY_TOP_HEALTH_CREATURES',
  GRANT_TEMP_DRAW_ON_KILL = 'GRANT_TEMP_DRAW_ON_KILL',
  
  // Selección avanzada: ver X cartas, elegir 1, resto al fondo
  ADVANCED_SELECTION = 'ADVANCED_SELECTION',
  
  // Daño que roba carta si mata
  DAMAGE_AND_DRAW_IF_KILL = 'DAMAGE_AND_DRAW_IF_KILL'
  
}

export interface CardEffect {
  id: string
  description: string
  timing: EffectTiming
  condition?: EffectCondition
  action: EffectAction
  
}

export enum EffectTiming {
  // Timing básico
  ON_PLAY = 'ON_PLAY',                // Al ser jugada
  ON_ENTER = 'ON_ENTER',              // Al entrar al tablero
  ON_DEATH = 'ON_DEATH',              // Al morir
  ON_ATTACK = 'ON_ATTACK',            // Al atacar
  
  // Timing de turno
  START_OF_TURN = 'START_OF_TURN',    // Inicio de turno
  END_OF_TURN = 'END_OF_TURN',        // Final de turno
  
  // Timing reactivo
  INSTANT = 'INSTANT',                // Cuando se juega (instantáneas)
  TRIGGERED = 'TRIGGERED',            // Trigger condicional
  PASSIVE = 'PASSIVE'                 // Efecto pasivo permanente
}

 export interface EffectCondition {
     type: 'HEALTH_THRESHOLD' | 'GRAVEYARD_COUNT' | 'HAND_SIZE' | 'BOARD_STATE' | 'CLASS_RESOURCE' | 'SELF_NOT_DAMAGED_THIS_TURN'
     value?: number | string | boolean
     comparison?: 'EQUAL' | 'GREATER' | 'LESS' | 'GREATER_EQUAL' | 'LESS_EQUAL'
  }

  export interface EffectAction {
    type: EffectActionType
    target: EffectTarget
    value?: number | string | Ability
    amount?: number              // Para stats separados
    duration?: 'PERMANENT' | 'END_OF_TURN' | 'UNTIL_DEATH'
    consumeEntropy?: number      // Opcional: consumo por disparo/uso (CAOS)
    options?: DiscoverPayLifeOptions | DiscoverPayEntropyOptions | CostReductionScalingOptions
  }

  export enum EffectTarget {
    SELF = 'SELF',
    ENEMY_HERO = 'ENEMY_HERO',
    FRIENDLY_HERO = 'FRIENDLY_HERO', 
    TARGET_CREATURE = 'TARGET_CREATURE',
   TARGET_FRIENDLY_CREATURE = 'TARGET_FRIENDLY_CREATURE',
    ALL_FRIENDLY_CREATURES = 'ALL_FRIENDLY_CREATURES',
    ALL_ENEMY_CREATURES = 'ALL_ENEMY_CREATURES',
    ALL_ENEMIES = 'ALL_ENEMIES',
    ALL_CREATURES = 'ALL_CREATURES',
    RANDOM_ENEMY = 'RANDOM_ENEMY',
    RANDOM_CREATURE = 'RANDOM_CREATURE',
    RANDOM_CHARACTER = 'RANDOM_CHARACTER',
    TARGET_SPELL = 'TARGET_SPELL'
  }

// ===== DEFINICIÓN PRINCIPAL DE CARTA =====

export interface Card {
  // Identificación
  id: string
  name: string
  image?: string
  
  // Propiedades básicas
  type: CardType
  rarity: CardRarity
  classType?: ClassType 
  mana: number
  
  // Stats (solo criaturas)
  attack?: number
  health?: number
  
  // Habilidades pasivas
  abilities: Ability[]
  
  // Efectos activos
  effects: CardEffect[]
  
  // Costo de recurso de clase (opcional)
  classResource?: ClassResourceCost
  
  // Flavor y arte
  description: string
  flavorText: string
  artUrl?: string
}

// Para ABOMINACIÓN - Espécimen Perfecto especial
export interface SpecimenCard extends Card {
  classType: ClassType.ABOMINACION
  isSpecimen: true
  inheritedAbilities: Ability[]
  inheritedEffects: CardEffect[]
  summonCost: number
}

// ===== UTILIDADES DE TIPO =====

export type PlayableCard = Card
export type AnyCard = Card | SpecimenCard

export function isSpecimenCard(card: AnyCard): card is SpecimenCard {
  return card.classType === ClassType.ABOMINACION && 'isSpecimen' in card
}

export function isCreature(card: Card): boolean {
  return card.type === CardType.CREATURE
}

// ===== CONSTANTES DEL JUEGO =====

export const GAME_CONSTANTS = {
  // Deck rules
  DECK_SIZE: 30,
  MAX_COPIES_BASIC: 2,
  MAX_COPIES_RARE: 2, 
  MAX_COPIES_LEGENDARY: 1,
  
  // Game setup
  STARTING_LIFE: 20,
  STARTING_HAND_SIZE: 5,
  MAX_MANA: 10,
  MAX_BOARD_SIZE: 10,
  
  // Final Stand
  FINAL_STAND_LIFE: 1,
  FINAL_STAND_MAX_LIFE: 10,
  
  // Class resources
  MAX_ENTROPY: 10,
  SPECIMEN_BASE_COST: 5,
  SPECIMEN_COST_INCREMENT: 2,
  SPECIMEN_MAX_COST: 10
} as const

// ===== TIPOS DE VALIDACIÓN =====

export interface DeckValidation {
  isValid: boolean
  errors: DeckValidationError[]
}

export interface DeckValidationError {
  type: 'DECK_SIZE' | 'TOO_MANY_COPIES' | 'INVALID_CLASS_CARDS' | 'MISSING_REQUIRED_CARDS'
  cardId?: string
  message: string
}

export interface DiscoverPayLifeOptions {
  lifeCost: number
  base?: EffectAction
  buff?: EffectAction
}

export interface DiscoverPayEntropyOptions {
  entropyCost: number
  base?: EffectAction
  buff?: EffectAction
}

export interface CostReductionScalingOptions {
  thresholds: Array<{ min: number, uses: number | 'ALL' }>
}