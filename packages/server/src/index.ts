import 'dotenv/config'
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
import { upsertUserFromGoogle, verifyGoogleCredential } from './google-auth.js'
import { getFullCollectionOwned, getFullCollectionRows } from './collection-utils.js'
import { finishGameIfNeeded } from './game-end.js'
import { resolveMatchDeckForUser } from './match-deck.js'
import { recordMatchResults } from './match-history.js'
import type { MatchmakingJoinPayload } from './types.js'

const app = express()
const httpServer = createServer(app)
const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const corsOrigin = corsOrigins.length > 0 ? corsOrigins : true

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
})

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

function getFrontendUrl(): string {
  const explicit = process.env.FRONTEND_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const first = (process.env.CORS_ORIGIN ?? '').split(',')[0]?.trim()
  if (first) return first.replace(/\/$/, '')
  return 'http://localhost:5173'
}

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
  createdAt: string
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
  createdAt: Date
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
  createdAt: user.createdAt.toISOString(),
})

const validateUsername = (raw: string): string | null => {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length < 3 || trimmed.length > 24) return null
  return trimmed
}

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

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'use_google_signin' })
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

app.post('/auth/google/callback', express.urlencoded({ extended: true }), (req, res) => {
  const credential = typeof req.body?.credential === 'string' ? req.body.credential.trim() : ''
  if (!credential) {
    res.status(400).type('html').send('<p>Falta la credencial de Google.</p>')
    return
  }

  const frontend = getFrontendUrl()
  const target = `${frontend}/?auth=google#infradeck_google=${encodeURIComponent(credential)}`
  const safeTarget = JSON.stringify(target)

  res.type('html').send(`<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Iniciando sesión…</title></head>
<body>
<p>Redirigiendo a Infradeck…</p>
<script>
window.location.replace(${safeTarget});
</script>
</body>
</html>`)
})

app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body as { credential?: string }
    if (!credential?.trim()) {
      return res.status(400).json({ error: 'credential_required' })
    }

    let googlePayload
    try {
      googlePayload = await verifyGoogleCredential(credential.trim())
    } catch (err) {
      const code = err instanceof Error ? err.message : 'invalid_google_token'
      if (code === 'google_not_configured') {
        return res.status(503).json({ error: code })
      }
      if (code === 'google_email_required') {
        return res.status(400).json({ error: code })
      }
      return res.status(401).json({ error: 'invalid_google_token' })
    }

    let user
    try {
      user = await upsertUserFromGoogle(prisma, googlePayload)
    } catch (err) {
      if (err instanceof Error && err.message === 'google_account_conflict') {
        return res.status(409).json({ error: 'google_account_conflict' })
      }
      throw err
    }

    const accessToken = signAccessToken(user.id)
    return res.json({
      accessToken,
      user: buildPublicUser(user),
    })
  } catch (error) {
    console.error('[AUTH] google error', error)
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

app.patch('/me/username', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ error: 'missing_token' })
    }

    const { username } = req.body as { username?: string }
    if (!username) {
      return res.status(400).json({ error: 'username_required' })
    }

    const trimmedUsername = validateUsername(username)
    if (!trimmedUsername) {
      return res.status(400).json({ error: 'invalid_username_length' })
    }

    const taken = await prisma.user.findFirst({
      where: { username: trimmedUsername, NOT: { id: userId } },
    })
    if (taken) {
      return res.status(409).json({ error: 'username_taken' })
    }

    const user = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { username: trimmedUsername },
      })
      await tx.userProfile.upsert({
        where: { userId },
        create: { userId, nickname: trimmedUsername },
        update: { nickname: trimmedUsername },
      })
      return tx.user.findUnique({
        where: { id: userId },
        include: { profile: true, currency: true },
      })
    })

    if (!user) {
      return res.status(404).json({ error: 'user_not_found' })
    }

    return res.json({ user: buildPublicUser(user) })
  } catch (error) {
    console.error('[ME] username update error', error)
    return res.status(500).json({ error: 'internal_error' })
  }
})

