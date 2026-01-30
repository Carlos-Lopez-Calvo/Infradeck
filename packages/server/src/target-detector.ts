// Detecta si una carta necesita selección de targets

export interface TargetRequirement {
  needsTarget: boolean
  targetType?: 'CREATURE_ENEMY' | 'CREATURE_FRIENDLY' | 'CREATURE_ANY' | 'HERO_ENEMY' | 'CHARACTER_ANY'
}

export function detectTargetRequirement(card: any, gameState: any, playerIndex: number): TargetRequirement {
  if (!card || !card.effects) {
    return { needsTarget: false }
  }

  // Buscar efectos ON_PLAY que necesiten targets
  for (const effect of card.effects) {
    // EffectTiming.ON_PLAY es el string 'ON_PLAY'
    if (effect.timing !== 'ON_PLAY') continue

    // Verificar si la condición permite el efecto
    const condition = effect.condition
    if (condition) {
      // Si tiene condición de recurso de clase, verificarla
      if (condition.type === 'CLASS_RESOURCE' && typeof condition.value === 'string') {
        const playerState = gameState.players[playerIndex].classResource?.state
        if (playerState !== condition.value) continue
      }
    }

    const target = effect.action?.target

    // Targets que requieren selección del jugador
    // EffectTarget.TARGET_CREATURE es el string 'TARGET_CREATURE'
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

  return { needsTarget: false }
}
