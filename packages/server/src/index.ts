import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { nanoid } from 'nanoid'
import { GameRoomManager } from './gameRoom.js'
import { MatchmakingQueue } from './matchmaking.js'
import type { ClientToServerEvents, ServerToClientEvents, Player } from './types.js'

const app = express()
const httpServer = createServer(app)

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

const gameRoomManager = new GameRoomManager()
const matchmakingQueue = new MatchmakingQueue()

// Mapa de socketId a playerId y roomId
const socketToPlayer = new Map<string, { playerId: string; roomId?: string }>()

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`)

  // Generar ID único para el jugador
  const playerId = nanoid()
  socketToPlayer.set(socket.id, { playerId })

  socket.emit('connection:success', { playerId })

  // ==========================================
  // MATCHMAKING
  // ==========================================
  socket.on('matchmaking:join', (playerName) => {
    console.log(`[MM] Player ${playerName} (${playerId}) joining matchmaking`)

    const player: Player = {
      id: playerId,
      socketId: socket.id,
      name: playerName,
      ready: false
    }

    matchmakingQueue.addPlayer(player)
    socket.emit('matchmaking:waiting')

    // Intentar hacer match
    const match = matchmakingQueue.findMatch()
    if (match) {
      console.log(`[MM] Match found! Room: ${match.roomId}`)
      console.log(`  - Player 1: ${match.player1.name}`)
      console.log(`  - Player 2: ${match.player2.name}`)

      // Crear sala
      const room = gameRoomManager.createRoom(match.roomId)
      gameRoomManager.addPlayerToRoom(match.roomId, match.player1)
      gameRoomManager.addPlayerToRoom(match.roomId, match.player2)

      // Actualizar mapa
      socketToPlayer.set(match.player1.socketId, { playerId: match.player1.id, roomId: match.roomId })
      socketToPlayer.set(match.player2.socketId, { playerId: match.player2.id, roomId: match.roomId })

      // Unir sockets a la sala
      io.sockets.sockets.get(match.player1.socketId)?.join(match.roomId)
      io.sockets.sockets.get(match.player2.socketId)?.join(match.roomId)

      // Notificar a ambos jugadores
      io.to(match.player1.socketId).emit('matchmaking:matched', { 
        roomId: match.roomId, 
        opponentName: match.player2.name 
      })
      io.to(match.player2.socketId).emit('matchmaking:matched', { 
        roomId: match.roomId, 
        opponentName: match.player1.name 
      })

      // Iniciar juego automáticamente después de 2 segundos
      setTimeout(async () => {
        console.log(`[GAME] Starting game in room ${match.roomId}`)
        const gameState = await gameRoomManager.startGame(match.roomId)
        if (gameState) {
          io.to(match.roomId).emit('game:start', gameState)
          console.log(`[GAME] Game started successfully`)
        } else {
          console.error(`[GAME] Failed to start game`)
        }
      }, 2000)
    }
  })

  socket.on('matchmaking:leave', () => {
    console.log(`[MM] Player ${playerId} leaving matchmaking`)
    matchmakingQueue.removePlayer(playerId)
  })

  // ==========================================
  // GAME ACTIONS
  // ==========================================
  socket.on('game:playCard', async (data) => {
    const playerData = socketToPlayer.get(socket.id)
    if (!playerData?.roomId) {
      socket.emit('game:error', 'Not in a game room')
      return
    }

    console.log(`[GAME] Player ${playerId} playing card ${data.handIndex}${data.targets ? ' with targets' : ''}`)

    const result = await gameRoomManager.handlePlayCard(
      playerData.roomId,
      playerData.playerId,
      data.handIndex,
      data.targets
    )

    if (result.success && result.gameState) {
      // Broadcast a toda la sala
      io.to(playerData.roomId).emit('game:stateUpdate', result.gameState)
      
      // Notificar al oponente
      socket.to(playerData.roomId).emit('opponent:playCard', { cardId: 'card_played' })
      
      console.log(`[GAME] Card played successfully`)
    } else if (result.needsDiscover) {
      // La carta necesita discover (elegir entre opciones)
      socket.emit('game:needsDiscover', { 
        handIndex: data.handIndex,
        options: result.discoverOptions || []
      })
      console.log(`[GAME] Card needs discover: ${result.discoverOptions?.length} options`)
    } else if (result.needsScry) {
      // La carta necesita scry (decidir sobre cartas del mazo)
      socket.emit('game:needsScry', { 
        handIndex: data.handIndex,
        cards: result.scryCards || []
      })
      console.log(`[GAME] Card needs scry: ${result.scryCards?.length} cards`)
    } else if (result.needsTarget) {
      // La carta necesita selección de targets
      socket.emit('game:needsTarget', { 
        handIndex: data.handIndex,
        targetType: result.targetType 
      })
      console.log(`[GAME] Card needs target selection: ${result.targetType}`)
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
      console.error(`[GAME] Error playing card: ${result.error}`)
    }
  })

  // Handler para respuesta de discover
  socket.on('game:discoverResponse', async (data) => {
    const playerData = socketToPlayer.get(socket.id)
    if (!playerData?.roomId) {
      socket.emit('game:error', 'Not in a game room')
      return
    }

    console.log(`[GAME] Player ${playerId} made discover choice: ${data.choice}`)

    const result = await gameRoomManager.handlePlayCard(
      playerData.roomId,
      playerData.playerId,
      data.handIndex,
      undefined, // no targets
      data.choice // discover choice
    )

    if (result.success && result.gameState) {
      io.to(playerData.roomId).emit('game:stateUpdate', result.gameState)
      socket.to(playerData.roomId).emit('opponent:playCard', { cardId: 'card_played' })
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
      console.error(`[GAME] Error after discover: ${result.error}`)
    }
  })

  // Handler para respuesta de scry
  socket.on('game:scryResponse', async (data) => {
    const playerData = socketToPlayer.get(socket.id)
    if (!playerData?.roomId) {
      socket.emit('game:error', 'Not in a game room')
      return
    }

    console.log(`[GAME] Player ${playerId} made scry decision: ${data.decision}`)

    const result = await gameRoomManager.handlePlayCard(
      playerData.roomId,
      playerData.playerId,
      data.handIndex,
      undefined, // no targets
      undefined, // no discover choice
      data.decision // scry decision
    )

    if (result.success && result.gameState) {
      io.to(playerData.roomId).emit('game:stateUpdate', result.gameState)
      socket.to(playerData.roomId).emit('opponent:playCard', { cardId: 'card_played' })
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
      console.error(`[GAME] Error after scry: ${result.error}`)
    }
  })

  socket.on('game:endTurn', async () => {
    const playerData = socketToPlayer.get(socket.id)
    if (!playerData?.roomId) {
      socket.emit('game:error', 'Not in a game room')
      return
    }

    console.log(`[GAME] Player ${playerId} ending turn`)

    const result = await gameRoomManager.handleEndTurn(playerData.roomId, playerData.playerId)

    if (result.success && result.gameState) {
      io.to(playerData.roomId).emit('game:stateUpdate', result.gameState)
      socket.to(playerData.roomId).emit('opponent:endTurn')
      
      console.log(`[GAME] Turn ended, now player ${result.gameState.turn.currentPlayerIndex}'s turn`)
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
      console.error(`[GAME] Error ending turn: ${result.error}`)
    }
  })

  socket.on('game:attack', async (data) => {
    const playerData = socketToPlayer.get(socket.id)
    if (!playerData?.roomId) {
      socket.emit('game:error', 'Not in a game room')
      return
    }

    console.log(`[GAME] Player ${playerId} attacking with creature ${data.attackerIndex}`)

    const result = await gameRoomManager.handleAttack(
      playerData.roomId,
      playerData.playerId,
      data.attackerIndex,
      data.targetType,
      data.targetIndex
    )

    if (result.success && result.gameState) {
      io.to(playerData.roomId).emit('game:stateUpdate', result.gameState)
      console.log(`[GAME] Attack successful`)
      
      // Verificar si el juego terminó
      const room = gameRoomManager.getRoom(playerData.roomId)
      if (room?.status === 'finished') {
        const winnerIndex = result.gameState.players[0].life > 0 ? 0 : 1
        io.to(playerData.roomId).emit('game:end', { 
          winner: winnerIndex, 
          reason: 'Player defeated' 
        })
        console.log(`[GAME] Game ended, winner: Player ${winnerIndex}`)
      }
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
      console.error(`[GAME] Error attacking: ${result.error}`)
    }
  })

  // ==========================================
  // DISCONNECTION
  // ==========================================
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`)

    const playerData = socketToPlayer.get(socket.id)
    if (playerData) {
      matchmakingQueue.removePlayer(playerData.playerId)

      if (playerData.roomId) {
        console.log(`[GAME] Player disconnected from room ${playerData.roomId}`)
        
        // Notificar al otro jugador
        socket.to(playerData.roomId).emit('matchmaking:playerLeft')
        
        // Limpiar sala
        gameRoomManager.removePlayerFromRoom(playerData.roomId, playerData.playerId)
      }

      socketToPlayer.delete(socket.id)
    }
  })
})

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     🎮 INFRADECK SERVER                    ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`🔌 WebSocket server ready`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log('')
})
