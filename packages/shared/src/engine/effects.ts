import { 
  GameState, 
  PlayerState, 
  CreatureOnBoard, 
  TargetRef, 
  TargetResolved,
  getCardByIdGlobal
} from './game-state'
import { Card, EffectTiming, EffectActionType, EffectTarget } from '../types/cards'
import { CardType, Ability } from '../types/cards'
import { getOpponentPlayerIndex } from './turns'
import { notifyEffectTriggered, notifyLeaveBattlefield, notifyEnterBattlefield } from './priority'
import { hasAbility, canTargetCreature } from './combat'
import { hasSpecimenOnBoard, getSpecimenCost, summonSpecimenToken } from './specimen'
import { checkAndActivateFinalStand, hasFinalStandImmunity } from './final-stand'
import { draw } from './turns' // solo si usas draw aquí

// Si usas getCardByIdGlobal, asegúrate de que esté accesible (importa o declara externamente)
// declare const getCardByIdGlobal: (id: string) => Card | undefined;

// =======================
// Condición de efectos
// =======================
export function effectConditionPasses(state: GameState, playerIndex: number, eff: any): boolean {
  if (!eff.condition) return true
  const p = state.players[playerIndex]
  const c = eff.condition
  if (c.type === 'CLASS_RESOURCE') {
    const cr = p.classResource
    if (!cr) return false
    const want = c.value
    if (typeof want === 'number' && 'amount' in cr) {
      if (c.comparison === 'EQUAL') return (cr.amount ?? 0) === want
      if (c.comparison === 'GREATER_EQUAL') return (cr.amount ?? 0) >= want
    }
    if (typeof want === 'string' && 'state' in cr) {
      return cr.state === want
    }
    return false
  }
  if (c.type === 'HEALTH_THRESHOLD') {
    if (c.comparison === 'LESS_EQUAL') return p.life <= c.value
    if (c.comparison === 'EQUAL') return p.life === c.value
    if (c.comparison === 'GREATER_EQUAL') return p.life >= c.value
    return false
  }
  if (c.type === 'HAND_SIZE') {
    if (c.comparison === 'LESS_EQUAL') return p.hand.length <= c.value
    if (c.comparison === 'EQUAL') return p.hand.length === c.value
    if (c.comparison === 'GREATER_EQUAL') return p.hand.length >= c.value
    return false
  }
  if (c.type === 'MANA_X_PLUS') {
    return p.mana >= (c.value ?? 0)
  }
  if (c.type === 'CREATURE_COUNT_3_PLUS') {
    return p.board.length >= 3
  }
  if (c.type === 'BOARD_STATE') {
    switch (String(c.value)) {
      case 'ALLY_DIED_THIS_TURN':       return !!p.allyDiedThisTurn
      case 'SPECIMEN_SUMMONED':         return !!p.specimenSummonedThisTurn
      case 'SPECIMEN_ON_BOARD':         return hasSpecimenOnBoard(p)
      case 'NO_STATE_CHANGE_THIS_TURN': return !p.manualCycleChangedThisTurn
      case 'MANA_5_PLUS':               return p.mana >= 5
      case 'MANA_6_PLUS':               return p.mana >= 6
      case 'SOLO_ATTACKER':             return (p.attackersDeclaredThisTurn ?? 0) === 1
      case 'ATTACKING_HERO':            return !!p.lastAttackTargetHero
      case 'DID_NOT_ATTACK':            return (p.attackersDeclaredThisTurn ?? 0) === 0
      case 'HAS_OTHER_CREATURES':       return p.board.length > 1
      default:                          return false
    }
  }
  return false
}

// =======================
// Triggers de tablero
// =======================
export function triggerBoardEffects(state: GameState, playerIndex: number, timing: EffectTiming) {
  const p = state.players[playerIndex]
  for (let i = 0; i < p.board.length; i++) {
    const ent = p.board[i]
    const card = getCardByIdGlobal(ent.cardId)
    if (!card || !card.effects) continue
    for (const eff of card.effects) {
      if (eff.timing !== timing) continue
      if (timing === EffectTiming.END_OF_TURN && eff.condition?.type === 'SELF_NOT_DAMAGED_THIS_TURN' && ent.damagedThisTurn) continue
      if (!effectConditionPasses(state, playerIndex, eff)) continue

      // Hints para targets SELF -> criatura actual
      const hints: TargetRef[] | undefined =
        eff.action?.target === EffectTarget.SELF
          ? ([{ type: 'CREATURE_SELF', index: i }] as TargetRef[])
          : undefined

      applyAction(state, playerIndex, eff.action, hints)
      notifyEffectTriggered(state, playerIndex, card.id, timing === EffectTiming.START_OF_TURN ? 'ON_PLAY' : 'END_OF_TURN')
    }
  }
}

