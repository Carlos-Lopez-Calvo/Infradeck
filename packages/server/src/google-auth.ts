import { OAuth2Client } from 'google-auth-library'
import type { Prisma, PrismaClient } from '@prisma/client'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() ?? ''

let oauthClient: OAuth2Client | null = null

const getOAuthClient = () => {
  if (!GOOGLE_CLIENT_ID) return null
  if (!oauthClient) {
    oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  }
  return oauthClient
}

export type GoogleTokenPayload = {
  sub: string
  email: string
  name?: string
  picture?: string
}

export const verifyGoogleCredential = async (credential: string): Promise<GoogleTokenPayload> => {
  const client = getOAuthClient()
  if (!client) {
    throw new Error('google_not_configured')
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload?.sub || !payload.email) {
    throw new Error('invalid_google_token')
  }

  if (!payload.email_verified) {
    throw new Error('google_email_required')
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: payload.name,
    picture: payload.picture,
  }
}

const sanitizeUsernameBase = (raw: string): string => {
  const cleaned = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()

  if (cleaned.length >= 3) return cleaned.slice(0, 24)
  return 'jugador'
}

export const deriveUsernameBase = (email: string, name?: string): string => {
  if (name?.trim()) {
    const fromName = sanitizeUsernameBase(name.trim())
    if (fromName.length >= 3) return fromName
  }
  const local = email.split('@')[0] ?? 'jugador'
  return sanitizeUsernameBase(local)
}

export const resolveUniqueUsername = async (
  prisma: PrismaClient,
  email: string,
  name?: string,
): Promise<string> => {
  const base = deriveUsernameBase(email, name)
  let candidate = base.slice(0, 24)
  let suffix = 2

  while (true) {
    const existing = await prisma.user.findUnique({ where: { username: candidate } })
    if (!existing) return candidate
    const suffixStr = `_${suffix}`
    const maxBaseLen = 24 - suffixStr.length
    candidate = `${base.slice(0, maxBaseLen)}${suffixStr}`
    suffix += 1
  }
}

const userInclude = {
  profile: true,
  currency: true,
} satisfies Prisma.UserInclude

export const loadUserWithRelations = (prisma: PrismaClient, userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  })

export const upsertUserFromGoogle = async (
  prisma: PrismaClient,
  google: GoogleTokenPayload,
) => {
  const byGoogle = await prisma.user.findUnique({
    where: { googleId: google.sub },
    include: userInclude,
  })
  if (byGoogle) return byGoogle

  const byEmail = await prisma.user.findFirst({
    where: { email: google.email },
    include: userInclude,
  })

  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== google.sub) {
      throw new Error('google_account_conflict')
    }

    const needsAvatar = !byEmail.profile?.avatarUrl && google.picture
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: google.sub,
        ...(needsAvatar
          ? {
              profile: {
                update: { avatarUrl: google.picture },
              },
            }
          : {}),
      },
      include: userInclude,
    })
  }

  const username = await resolveUniqueUsername(prisma, google.email, google.name)
  const nickname = google.name?.trim() || username

  return prisma.user.create({
    data: {
      username,
      email: google.email,
      googleId: google.sub,
      passwordHash: null,
      profile: {
        create: {
          nickname,
          avatarUrl: google.picture ?? null,
        },
      },
      currency: {
        create: {
          gold: 1000,
          gems: 0,
        },
      },
    },
    include: userInclude,
  })
}