app.get('/me/matches', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.authUserId
    if (!userId) {
      return res.status(401).json({ error: 'missing_token' })
    }

    const matches = await prisma.matchRecord.findMany({
      where: { userId },
      orderBy: { finishedAt: 'desc' },
      take: 50,
    })

    let wins = 0
    let losses = 0
    for (const m of matches) {
      if (m.result === 'win') wins++
      else losses++
    }

    return res.json({
      summary: { wins, losses },
      matches: matches.map((m) => ({
        id: m.id,
        result: m.result,
        opponentName: m.opponentName,
        finishedAt: m.finishedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('[ME] matches error', error)
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

    const collection = await getFullCollectionRows()
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

    const allowedClasses = ['ABOMINACION', 'CAOS', 'VITALIDAD'] as const
    if (!allowedClasses.includes(classType as (typeof allowedClasses)[number])) {
      return res.status(400).json({ error: 'invalid_class_type' })
    }

    const collectionOwned = await getFullCollectionOwned()

    const {
      validateDeckPayload: validateDeck,
      BASIC_CARDS_BY_ID,
      CLASS_CARDS_BY_ID,
    } = await import('@infradeck/shared')

    const getCard = (cid: string) => BASIC_CARDS_BY_ID[cid] ?? CLASS_CARDS_BY_ID[cid]

    const validation = validateDeck({
      classType: classType as import('@infradeck/shared').ClassType,
      lines: cards.map((c) => ({ cardId: c.cardId, count: c.count ?? 1 })),
      getCard,
      collectionOwned,
    })
    if (!validation.isValid) {
      return res.status(400).json({ error: 'invalid_deck', details: validation.errors })
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

type PlayCardResult = Awaited<ReturnType<typeof gameRoomManager.handlePlayCard>>

async function emitPlayCardResult(
  socket: import('socket.io').Socket,
  roomId: string,
  handIndex: number,
  result: PlayCardResult,
) {
  if (result.success && result.gameState) {
    await broadcastStateAndMaybeEnd(roomId, result.gameState)
    socket.to(roomId).emit('opponent:playCard', { cardId: 'card_played' })
  } else if (result.needsDiscover) {
    socket.emit('game:needsDiscover', {
      handIndex,
      options: result.discoverOptions || [],
    })
  } else if (result.needsScry) {
    socket.emit('game:needsScry', {
      handIndex,
      cards: result.scryCards || [],
    })
  } else if (result.needsTarget) {
    socket.emit('game:needsTarget', {
      handIndex,
      targetType: result.targetType ?? 'CREATURE_ANY',
    })
  } else {
    socket.emit('game:error', result.error || 'Unknown error')
  }
}

async function broadcastStateAndMaybeEnd(roomId: string, gameState: unknown) {
  io.to(roomId).emit('game:stateUpdate', gameState)
  const room = gameRoomManager.getRoom(roomId)
  if (!room) return
  const end = await finishGameIfNeeded(room)
  if (end?.newlyFinished) {
    try {
      await recordMatchResults(room, end.winner)
    } catch (err) {
      console.error('[GAME] match history error', err)
    }
    io.to(roomId).emit('game:end', { winner: end.winner, reason: 'Player defeated' })
    console.log(`[GAME] Game ended, winner: Player ${end.winner}`)
  }
}
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
  socket.on('matchmaking:join', async (payload) => {
    const joinData: MatchmakingJoinPayload | null =
      typeof payload === 'string'
        ? null
        : payload?.playerName && payload?.deckId && payload?.token
          ? payload
          : null

    const playerName = joinData?.playerName ?? (typeof payload === 'string' ? payload : '')
    if (!playerName.trim()) {
      socket.emit('game:error', 'Nombre de jugador requerido')
      return
    }

    let matchDeck: Player['matchDeck']
    let authUserId: string | undefined
    if (joinData) {
      let userId: string | null = null
      try {
        const decoded = jwt.verify(joinData.token, JWT_SECRET) as { sub?: string }
        userId = decoded.sub ?? null
      } catch {
        socket.emit('game:error', 'Sesión inválida')
        return
      }
      if (!userId) {
        socket.emit('game:error', 'Sesión inválida')
        return
      }
      const resolved = await resolveMatchDeckForUser(userId, joinData.deckId)
      if (!resolved) {
        socket.emit('game:error', 'Mazo no válido o no encontrado')
        return
      }
      matchDeck = resolved
      authUserId = userId
    }

    console.log(`[MM] Player ${playerName} (${playerId}) joining matchmaking`, {
      deck: matchDeck ? `${matchDeck.classType} (${matchDeck.deck.length} cards)` : 'fallback',
    })

    const player: Player = {
      id: playerId,
      socketId: socket.id,
      name: playerName.trim(),
      ready: false,
      userId: authUserId,
      matchDeck,
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
      console.log(`[GAME] Card played successfully`)
    } else if (result.needsDiscover) {
      console.log(`[GAME] Card needs discover: ${result.discoverOptions?.length} options`)
    } else if (result.needsScry) {
      console.log(`[GAME] Card needs scry: ${result.scryCards?.length} cards`)
    } else if (result.needsTarget) {
      console.log(`[GAME] Card needs target selection: ${result.targetType}`)
    } else {
      console.error(`[GAME] Error playing card: ${result.error}`)
    }

    await emitPlayCardResult(socket, playerData.roomId, data.handIndex, result)
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
      undefined,
      data.choice,
    )

    if (!result.success && !result.needsDiscover && !result.needsScry && !result.needsTarget) {
      console.error(`[GAME] Error after discover: ${result.error}`)
    }

    await emitPlayCardResult(socket, playerData.roomId, data.handIndex, result)
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
      undefined,
      undefined,
      data.decision,
    )

    if (!result.success && !result.needsDiscover && !result.needsScry && !result.needsTarget) {
      console.error(`[GAME] Error after scry: ${result.error}`)
    }

    await emitPlayCardResult(socket, playerData.roomId, data.handIndex, result)
  })

  socket.on('game:surrender', async () => {
    const playerData = socketToPlayer.get(socket.id)
    if (!playerData?.roomId) {
      socket.emit('game:error', 'Not in a game room')
      return
    }

    console.log(`[GAME] Player ${playerId} surrendered`)

    const result = await gameRoomManager.handleSurrender(playerData.roomId, playerData.playerId)

    if (result.success && result.gameState) {
      await broadcastStateAndMaybeEnd(playerData.roomId, result.gameState)
      console.log('[GAME] Surrender processed')
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
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
      await broadcastStateAndMaybeEnd(playerData.roomId, result.gameState)
      socket.to(playerData.roomId).emit('opponent:endTurn')
      console.log(`[GAME] Turn ended, now player ${result.gameState.turn.currentPlayerIndex}'s turn`)
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
      console.error(`[GAME] Error ending turn: ${result.error}`)
    }
  })

  socket.on('game:summonSpecimen', async (data) => {
    const playerData = socketToPlayer.get(socket.id)
    if (!playerData?.roomId) {
      socket.emit('game:error', 'Not in a game room')
      return
    }

    console.log(`[GAME] Player ${playerId} summoning specimen`)

    const result = await gameRoomManager.handleSummonSpecimen(
      playerData.roomId,
      playerData.playerId,
      data?.targets,
    )

    if (result.success && result.gameState) {
      await broadcastStateAndMaybeEnd(playerData.roomId, result.gameState)
      socket.to(playerData.roomId).emit('opponent:playCard', { cardId: 'specimen_summoned' })
    } else if (result.needsTarget) {
      socket.emit('game:needsTarget', {
        handIndex: -1,
        targetType: result.targetType ?? 'CREATURE_ENEMY',
      })
    } else {
      socket.emit('game:error', result.error || 'Unknown error')
      console.error(`[GAME] Error summoning specimen: ${result.error}`)
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
      await broadcastStateAndMaybeEnd(playerData.roomId, result.gameState)
      console.log(`[GAME] Attack successful`)
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

const PORT = Number(process.env.PORT || 3001)
const HOST = process.env.HOST || '0.0.0.0'

httpServer.listen(PORT, HOST, () => {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     🎮 INFRADECK SERVER                    ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  console.log(`🔌 WebSocket server ready`)
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`)
  console.log('')
})
