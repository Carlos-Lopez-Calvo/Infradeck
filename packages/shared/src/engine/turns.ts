import { GameState, GamePhase, getCardByIdGlobal } from './game-state'
import { triggerPriority } from './priority'
import { triggerBoardEffects, applyGuardianAura, updateConditionalBuffs } from './effects'
import { applyFinalStandBonus } from './final-stand'
import { getCurrentForm, CycleState } from '../types/cards'

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

    // APLICA BONUS DE FINAL STAND AQUÍ
    applyFinalStandBonus(state, i)
    
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
      // Sincroniza formas de cartas CICLO del jugador activo
      if (p.classResource.state) {
        for (let bi = 0; bi < p.board.length; bi++) {
          const ent = p.board[bi]
          const base: any = getCardByIdGlobal(ent.cardId)
          if (!base || !base.dayForm || base.transformsWithCycle !== true) continue
          const form = getCurrentForm(base, p.classResource.state as CycleState)
          ent.attack = form.attack ?? ent.attack
        const newMax = form.health ?? ent.health
        if (ent.health > newMax) ent.health = newMax
          ent.abilities = form.abilities ? form.abilities.map((a: any) => String(a)) : []
        }
      }
      // Recalcula auras dinámicas (Guardian_del_Equilibrio)
      applyGuardianAura(state, i)
    }

    
  // Reset flags de turno
  p.attackersDeclaredThisTurn = 0
  p.lastAttackTargetHero = false
  p.manualCycleChangedThisTurn = false
  p.allyDiedThisTurn = false
  p.specimenSummonedThisTurn = false

  // Triggers de inicio de turno
  triggerBoardEffects(state, i, 'START_OF_TURN' as any)

  // Actualizar buffs condicionales al inicio del turno
  updateConditionalBuffs(state, i)

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
  const i = state.turn.currentPlayerIndex
  state.players[i].lifeCredit = undefined
  state.players[i].freeLifeCosts = false
  const p = state.players[i]
  p.cardCostReduction = undefined   // ← limpia descuento global al final del turno
  
  // Limpia buffs temporales de criaturas (tempDrawOnKill)
  for (const creature of p.board) {
    if (creature.tempDrawOnKill) {
      console.log('[END_TURN] clearing tempDrawOnKill', { 
        creatureId: creature.id, 
        cardId: creature.cardId 
      })
      delete creature.tempDrawOnKill
    }
  }

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
    // Sincroniza formas de cartas CICLO del jugador activo tras el cambio
    if (p.classResource.state) {
      for (let bi = 0; bi < p.board.length; bi++) {
        const ent = p.board[bi]
        const base = getCardByIdGlobal(ent.cardId)
        if (!base || !(base as any).dayForm || (base as any).transformsWithCycle !== true) continue
        const form = getCurrentForm(base as any, p.classResource.state as CycleState)
        ent.attack = form.attack ?? ent.attack
        const newMax = form.health ?? ent.health
        if (ent.health > newMax) ent.health = newMax
        ent.abilities = form.abilities ? form.abilities.map(a => String(a)) : []
      }
    }
    // Recalcula auras dinámicas (Guardian_del_Equilibrio) tras el cambio
    applyGuardianAura(state, i)
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