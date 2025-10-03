import { GameState, GamePhase } from './game-state'
import { triggerPriority } from './priority'
import { triggerBoardEffects } from './effects'
import { applyFinalStandBonus } from './final-stand'

// =======================
// Gestión de turnos
// =======================

export function getCurrentPlayerIndex(state: GameState): number {
  return state.turn.currentPlayerIndex
}

export function getOpponentPlayerIndex(state: GameState): number {
  return 1 - state.turn.currentPlayerIndex
}

// Inicia el turno del jugador activo
export function startTurn(state: GameState): void {
  state.turn.turnNumber += 1 
  const i = getCurrentPlayerIndex(state)
  const p = state.players[i]
  state.turn.phase = GamePhase.START
  triggerPriority(state, GamePhase.START)

  if (p.maxMana < 10) p.maxMana += 1
  p.mana = p.maxMana

  // Roba carta excepto primer turno del primer jugador
  if (!(state.turn.turnNumber === 1 && i === 0)) {
    draw(state, i, 1)
  }

  // Despierta criaturas y resetea daño
  p.board.forEach(c => { c.exhausted = false; c.damagedThisTurn = false })

  // Estado de Eclipse/Ciclo
  if (p.classResource?.type === 'ESTADO') {
    if (!p.permanentEclipse && p.classResource.state === 'ECLIPSE') {
      p.classResource.state = 'DIA'
    }
  }

  // Reset flags de turno
  p.attackersDeclaredThisTurn = 0
  p.lastAttackTargetHero = false
  p.manualCycleChangedThisTurn = false
  p.allyDiedThisTurn = false
  p.specimenSummonedThisTurn = false

  // Triggers de inicio de turno
  triggerBoardEffects(state, i, 'START_OF_TURN' as any)

  state.turn.phase = GamePhase.MAIN
  triggerPriority(state, GamePhase.MAIN)
}
export function draw(state: GameState, playerIndex: number, count = 1): void {
  const p = state.players[playerIndex]
  for (let i = 0; i < count; i++) {
    const top = p.deck.shift()
    if (!top) break
    p.hand.push(top)
  }
}
// =======================

// Finaliza el turno del jugador activo
export function endTurn(state: GameState): void {
  const i = getCurrentPlayerIndex(state)
  const p = state.players[i]

  state.turn.phase = GamePhase.END
  triggerPriority(state, GamePhase.END)

  // Triggers de fin de turno
  triggerBoardEffects(state, i, 'END_OF_TURN' as any)

  // Ejecuta tareas programadas para fin de turno
  if (state.endOfTurnTasks && state.endOfTurnTasks.length) {
    const tasks = state.endOfTurnTasks.splice(0, state.endOfTurnTasks.length)
    tasks.forEach(fn => { try { fn() } catch {} })
  }

  // Cambio de estado de Eclipse/Ciclo
  if (p.classResource?.type === 'ESTADO') {
    if (!p.permanentEclipse) {
      if (p.classResource.state === 'DIA') p.classResource.state = 'NOCHE'
      else if (p.classResource.state === 'NOCHE') p.classResource.state = 'DIA'
      else if (p.classResource.state === 'ECLIPSE') p.classResource.state = 'DIA'
    }
  }

  // Cambia jugador activo
  state.turn.currentPlayerIndex = getOpponentPlayerIndex(state)
  state.turn.phase = GamePhase.START
  triggerPriority(state, GamePhase.START)
}

// Avanza al siguiente turno (usado para efectos especiales)
export function nextTurn(state: GameState): void {
  // Cambiar jugador activo
  state.turn.currentPlayerIndex = getOpponentPlayerIndex(state)
  state.turn.phase = GamePhase.MAIN

  const activePlayer = state.players[getCurrentPlayerIndex(state)]

  // Aplica bonus de Final Stand si corresponde
  applyFinalStandBonus(state, state.turn.currentPlayerIndex)

  // Lógica de inicio de turno especial
  activePlayer.mana = Math.min(10, activePlayer.maxMana || 0)
  activePlayer.maxMana = Math.min(10, (activePlayer.maxMana || 0) + 1)

  endTurn(state)
  startTurn(state)
}