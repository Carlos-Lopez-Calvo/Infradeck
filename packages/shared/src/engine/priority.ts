import { GameState, GamePhase, StackItem, getCardByIdGlobal, } from './game-state'
import { onPriorityWindow } from './game-state'
import { getCurrentPlayerIndex } from './turns'
import { EffectAction } from '../types/cards'
import { effectConditionPasses, applyAction } from './effects'

// Helper para disparar prioridad en el jugador activo
export function triggerPriority(state: GameState, phase: GamePhase) {
  onPriorityWindow(state, { phase, activePlayer: getCurrentPlayerIndex(state) })
}

// Añadir un item a la pila
export function addToStack(
  state: GameState, 
  item: Omit<StackItem, 'id' | 'priority'>
): void {
  const stackItem: StackItem = {
    ...item,
    id: `stack_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
    priority: Date.now()
  }
  state.stack.push(stackItem)
  state.priorityPassed = [false, false]  // reset priority
  triggerPriority(state, state.turn.phase)
}

// Obtener la pila actual
export function getStack(state: GameState): StackItem[] {
  return state.stack.slice()
}

// Pasar prioridad de un jugador
export function passPriority(state: GameState, playerIndex: number): void {
  state.priorityPassed[playerIndex] = true
  if (state.priorityPassed.every(passed => passed)) {
    resolveStack(state)
  }
}

// Resolver la pila
export function resolveStack(state: GameState): void {
  while (state.stack.length > 0) {
    const item = state.stack.pop()!
    applyStackItem(state, item)
    state.priorityPassed = [false, false]
    triggerPriority(state, state.turn.phase)
  }
}

export function notifyCardPlayed(state: GameState, playerIndex: number, cardId: string): void {
  try {
    const card = getCardByIdGlobal(cardId)
    if (card?.classType === 'CAOS' && Array.isArray(card.effects)) {
      const actions: EffectAction[] = card.effects
        .filter((e: any) => e?.timing === 'ON_PLAY' && e?.action)
        .map((e: any) => e.action as EffectAction)
      if (actions.length) {
        const arr = state.players[playerIndex].playedChaosEffects ?? (state.players[playerIndex].playedChaosEffects = [] as EffectAction[])
        actions.forEach((a: EffectAction) => arr.push({ ...a }))
      }
    }
  } catch {}
  triggerPriority(state, state.turn.phase)
}

// Notificar que se ha disparado un efecto
export function notifyEffectTriggered(
  state: GameState,
  playerIndex: number,
  sourceId: string,
  timing: 'ON_PLAY'|'ON_ENTER'|'ON_DEATH'|'ON_ATTACK'|'END_OF_TURN'
): void {
  try {
    const card = getCardByIdGlobal(sourceId)
    if (!card || !card.effects) {
      return triggerPriority(state, state.turn.phase)
    }

    for (const eff of card.effects) {
      if (eff.timing !== timing) continue
      if (!effectConditionPasses(state, playerIndex, eff)) continue
    const hints = state.pendingTargets && state.pendingTargets.length ? ([...state.pendingTargets] as any[]) : undefined

      applyAction(state, playerIndex, eff.action, hints)
    }
  } catch {
  } finally {
    state.pendingTargets = []
    triggerPriority(state, state.turn.phase)
  }
}

// Notificar que una entidad entra al campo de batalla
export function notifyEnterBattlefield(state: GameState, playerIndex: number, entityId: string): void {
  triggerPriority(state, state.turn.phase)
}

// Notificar que una entidad sale del campo de batalla
export function notifyLeaveBattlefield(state: GameState, playerIndex: number, entityId: string): void {
  triggerPriority(state, state.turn.phase)
  state.players[playerIndex].allyDiedThisTurn = true
}

// Aplica el efecto de un item de la pila (debes implementar esta función en el engine)
export function applyStackItem(state: GameState, item: StackItem): void {
  // Implementa aquí la lógica para resolver el efecto del stack item
  // Por ejemplo, podrías llamar a applyAction, applyEffect, etc.
  // Este es un stub para que no falte nada en el archivo
}