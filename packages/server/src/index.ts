import express, { type NextFunction, type Request, type Response } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { nanoid } from 'nanoid'
import { GameRoomManager } from './gameRoom.js'
import { MatchmakingQueue } from './matchmaking.js'
import type { ClientToServerEvents, ServerToClientEvents, Player } from './types.js'
import { prisma } from './db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { extractBearerToken, normalizeRewardPayload } from './auth-economy-utils.js'

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

// =====================================================
// REST API - Autenticación y Mazos
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET || 'infradeck_dev_secret_change_me'
const JWT_EXPIRES_IN = '7d'

type AuthenticatedRequest = Request & {
  authUserId?: string
}

type PublicUserPayload = {
  id: string
  username: string
  email: string
  nickname: string
  avatarUrl: string | null
  level: number
  xp: number
  gold: number
  gems: number
}

const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = extractBearerToken(req.headers.authorization)
  if (!token) {
    return res.status(401).json({ error: 'missing_token' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub?: string }
    if (!payload.sub) {
      return res.status(401).json({ error: 'invalid_token' })
    }
    req.authUserId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'invalid_token' })
  }
}

const buildPublicUser = (user: {
  id: string
  username: string
  email: string
  profile: { nickname: string; avatarUrl: string | null; level: number; xp: number } | null
  currency: { gold: number; gems: number } | null
}): PublicUserPayload => ({
  id: user.id,
  username: user.username,
  email: user.email,
  nickname: user.profile?.nickname ?? user.username,
  avatarUrl: user.profile?.avatarUrl ?? null,
  level: user.profile?.level ?? 1,
  xp: user.profile?.xp ?? 0,
  gold: user.currency?.gold ?? 0,
  gems: user.currency?.gems ?? 0,
})

// Registro con nickname, email y contraseña
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body as {
      username?: string
      email?: string
      password?: string
    }

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' })
    }

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedUsername || !trimmedEmail) {
      return res.status(400).json({ error: 'username and email cannot be empty' })
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
      return res.status(400).json({ error: 'invalid_username_length' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'password_too_short' })
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: trimmedEmail }, { username: trimmedUsername }],
      },
    })

    if (existing) {
      return res.status(409).json({ error: 'user_already_exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          username: trimmedUsername,
          email: trimmedEmail,
          passwordHash,
          profile: {
            create: {
              nickname: trimmedUsername,
            },
          },
          currency: {
            create: {
              gold: 1000,
              gems: 0,
            },
          },
        },
        include: {
          profile: true,
          currency: true,
        },
      })
      return created
    })

    const accessToken = signAccessToken(user.id)
    return res.status(201).json({
      accessToken,
      user: buildPublicUser(user),
    })
  } catch (error) {
    console.error('[AUTH] register error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Login solo con email + contraseña
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const trimmed = email.trim().toLowerCase()
    const user = await prisma.user.findFirst({
      where: {
        email: trimmed,
      },
      include: {
        profile: true,
        currency: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' })
    }

    const accessToken = signAccessToken(user.id)
    return res.json({
      accessToken,
      user: buildPublicUser(user),
    })
  } catch (error) {
    console.error('[AUTH] login error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Datos de perfil del usuario autenticado
app.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ error: 'missing_token' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        currency: true,
        decks: {
          include: { cards: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'user_not_found' })
    }

    return res.json({
      user: buildPublicUser(user),
      stats: {
        deckCount: user.decks.length,
        cardsOwned: 0,
      },
    })
  } catch (error) {
    console.error('[ME] profile error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Colección del usuario autenticado
app.get('/me/collection', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ error: 'missing_token' })
    }

    const collection = await prisma.userCard.findMany({
      where: { userId },
      orderBy: [{ owned: 'desc' }, { cardId: 'asc' }],
    })

    return res.json(collection)
  } catch (error) {
    console.error('[ME] collection error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Listar mazos del usuario autenticado
app.get('/me/decks', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ error: 'missing_token' })
    }

    const decks = await prisma.deck.findMany({
      where: { ownerId: userId },
      include: { cards: true },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(decks)
  } catch (error) {
    console.error('[DECKS] list error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Crear / actualizar mazo
app.post('/me/decks', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ error: 'missing_token' })
    }

    const { id, name, classType, cards } = req.body as {
      id?: string
      name?: string
      classType?: string
      cards?: Array<{ cardId: string; count: number }>
    }

    if (!name || !classType || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'name, classType and cards are required' })
    }

    if (!cards.length) {
      return res.status(400).json({ error: 'deck must have at least one card' })
    }

    if (classType === 'CICLO') {
      return res.status(400).json({ error: 'class_not_supported' })
    }

    if (id) {
      const existingDeck = await prisma.deck.findUnique({ where: { id } })
      if (!existingDeck || existingDeck.ownerId !== userId) {
        return res.status(404).json({ error: 'deck_not_found' })
      }

      // Update existente: borramos cartas y recreamos
      const deck = await prisma.deck.update({
        where: { id },
        data: {
          name,
          classType,
          cards: {
            deleteMany: {},
            create: cards.map(c => ({
              cardId: c.cardId,
              count: c.count ?? 1,
            })),
          },
        },
        include: { cards: true },
      })
      return res.json(deck)
    } else {
      // Crear nuevo
      const deck = await prisma.deck.create({
        data: {
          name,
          classType,
          ownerId: userId,
          cards: {
            create: cards.map(c => ({
              cardId: c.cardId,
              count: c.count ?? 1,
            })),
          },
        },
        include: { cards: true },
      })
      return res.status(201).json(deck)
    }
  } catch (error) {
    console.error('[DECKS] upsert error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Borrar mazo
app.delete('/me/decks/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.authUserId
    if (!id) return res.status(400).json({ error: 'id is required' })
    if (!userId) return res.status(401).json({ error: 'missing_token' })

    const existingDeck = await prisma.deck.findUnique({ where: { id } })
    if (!existingDeck || existingDeck.ownerId !== userId) {
      return res.status(404).json({ error: 'deck_not_found' })
    }

    await prisma.deck.delete({ where: { id } })
    return res.status(204).send()
  } catch (error) {
    console.error('[DECKS] delete error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Recompensas in-game para economía (sin dinero real)
app.post('/me/rewards', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ error: 'missing_token' })
    }

    const normalized = normalizeRewardPayload(req.body as { gold?: number; gems?: number })
    if (!normalized.ok) {
      return res.status(400).json({ error: normalized.error })
    }

    const currency = await prisma.userCurrency.upsert({
      where: { userId },
      create: {
        userId,
        gold: normalized.value.gold,
        gems: normalized.value.gems,
      },
      update: {
        gold: { increment: normalized.value.gold },
        gems: { increment: normalized.value.gems },
      },
    })

    return res.json(currency)
  } catch (error) {
    console.error('[ME] rewards error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
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
        targetType: result.targetType ?? 'CREATURE_ANY'
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
