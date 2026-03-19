// Detecta si una carta necesita interacción del jugador (targets, discover, scry, etc)

export interface TargetRequirement {
  needsTarget?: boolean
  targetType?: 'CREATURE_ENEMY' | 'CREATURE_FRIENDLY' | 'CREATURE_ANY' | 'HERO_ENEMY' | 'CHARACTER_ANY'
  needsDiscover?: boolean
  discoverOptions?: Array<{ id: string; label: string; preview?: any }>
  needsScry?: boolean
  scryCards?: string[]
  needsAdvancedSelection?: boolean
  advancedSelectionCards?: string[]
}

export function detectTargetRequirement(card: any, gameState: any, playerIndex: number): TargetRequirement {
  if (!card || !card.effects) {
    return {}
  }

  // Buscar efectos ON_PLAY que necesiten interacción
  for (const effect of card.effects) {
    // EffectTiming.ON_PLAY es el string 'ON_PLAY'
    if (effect.timing !== 'ON_PLAY') continue

    // Verificar si la condición permite el efecto
    const condition = effect.condition
    if (condition) {
      // Si tiene condición de recurso de clase, verificarla
      if (condition.type === 'CLASS_RESOURCE' && typeof condition.value === 'string') {
        // Ya no existe recurso por estado (día/noche). Saltar este efecto.
        continue
      }
    }

    const actionType = effect.action?.type
    const target = effect.action?.target

    // Detectar DISCOVER (pagar vida o entropía)
    if (actionType === 'DISCOVER_PAY_LIFE' || actionType === 'DISCOVER_PAY_ENTROPY') {
      const options = effect.action.options
      if (options && options.base && options.buff) {
        return {
          needsDiscover: true,
          discoverOptions: [
            { id: 'BASE', label: options.baseLabel || 'Opción Base' },
            { id: 'BUFF', label: options.buffLabel || 'Opción Mejorada' }
          ]
        }
      }
    }

    // Detectar SCRY (ver carta superior del mazo)
    if (actionType === 'SCRY') {
      const player = gameState.players[playerIndex]
      const amount = effect.action.amount || 1
      const topCards = player.deck.slice(0, Math.min(amount, player.deck.length))
      
      if (topCards.length > 0) {
        return {
          needsScry: true,
          scryCards: topCards
        }
      }
    }

    // Detectar targets normales
    switch (target) {
      case 'TARGET_CREATURE':
        return { needsTarget: true, targetType: 'CREATURE_ANY' }
      
      case 'TARGET_FRIENDLY_CREATURE':
        return { needsTarget: true, targetType: 'CREATURE_FRIENDLY' }
      
      // Otros targets que no necesitan selección explícita
      case 'ENEMY_HERO':
      case 'FRIENDLY_HERO':
      case 'ALL_CREATURES':
      case 'ALL_FRIENDLY_CREATURES':
      case 'ALL_ENEMY_CREATURES':
      case 'RANDOM_ENEMY':
      case 'RANDOM_CREATURE':
      case 'SELF':
        continue
      
      default:
        continue
    }
  }

  return {}
}
