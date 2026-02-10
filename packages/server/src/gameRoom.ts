import type { GameRoom, Player } from './types.js'
import { getCardById } from './card-resolver.js'
import * as GameEngine from './game-engine.js'
import { detectTargetRequirement } from './target-detector.js'
import { setDiscoverHandler, setScryHandler } from './game-handlers.js'

export class GameRoomManager {
  private rooms = new Map<string, GameRoom>()

  createRoom(roomId: string): GameRoom {
    const room: GameRoom = {
      id: roomId,
      players: [],
      gameState: null,
      status: 'waiting',
      createdAt: Date.now()
    }
    this.rooms.set(roomId, room)
    return room
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId)
  }

  addPlayerToRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.players.length >= 2) return false
    
    room.players.push(player)
    return true
  }

  removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) return
    
    room.players = room.players.filter(p => p.id !== playerId)
    
    // Si no quedan jugadores, eliminar sala
    if (room.players.length === 0) {
      this.rooms.delete(roomId)
    }
  }

  async startGame(roomId: string): Promise<any | null> {
    const room = this.rooms.get(roomId)
    if (!room || room.players.length !== 2) return null

    // Crear mazo de ejemplo para VITALIDAD (30 cartas)
    const defaultDeck = [
      // Cartas básicas (1 maná) - 10 cartas
      'Mercenario', 'Mercenario',
      'Asesino_Delarossa', 'Asesino_Delarossa',
      'Guardian_Novato', 'Guardian_Novato',
      'Primera_Oportunidad', 'Primera_Oportunidad',
      'Cuchilla_Envenenada', 'Cuchilla_Envenenada',
      
      // Cartas básicas (2-3 maná) - 6 cartas
      'Explorador_Audaz', 'Explorador_Audaz',
      'Soldado_Veterano', 'Soldado_Veterano', 'Soldado_Veterano',
      'Curandero_Sabio',
      
      // Cartas de clase VITALIDAD - 14 cartas
      'Fanatico_Desesperado', 'Fanatico_Desesperado',
      'Berserker_Sanguinario', 'Berserker_Sanguinario',
      'Cazador_de_Recompensas', 'Cazador_de_Recompensas',
      'Ritual_Sangriento', 'Ritual_Sangriento',
      'Guerrero_Herido', 'Guerrero_Herido',
      'Senor_de_la_Sangre', 'Senor_de_la_Sangre',
      'Pacto_de_Poder', 'Pacto_de_Poder'
    ]

    // Usar las funciones correctas del motor de juego
    const gameState = await GameEngine.createGame(
      { 
        id: room.players[0].id, 
        name: room.players[0].name, 
        classType: 'VITALIDAD', 
        deck: [...defaultDeck],
        programmedSpecimenEffects: []
      },
      { 
        id: room.players[1].id, 
        name: room.players[1].name, 
        classType: 'VITALIDAD', 
        deck: [...defaultDeck],
        programmedSpecimenEffects: []
      }
    )

    // Iniciar el juego (esto roba las cartas iniciales automáticamente)
    await GameEngine.startGame(gameState)

    room.gameState = gameState
    room.status = 'playing'

    return gameState
  }

  async handlePlayCard(
    roomId: string, 
    playerId: string, 
    handIndex: number, 
    targets?: any[],
    discoverChoice?: string,
    scryDecision?: 'TOP' | 'BOTTOM'
  ): Promise<{ 
    success: boolean
    gameState?: any
    error?: string
    needsTarget?: boolean
    targetType?: string
    needsDiscover?: boolean
    discoverOptions?: Array<{ id: string; label: string; preview?: any }>
    needsScry?: boolean
    scryCards?: string[]
  }> {
    const room = this.rooms.get(roomId)
    if (!room || !room.gameState) {
      return { success: false, error: 'Room or game not found' }
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      return { success: false, error: 'Player not in room' }
    }

    if (room.gameState.turn.currentPlayerIndex !== playerIndex) {
      return { success: false, error: 'Not your turn' }
    }

    const player = room.gameState.players[playerIndex]
    
    // Verificar que el índice de la mano sea válido
    if (handIndex < 0 || handIndex >= player.hand.length) {
      return { success: false, error: 'Invalid hand index' }
    }

    const cardId = player.hand[handIndex]
    const card = getCardById(cardId)
    
    if (!card) {
      return { success: false, error: 'Card not found' }
    }

    // Detectar qué tipo de interacción necesita la carta
    const req = detectTargetRequirement(card, room.gameState, playerIndex)
    
    // Si necesita discover y no se ha proporcionado la elección
    if (req.needsDiscover && !discoverChoice) {
      return { 
        success: false, 
        needsDiscover: true, 
        discoverOptions: req.discoverOptions,
        error: 'Card needs discover selection'
      }
    }
    
    // Si necesita scry y no se ha proporcionado la decisión
    if (req.needsScry && !scryDecision) {
      return { 
        success: false, 
        needsScry: true, 
        scryCards: req.scryCards,
        error: 'Card needs scry decision'
      }
    }
    
    // Si necesita targets y no se han proporcionado
    if (req.needsTarget && (!targets || targets.length === 0)) {
      return { 
        success: false, 
        needsTarget: true, 
        targetType: req.targetType,
        error: 'Card needs target selection'
      }
    }

    // Configurar handlers para discover y scry antes de jugar la carta
    // Esto permitirá que el motor de juego use las decisiones del jugador
    if (discoverChoice) {
      console.log('[GAME_ROOM] Setting discover handler with choice:', discoverChoice)
      await setDiscoverHandler(() => discoverChoice)
    }
    
    if (scryDecision) {
      console.log('[GAME_ROOM] Setting scry handler with decision:', scryDecision)
      await setScryHandler(() => scryDecision)
    }

    // Usar la función del motor de juego
    const result = await GameEngine.playCard(
      room.gameState, 
      playerIndex, 
      handIndex, 
      getCardById, 
      { targets }
    )

    if (result.ok) {
      return { success: true, gameState: room.gameState }
    } else {
      return { success: false, error: result.error }
    }
  }

  async handleEndTurn(roomId: string, playerId: string): Promise<{ success: boolean; gameState?: any; error?: string }> {
    const room = this.rooms.get(roomId)
    if (!room || !room.gameState) {
      return { success: false, error: 'Room or game not found' }
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      return { success: false, error: 'Player not in room' }
    }

    if (room.gameState.turn.currentPlayerIndex !== playerIndex) {
      return { success: false, error: 'Not your turn' }
    }

    // Usar la función del motor de juego
    await GameEngine.endTurn(room.gameState)
    
    return { success: true, gameState: room.gameState }
  }

  async handleAttack(
    roomId: string,
    playerId: string,
    attackerIndex: number,
    targetType: 'hero' | 'creature',
    targetIndex?: number
  ): Promise<{ success: boolean; gameState?: any; error?: string }> {
    const room = this.rooms.get(roomId)
    if (!room || !room.gameState) {
      return { success: false, error: 'Room or game not found' }
    }

    const playerIndex = room.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) {
      return { success: false, error: 'Player not in room' }
    }

    // Usar las funciones del motor de juego
    if (targetType === 'hero') {
      const result = await GameEngine.declareAttackHero(room.gameState, playerIndex, attackerIndex)
      if (result.ok) {
        return { success: true, gameState: room.gameState }
      } else {
        return { success: false, error: result.error }
      }
    } else {
      if (targetIndex === undefined) {
        return { success: false, error: 'Target index required for creature attack' }
      }
      const result = await GameEngine.declareAttackCreature(room.gameState, playerIndex, attackerIndex, targetIndex)
      if (result.ok) {
        return { success: true, gameState: room.gameState }
      } else {
        return { success: false, error: result.error }
      }
    }
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId)
  }
}