// =======================
// Efectos ON_ENTER
// =======================
export function applyOnEnterEffects(
  state: GameState, 
  creature: CreatureOnBoard, 
  playerIndex: number, 
  card: Card
): void {
  if (card.effects) {
    for (const eff of card.effects) {
      if (eff.timing === EffectTiming.ON_ENTER && effectConditionPasses(state, playerIndex, eff)) {
        const hints: TargetRef[] = eff.action?.target === EffectTarget.SELF 
          ? [{ type: 'CREATURE_SELF', index: state.players[playerIndex].board.length - 1 }]
          : []
        applyAction(state, playerIndex, eff.action, hints)
      }
    }
  }
}

// =======================
// Aplicación de acciones
// =======================
export function applyAction(
  state: GameState,
  playerIndex: number,
  action: any,
  targetsHints?: TargetRef[]
) {
  const me = state.players[playerIndex]
  const opp = state.players[getOpponentPlayerIndex(state)]
  const pickHint = () => (targetsHints && targetsHints.length ? targetsHints.shift() : undefined)

  const target = resolveSingleTarget(state, playerIndex, action.target, pickHint())
  if (!target) return

  // Stealth: no puedes targetear criaturas ENEMIGAS con Sigilo con objetivos puntuales
  if (target.kind === 'CREATURE') {
    const ownerIdx = target.playerIndex
    if (ownerIdx !== playerIndex) {
      const owner = state.players[ownerIdx]
      const cr = owner.board[target.index]
      if (cr && hasAbility(cr, Ability.SIGILO)) return
    }
  }

  // Consumo opcional de Entropía si el action lo especifica
  if (action.consumeEntropy && action.consumeEntropy > 0 && String(action.value) !== 'RANDOM_BY_ENTROPY') {
    if (!consumeEntropy(state, playerIndex, action.consumeEntropy)) return
  }

  // ... (el switch de EffectActionType como en tu código, ya está completo arriba) ...
  // (Pega aquí el switch completo de tu código actual)

  // ventana de prioridad tras aplicar acción
  notifyEffectTriggered(state, playerIndex, 'ACTION', 'ON_PLAY')
}

// =======================
// Resolución de targets
// =======================
export function resolveSingleTarget(
  state: GameState,
  playerIndex: number,
  effectTarget: EffectTarget,
  hint?: TargetRef
): TargetResolved | undefined {
  const me = state.players[playerIndex]
  const opp = state.players[getOpponentPlayerIndex(state)]

  switch (effectTarget) {
    case EffectTarget.FRIENDLY_HERO: return { kind: 'HERO', playerIndex }
    case EffectTarget.ENEMY_HERO:    return { kind: 'HERO', playerIndex: getOpponentPlayerIndex(state) }
    case EffectTarget.TARGET_CREATURE: {
      if (!hint) return undefined
      if (hint.type === 'CREATURE_SELF' && me.board[hint.index]) {
        return { kind: 'CREATURE', playerIndex, index: hint.index }
      }
      if (hint.type === 'CREATURE_ENEMY' && opp.board[hint.index]) {
        return { kind: 'CREATURE', playerIndex: getOpponentPlayerIndex(state), index: hint.index }
      }
      if (hint.type === 'ANY_CREATURE') {
        const ownerIdx = hint.owner === 'SELF' ? playerIndex : getOpponentPlayerIndex(state)
        const owner = hint.owner === 'SELF' ? me : opp
        if (owner.board[hint.index]) {
          return { kind: 'CREATURE', playerIndex: ownerIdx, index: hint.index }
        }
      }
      return undefined
    }
    case EffectTarget.ALL_FRIENDLY_CREATURES: return { kind: 'MULTI', scope: 'FRIENDLY' }
    case EffectTarget.ALL_ENEMY_CREATURES:    return { kind: 'MULTI', scope: 'ENEMY' }
    case EffectTarget.RANDOM_ENEMY:           return { kind: 'RANDOM_ENEMY' }
    case EffectTarget.SELF:                   return { kind: 'SELF' }
    case EffectTarget.TARGET_SPELL:           return { kind: 'STACK_TOP_ENEMY' }
    default:                                  return undefined
  }
}

// =======================
// Entropía
// =======================
export function consumeEntropy(state: GameState, playerIndex: number, amount: number): boolean {
  const p = state.players[playerIndex]
  if (p.classResource?.type !== 'ENTROPIA') return false
  const have = p.classResource.amount ?? 0
  if (have < amount) return false
  p.classResource.amount = have - amount
  return true
}

export function gainEntropyOnPlay(player: PlayerState) {
  if (player.classResource?.type === 'ENTROPIA') {
    player.classResource.amount = Math.min(10, (player.classResource.amount ?? 0) + 1)
  }
}

export function createTokenFromValue(value: string): CreatureOnBoard | undefined {
  // ...lógica de creación de tokens...
  // Example placeholder implementation:
  // Replace this with your actual token creation logic.
  if (value) {
    return {
      id: `token_${value}`,
      cardId: value,
      ownerId: '',
      attack: 1,
      health: 1,
      exhausted: false,
      abilities: [],
      effects: [],
    }
  }
  return undefined;
}
