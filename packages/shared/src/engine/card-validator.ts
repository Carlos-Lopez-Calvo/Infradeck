import { Card, GAME_CONSTANTS, CardEffect, CardType } from '../types/cards'

export function validateCard(card: Card): boolean {
  // Validaciones básicas
  if (!card.id || !card.name) return false
  if (card.mana < 0 || card.mana > GAME_CONSTANTS.MAX_MANA) return false
  
  // Validar tipo de carta
  if (card.type === CardType.CREATURE) {
    if (typeof card.attack !== 'number' || typeof card.health !== 'number') return false
    if (card.attack < 0 || card.health < 1) return false
  }
  
  // Validar efectos
  for (const effect of card.effects) {
    if (!isValidEffect(effect)) return false
  }
  
  // Validar arrays básicos
  if (!Array.isArray(card.abilities)) return false
  if (!Array.isArray(card.effects)) return false
  
  return true
}

function isValidEffect(effect: CardEffect): boolean {
  // Validar que el efecto tiene las propiedades requeridas
  if (!effect.id || !effect.description || !effect.timing || !effect.action) {
    return false
  }
  
  // TODO: Validar más específicamente timing, condition, action
  return true
}
