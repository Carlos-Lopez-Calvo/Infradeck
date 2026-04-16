export const extractBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) return null
  const [scheme, token] = authorizationHeader.split(' ')
  if (!scheme || !token) return null
  if (scheme.toLowerCase() !== 'bearer') return null
  return token
}

export const normalizeRewardPayload = (input: { gold?: number; gems?: number }) => {
  const { gold = 0, gems = 0 } = input
  if (!Number.isFinite(gold) || !Number.isFinite(gems)) {
    return { ok: false as const, error: 'invalid_reward_payload' as const }
  }
  if (gold < 0 || gems < 0) {
    return { ok: false as const, error: 'rewards_must_be_positive' as const }
  }
  return {
    ok: true as const,
    value: {
      gold: Math.floor(gold),
      gems: Math.floor(gems),
    },
  }
}

export const canApplyCurrencyDelta = (
  current: { gold: number; gems: number },
  delta: { gold: number; gems: number },
) => current.gold + delta.gold >= 0 && current.gems + delta.gems >= 0
