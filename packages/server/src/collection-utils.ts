export type CollectionRow = { cardId: string; owned: number }

/** Copias por carta mientras todo el mundo tiene colección completa (dev). */
function ownedForRarity(rarity: string): number {
  if (rarity === 'LEGENDARY') return 2
  return 4
}

/** Catálogo completo con owned suficiente para construir mazos y ver colección. */
export async function getFullCollectionOwned(): Promise<Record<string, number>> {
  const { COLLECTION_CATALOG_CARDS } = await import('@infradeck/shared')
  const owned: Record<string, number> = {}
  for (const card of COLLECTION_CATALOG_CARDS) {
    owned[card.id] = ownedForRarity(card.rarity)
  }
  return owned
}

export async function getFullCollectionRows(): Promise<CollectionRow[]> {
  const owned = await getFullCollectionOwned()
  return Object.entries(owned)
    .map(([cardId, count]) => ({ cardId, owned: count }))
    .sort((a, b) => a.cardId.localeCompare(b.cardId))
}
