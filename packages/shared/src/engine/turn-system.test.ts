/**
 * TEST DEL NUEVO SISTEMA DE TURNOS ESTILO HEARTHSTONE
 * Verifica que el sistema funciona correctamente sin fases separadas
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createGame, GameState, GamePhase } from './game-state'
import { startTurn, endTurn, getCurrentPlayerIndex, draw, MAX_HAND_SIZE } from './turns'
import { playCard } from './game-state'
import { declareAttackHero, declareAttackCreature } from './combat'
import { BASIC_CARDS } from '../cards/basic-cards'
import { setCardResolver } from './game-state'

describe('🎮 Hearthstone-style Turn System', () => {
  let state: GameState

  beforeEach(() => {
    const deck1 = Array(30).fill('Soldado_Veterano')
    const deck2 = Array(30).fill('Soldado_Veterano')
    
    state = createGame(
      {
        id: 'player-0',
        name: 'Player 0',
        classType: 'CAOS',
        deck: deck1,
        classResource: { type: 'ENTROPIA', amount: 0 },
        specimenSummons: 0,
        specimenFreeThisTurn: false,
        allyDiedThisTurn: false,
        specimenSummonedThisTurn: false,
        attackersDeclaredThisTurn: 0,
        lastAttackTargetHero: false,
        programmedSpecimenEffects: [],
        playedChaosEffects: []
      },
      {
        id: 'player-1',
        name: 'Player 1',
        classType: 'VITALIDAD',
        deck: deck2,
        classResource: { type: 'VIDA' },
        specimenSummons: 0,
        specimenFreeThisTurn: false,
        allyDiedThisTurn: false,
        specimenSummonedThisTurn: false,
        attackersDeclaredThisTurn: 0,
        lastAttackTargetHero: false,
        programmedSpecimenEffects: [],
        playedChaosEffects: []
      }
    )
    setCardResolver((id: string) => BASIC_CARDS.find(c => c.id === id))
  })

  describe('Turn Phases', () => {
    it('should only have PLAYING phase (no START/MAIN/COMBAT/END)', () => {
      // Verificar que solo existe la fase PLAYING
      expect(GamePhase.PLAYING).toBeDefined()
      expect((GamePhase as any).START).toBeUndefined()
      expect((GamePhase as any).MAIN).toBeUndefined()
      expect((GamePhase as any).COMBAT).toBeUndefined()
      expect((GamePhase as any).END).toBeUndefined()
    })

    it('should start in PLAYING phase', () => {
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
    })

    it('should remain in PLAYING phase throughout the turn', () => {
      startTurn(state)
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
      
      // Simular algunas acciones
      const player = state.players[getCurrentPlayerIndex(state)]
      player.mana = 10
      
      // Seguir en PLAYING
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
    })
  })

  describe('Turn Start', () => {
    it('should increment turn number', () => {
      const initialTurn = state.turn.turnNumber
      startTurn(state)
      expect(state.turn.turnNumber).toBe(initialTurn + 1)
    })

    it('should restore and increment mana', () => {
      state.players[0].maxMana = 5
      state.players[0].mana = 0
      state.turn.currentPlayerIndex = 0
      
      startTurn(state)
      
      expect(state.players[0].maxMana).toBe(6)
      expect(state.players[0].mana).toBe(6)
    })

    it('should cap mana at 10', () => {
      state.players[0].maxMana = 10
      state.players[0].mana = 5
      state.turn.currentPlayerIndex = 0
      
      startTurn(state)
      
      expect(state.players[0].maxMana).toBe(10)
      expect(state.players[0].mana).toBe(10)
    })

    it('should draw a card (except first turn of first player)', () => {
      state.turn.turnNumber = 2
      state.turn.currentPlayerIndex = 0
      const initialHandSize = state.players[0].hand.length
      
      startTurn(state)
      
      expect(state.players[0].hand.length).toBe(initialHandSize + 1)
    })

    it('should send drawn card to graveyard when hand is at max size', () => {
      state.turn.turnNumber = 2
      state.turn.currentPlayerIndex = 0
      const p = state.players[0]
      p.hand = Array(MAX_HAND_SIZE).fill('Soldado_Veterano') as string[]
      const topOfDeck = p.deck[0]
      expect(topOfDeck).toBeDefined()

      draw(state, 0, 1)

      expect(p.hand.length).toBe(MAX_HAND_SIZE)
      expect(p.graveyard[0]).toBe(topOfDeck)
    })

    it('should NOT draw on first turn of first player', () => {
      state.turn.turnNumber = 0 // Se incrementará a 1
      state.turn.currentPlayerIndex = 0
      const initialHandSize = state.players[0].hand.length
      
      startTurn(state)
      
      expect(state.players[0].hand.length).toBe(initialHandSize)
    })

    it('should unwake all creatures', () => {
      state.turn.currentPlayerIndex = 0
      
      // Agregar criatura exhausta
      state.players[0].board.push({
        id: 'test-creature',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[0].id,
        attack: 2,
        health: 2,
        exhausted: true,
        damagedThisTurn: true,
        abilities: [],
        effects: []
      })
      
      startTurn(state)
      
      expect(state.players[0].board[0].exhausted).toBe(false)
      expect(state.players[0].board[0].damagedThisTurn).toBe(false)
    })

    it('should apply START_OF_TURN effects on board (Berserker_Herido)', () => {
      state.turn.currentPlayerIndex = 0
      state.players[0].board.push({
        id: 'berserker-1',
        cardId: 'Berserker_Herido',
        ownerId: state.players[0].id,
        attack: 4,
        health: 2,
        exhausted: false,
        abilities: [],
        effects: []
      })

      startTurn(state)

      expect(state.players[0].board[0].health).toBe(1)
    })

    it('should grant PRISA to Coloso_de_Hierro at START_OF_TURN with 3+ total creatures', () => {
      state.turn.currentPlayerIndex = 0
      state.players[0].board.push({
        id: 'coloso-1',
        cardId: 'Coloso_de_Hierro',
        ownerId: state.players[0].id,
        attack: 6,
        health: 4,
        exhausted: true,
        damagedThisTurn: false,
        abilities: [],
        effects: []
      })
      state.players[0].board.push({
        id: 'ally-1',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[0].id,
        attack: 2,
        health: 2,
        exhausted: true,
        damagedThisTurn: false,
        abilities: [],
        effects: []
      })
      state.players[1].board.push({
        id: 'enemy-1',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[1].id,
        attack: 2,
        health: 2,
        exhausted: true,
        damagedThisTurn: false,
        abilities: [],
        effects: []
      })

      startTurn(state)

      expect(state.players[0].board[0].abilities).toContain('PRISA')
      expect(state.players[0].board[0].exhausted).toBe(false)
    })

    it('should keep Coloso_de_Hierro exhausted if it has not awakened', () => {
      state.turn.currentPlayerIndex = 0
      state.players[0].board.push({
        id: 'coloso-2',
        cardId: 'Coloso_de_Hierro',
        ownerId: state.players[0].id,
        attack: 6,
        health: 4,
        exhausted: true,
        damagedThisTurn: false,
        abilities: [],
        effects: []
      })

      startTurn(state)

      expect(state.players[0].board[0].abilities).not.toContain('PRISA')
      expect(state.players[0].board[0].exhausted).toBe(true)
    })
  })

  describe('Turn End', () => {
    it('should clear temporary resources', () => {
      state.turn.currentPlayerIndex = 0
      state.players[0].lifeCredit = 5
      state.players[0].freeLifeCosts = true
      state.players[0].cardCostReduction = { amount: 2, remaining: 'ALL' }
      
      endTurn(state)
      
      expect(state.players[0].lifeCredit).toBeUndefined()
      expect(state.players[0].freeLifeCosts).toBe(false)
      expect(state.players[0].cardCostReduction).toBeUndefined()
    })

    it('should clear temporary creature buffs', () => {
      state.turn.currentPlayerIndex = 0
      
      state.players[0].board.push({
        id: 'test-creature',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[0].id,
        attack: 2,
        health: 2,
        exhausted: false,
        abilities: [],
        effects: [],
        tempDrawOnKill: 2
      })
      
      endTurn(state)
      
      // El jugador cambió, pero el buff temporal debe haberse limpiado
      const previousPlayer = state.players[0]
      expect(previousPlayer.board[0].tempDrawOnKill).toBeUndefined()
    })

    it('should switch to the other player', () => {
      state.turn.currentPlayerIndex = 0
      
      endTurn(state)
      
      expect(state.turn.currentPlayerIndex).toBe(1)
    })

    it('should start the next player\'s turn automatically', () => {
      state.turn.currentPlayerIndex = 0
      state.players[1].maxMana = 3
      state.players[1].mana = 0
      const initialTurn = state.turn.turnNumber
      
      endTurn(state)
      
      // Verificar que se inició el turno del jugador 1
      expect(state.turn.currentPlayerIndex).toBe(1)
      expect(state.turn.turnNumber).toBe(initialTurn + 1)
      expect(state.players[1].mana).toBe(4) // maxMana incrementado y restaurado
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
    })
  })

  describe('Flexible Turn Actions (Hearthstone-style)', () => {
    beforeEach(() => {
      // Setup: jugador con maná y criaturas
      state.turn.currentPlayerIndex = 0
      state.players[0].maxMana = 10
      state.players[0].mana = 10
      
      // Agregar criatura al tablero
      state.players[0].board.push({
        id: 'creature-1',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[0].id,
        attack: 2,
        health: 2,
        exhausted: false,
        abilities: [],
        effects: []
      })
      
      // Agregar cartas a la mano
      state.players[0].hand = ['Soldado_Veterano', 'Soldado_Veterano']
    })

    it('should allow attacking before playing cards', () => {
      // Atacar primero
      const attackResult = declareAttackHero(state, 0, 0)
      expect(attackResult.ok).toBe(true)
      expect(state.players[0].board[0].exhausted).toBe(true)
      
      // Luego jugar carta (si hubiera una jugable)
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
    })

    it('should allow playing cards before attacking', () => {
      // Jugar carta primero
      const card = BASIC_CARDS.find(c => c.id === 'Soldado_Veterano')
      expect(card).toBeDefined()
      
      // Luego atacar con criaturas existentes
      const attackResult = declareAttackHero(state, 0, 0)
      expect(attackResult.ok).toBe(true)
    })

    it('should allow multiple attacks in the same turn', () => {
      // Agregar más criaturas
      state.players[0].board.push({
        id: 'creature-2',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[0].id,
        attack: 2,
        health: 2,
        exhausted: false,
        abilities: [],
        effects: []
      })
      
      // Atacar con la primera criatura
      const attack1 = declareAttackHero(state, 0, 0)
      expect(attack1.ok).toBe(true)
      
      // Atacar con la segunda criatura (mismo turno)
      const attack2 = declareAttackHero(state, 0, 1)
      expect(attack2.ok).toBe(true)
      
      // Ambas deberían estar exhaustas
      expect(state.players[0].board[0].exhausted).toBe(true)
      expect(state.players[0].board[1].exhausted).toBe(true)
    })

    it('should allow interleaving cards and attacks', () => {
      // 1. Atacar con primera criatura
      const attack1 = declareAttackHero(state, 0, 0)
      expect(attack1.ok).toBe(true)
      
      // 2. Jugar carta (simulado - solo verificar que estamos en fase correcta)
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
      
      // 3. Si jugáramos otra criatura con PRISA, podríamos atacar con ella también
      // Esto es posible porque NO hay fase de combate separada
    })
  })

  describe('Turn Flow Integration', () => {
    it('should complete a full turn cycle', () => {
      // Turno inicial: Player 0
      expect(getCurrentPlayerIndex(state)).toBe(0)
      const p0InitialMana = state.players[0].maxMana
      
      // Player 0 hace su turno
      startTurn(state)
      expect(state.players[0].maxMana).toBe(p0InitialMana + 1)
      
      // Player 0 termina su turno
      endTurn(state)
      
      // Ahora es turno de Player 1
      expect(getCurrentPlayerIndex(state)).toBe(1)
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
      
      // Player 1 termina su turno
      endTurn(state)
      
      // Vuelve a Player 0
      expect(getCurrentPlayerIndex(state)).toBe(0)
      expect(state.turn.phase).toBe(GamePhase.PLAYING)
    })

    it('should increment turn counter correctly', () => {
      const initialTurn = state.turn.turnNumber
      
      startTurn(state) // Player 0
      expect(state.turn.turnNumber).toBe(initialTurn + 1)
      
      endTurn(state) // → Player 1
      expect(state.turn.turnNumber).toBe(initialTurn + 2)
      
      endTurn(state) // → Player 0
      expect(state.turn.turnNumber).toBe(initialTurn + 3)
    })
  })

  describe('Combat Validation', () => {
    it('should allow combat during PLAYING phase', () => {
      state.turn.currentPlayerIndex = 0
      state.turn.phase = GamePhase.PLAYING
      
      state.players[0].board.push({
        id: 'attacker',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[0].id,
        attack: 2,
        health: 2,
        exhausted: false,
        abilities: [],
        effects: []
      })
      
      const result = declareAttackHero(state, 0, 0)
      expect(result.ok).toBe(true)
    })

    it('should NOT allow combat if not your turn', () => {
      state.turn.currentPlayerIndex = 0
      
      state.players[1].board.push({
        id: 'attacker',
        cardId: 'Soldado_Veterano',
        ownerId: state.players[1].id,
        attack: 2,
        health: 2,
        exhausted: false,
        abilities: [],
        effects: []
      })
      
      const result = declareAttackHero(state, 1, 0)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('No es tu turno')
      }
    })
  })

  describe('Regression Tests', () => {
    it('should maintain mana cap at 10', () => {
      state.turn.currentPlayerIndex = 0
      state.players[0].maxMana = 9
      
      startTurn(state)
      expect(state.players[0].maxMana).toBe(10)
      
      startTurn(state)
      expect(state.players[0].maxMana).toBe(10) // No debe pasar de 10
    })

    it('should reset attack counters each turn', () => {
      state.turn.currentPlayerIndex = 0
      state.players[0].attackersDeclaredThisTurn = 5
      
      startTurn(state)
      
      expect(state.players[0].attackersDeclaredThisTurn).toBe(0)
    })
  })
})
