import { prisma } from './db.js'
import { getFullCollectionOwned } from './collection-utils.js'

export type ResolvedMatchDeck = {
  classType: string
  deck: string[]
}

function expandDeckCards(cards: { cardId: string; count: number }[]): string[] {
  const out: string[] = []
  for (const { cardId, count } of cards) {
    const n = Math.max(0, Math.floor(count))
    for (let i = 0; i < n; i++) out.push(cardId)
  }
  return out
}

export async function resolveMatchDeckForUser(
  userId: string,
  deckId: string
): Promise<ResolvedMatchDeck | null> {
  const row = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { cards: true },
  })

  if (!row || row.ownerId !== userId) return null

  const lines = row.cards.map((c) => ({ cardId: c.cardId, count: c.count }))
  const collectionOwned = await getFullCollectionOwned()

  const {
    validateDeckPayload: validateDeck,
    BASIC_CARDS_BY_ID,
    CLASS_CARDS_BY_ID,
  } = await import('@infradeck/shared')

  const getCard = (cid: string) => BASIC_CARDS_BY_ID[cid] ?? CLASS_CARDS_BY_ID[cid]
  const validation = validateDeck({
    classType: row.classType as import('@infradeck/shared').ClassType,
    lines,
    getCard,
    collectionOwned,
  })

  if (!validation.isValid) return null

  const deck = expandDeckCards(lines)
  if (deck.length === 0) return null

  return { classType: row.classType, deck }
}
