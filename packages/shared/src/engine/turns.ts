import { GameState, GamePhase } from './game-state'
import { triggerPriority } from './priority'
import { triggerBoardEffects, updateConditionalBuffs } from './effects/board-effects'
import { applyFinalStandBonus } from './final-stand'

// =======================
// Gestión de turnos
// =======================

/** Mano máxima; el exceso al robar va al cementerio. */
export const MAX_HAND_SIZE = 10

export function addCardToHandOrGraveyard(state: GameState, playerIndex: number, cardId: string): void {
  const p = state.players[playerIndex]
  if (p.hand.length >= MAX_HAND_SIZE) {
    p.graveyard.unshift(cardId)
    state.lastHandOverflowDiscard = { playerIndex, cardId, at: Date.now() }
  } else {
    p.hand.push(cardId)
  }
}

export function getCurrentPlayerIndex(state: GameState): number {
  return state.turn.currentPlayerIndex
}

export function getOpponentPlayerIndex(state: GameState): number {
  return 1 - state.turn.currentPlayerIndex
}


// Inicia el turno del jugador activo (estilo Hearthstone)
export function startTurn(state: GameState): void {
  state.turn.turnNumber += 1 
  const i = getCurrentPlayerIndex(state)
  const p = state.players[i]

  console.log('[TURN] Starting turn', { turnNumber: state.turn.turnNumber, player: i })

  // APLICA BONUS DE FINAL STAND
    applyFinalStandBonus(state, i)
    
  // Incrementa maná máximo (hasta 10)
  if (p.maxMana < 10) p.maxMana += 1
  p.mana = p.maxMana
  console.log('[TURN] Mana restored', { mana: p.mana, maxMana: p.maxMana })

  // Roba carta (excepto primer turno del primer jugador)
  if (!(state.turn.turnNumber === 1 && i === 0)) {
    draw(state, i, 1)
    console.log('[TURN] Drew card', { handSize: p.hand.length })
  }

  // Despierta criaturas y resetea flags de daño
  p.board.forEach(c => { 
    // Regla especial Coloso de Hierro:
    // permanece exhausto hasta "despertar" ganando PRISA.
    if (c.cardId === 'Coloso_de_Hierro' && !c.abilities.includes('PRISA')) {
      c.exhausted = true
    } else {
      c.exhausted = false
    }
    c.impatientHeroLockThisTurn = false
    c.damagedThisTurn = false 
  })
  console.log('[TURN] Creatures awakened', { boardSize: p.board.length })

  // Reset flags de turno
  p.attackersDeclaredThisTurn = 0
  p.lastAttackTargetHero = false
  p.allyDiedThisTurn = false
  p.alliesDiedThisTurnCount = 0
  p.specimenSummonedThisTurn = false

  // Triggers de inicio de turno
  triggerBoardEffects(state, i, 'START_OF_TURN' as any)

  // Actualizar buffs condicionales
  updateConditionalBuffs(state, i)

  // Establecer fase de juego (única fase donde puedes hacer todo)
  state.turn.phase = GamePhase.PLAYING
  console.log('[TURN] Now in PLAYING phase - you can play cards and attack in any order')
}
export function draw(state: GameState, playerIndex: number, count = 1): void {
  const p = state.players[playerIndex]
  for (let i = 0; i < count; i++) {
    const top = p.deck.shift()
    if (!top) break
    addCardToHandOrGraveyard(state, playerIndex, top)
  }
  updateConditionalBuffs(state, playerIndex)
}
// =======================

// Finaliza el turno del jugador activo (estilo Hearthstone)
export function endTurn(state: GameState): void {
  const i = state.turn.currentPlayerIndex
  const p = state.players[i]
  
  console.log('[TURN] Ending turn', { turnNumber: state.turn.turnNumber, player: i })
  
  // Limpia recursos temporales del turno
  p.lifeCredit = undefined
  p.freeLifeCosts = false
  p.cardCostReduction = undefined
  
  // Limpia buffs temporales de criaturas
  for (const creature of p.board) {
    if (creature.tempDrawOnKill) {
      console.log('[TURN] Clearing temporary buff', { 
        creatureId: creature.id, 
        cardId: creature.cardId,
        buff: 'tempDrawOnKill'
      })
      delete creature.tempDrawOnKill
    }
  }

  // Triggers de fin de turno
  triggerBoardEffects(state, i, 'END_OF_TURN' as any)
  console.log('[TURN] End of turn effects triggered')

  // Ejecuta tareas programadas para fin de turno
  if (state.endOfTurnTasks && state.endOfTurnTasks.length) {
    const tasks = state.endOfTurnTasks.splice(0, state.endOfTurnTasks.length)
    tasks.forEach(fn => { try { fn() } catch {} })
    console.log('[TURN] Executed end of turn tasks', { count: tasks.length })
  }

  // Cambiar al siguiente jugador
  state.turn.currentPlayerIndex = getOpponentPlayerIndex(state)
  console.log('[TURN] Switching to player', state.turn.currentPlayerIndex)
  
  // Iniciar turno del siguiente jugador
  startTurn(state)
}

// Avanza al siguiente turno (usado para efectos especiales que saltan turnos)
export function nextTurn(state: GameState): void {
  console.log('[TURN] Skipping to next turn (special effect)')
  endTurn(state)
  // El startTurn ya es llamado por endTurn
}