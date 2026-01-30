// Helper para resolver cartas
// Importamos dinámicamente para evitar problemas con tsx y ESM

let basicCards: any = null
let classCards: any = null

async function loadCards() {
  if (!basicCards || !classCards) {
    const basicModule = await import('../../shared/src/cards/basic-cards.js')
    const classModule = await import('../../shared/src/cards/class-cards.js')
    basicCards = basicModule.BASIC_CARDS_BY_ID || {}
    classCards = classModule.CLASS_CARDS_BY_ID || {}
  }
}

// Cargar las cartas al inicio
loadCards().catch(console.error)

export function getCardById(id: string): any {
  // Fallback si las cartas no están cargadas aún
  if (!basicCards || !classCards) {
    console.warn('[CARD_RESOLVER] Cards not loaded yet, returning null for:', id)
    return null
  }
  return basicCards[id] || classCards[id] || null
}
