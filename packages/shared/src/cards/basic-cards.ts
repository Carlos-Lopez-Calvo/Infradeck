import { 
  Card, 
  CardType, 
  CardRarity, 
  ClassType, 
  Ability,
  EffectTiming,
  EffectTarget,
  EffectActionType  
} from '../types/cards'

/**
 * CARTAS BÁSICAS - Implementación Completa
 * 33 cartas siguiendo exactamente cartas-basicas.md
 */

// === 0 MANA (1) ===

export const ULTIMA_OPORTUNIDAD: Card = {
  id: 'Ultima_Oportunidad',
  name: 'Última Oportunidad',
  type: CardType.INSTANT,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 0,
  abilities: [],
  effects: [
    {
      id: 'Ultima_Emergency_Buff',
      description: 'Solo se puede jugar si tienes 5 o menos de vida. Una criatura objetivo gana +2/+2 y Prisa hasta final del turno',
      timing: EffectTiming.INSTANT,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 5,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.TARGET_CREATURE,
        value: '+2/+2',
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: 'Solo se puede jugar si tienes 5 o menos de vida. Una criatura objetivo gana +2/+2 y Prisa hasta final del turno',
  flavorText: 'Una última carta por jugar.'
}

// === 1 MANA (6) ===

export const MERCENARIO_AGIL: Card = {
  id: 'Mercenario_Agil',
  name: 'Mercenario Ágil',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 1,
  attack: 2,
  health: 1,
  abilities: [Ability.SIGILO],
  effects: [
    {
      id: 'Mercenario_Low_Life_Buff',
      description: 'Al ser jugado: Si tienes 15 o menos vida, gana +1/+1',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 15,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.SELF,
        value: '+1/+1',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '2/1 con Sigilo. Al ser jugado: Si tienes 15 o menos vida, gana +1/+1',
  flavorText: 'Lucha mejor cuando las cosas se ponen feas.'
}

export const EXPLORADOR_ASTUTO: Card = {
  id: 'Explorador_Astuto',
  name: 'Explorador Astuto',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 1,
  attack: 1,
  health: 1,
  abilities: [Ability.VUELO],
  effects: [
    {
      id: 'Explorador_Card_Selection',
      description: 'Al ser jugado: Mira las 2 primeras cartas de tu mazo, pon 1 en tu mano y 1 abajo',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/1 con Vuelo. Al ser jugado: Mira las 2 primeras cartas de tu mazo, pon 1 en tu mano y 1 abajo',
  flavorText: 'Ve más allá del horizonte.'
}

export const ASESINO_SILENCIOSO: Card = {
  id: 'Asesino_Silencioso',
  name: 'Asesino Silencioso',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 1,
  attack: 1,
  health: 2,
  abilities: [Ability.VENENO],
  effects: [],
  description: '1/2 con Veneno',
  flavorText: 'Un golpe, una muerte.'
}

export const GUARDIAN_NOVATO: Card = {
  id: 'Guardian_Novato',
  name: 'Guardián Novato',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 1,
  attack: 0,
  health: 3,
  abilities: [Ability.ESCUDO],
  effects: [
    {
      id: 'Guardian_Gain_Taunt',
      description: 'Al final de tu turno: Si no ha recibido daño, gana Taunt',
      timing: EffectTiming.END_OF_TURN,
      condition: { type: 'SELF_NOT_DAMAGED_THIS_TURN' },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: Ability.TAUNT,
        duration: 'UNTIL_DEATH'
      }
    }
  ],
  description: '0/3 con Escudo. Al final de tu turno: Si no ha recibido daño, gana Taunt',
  flavorText: 'La experiencia viene con la supervivencia.'
}

export const REFLEJO_RAPIDO: Card = {
  id: 'Reflejo_Rapido',
  name: 'Reflejo Rápido',
  type: CardType.INSTANT,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 1,
  abilities: [],
  effects: [
    {
      id: 'Reflejo_Counter_Spell',
      description: 'Anula un hechizo',
      timing: EffectTiming.INSTANT,
      action: {
        type: EffectActionType.COUNTER_SPELL,
        target: EffectTarget.TARGET_SPELL,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Anula un hechizo',
  flavorText: 'Instinto de supervivencia.'
}

export const CUCHILLA_ENVENENADA: Card = {
  id: 'Cuchilla_Envenenada',
  name: 'Cuchilla Envenenada',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 1,
  abilities: [],
  effects: [
    {
      id: 'Cuchilla_Grant_Poison',
      description: 'Una criatura objetivo gana Veneno hasta final del turno. Si esa criatura mata a otra criatura este turno, roba 1 carta',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_CREATURE,
        value: Ability.VENENO,
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: 'Una criatura objetivo gana Veneno hasta final del turno. Si esa criatura mata a otra criatura este turno, roba 1 carta',
  flavorText: 'El toque letal.'
}

export const EXPLORADOR_AUDAZ: Card = {
  id: 'Explorador_Audaz',
  name: 'Explorador Audaz',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 1,
  attack: 1,
  health: 1,
  abilities: [],
  effects: [
    {
      id: 'Explorador_Advanced_Selection',
      description: 'Al entrar: Mira las 3 primeras cartas de tu mazo, pon 1 en tu mano, el resto abajo en cualquier orden',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/1. Al entrar: Mira las 3 primeras cartas de tu mazo, pon 1 en tu mano, el resto abajo en cualquier orden',
  flavorText: 'La curiosidad tiene recompensas.'
}

// === 2 MANA (5) ===

export const ESCRIBA_ESTUDIOSO: Card = {
  id: 'Escriba_Estudioso',
  name: 'Escriba Estudioso',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 2,
  attack: 1,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Escriba_Card_Filter',
      description: 'Al ser jugado: Roba 1 carta, luego descarta 1 carta',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/3. Al ser jugado: Roba 1 carta, luego descarta 1 carta',
  flavorText: 'El conocimiento tiene su precio.'
}

export const FLECHA_CERTEZA: Card = {
  id: 'Flecha_Certeza',
  name: 'Flecha Certeza',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Flecha_Damage_And_Draw',
      description: 'Haz 3 de daño. Si el objetivo muere, roba 1 carta',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 3,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 3 de daño. Si el objetivo muere, roba 1 carta',
  flavorText: 'La precisión tiene recompensas.'
}

export const DUELISTA_EXPERTO: Card = {
  id: 'Duelista_Experto',
  name: 'Duelista Experto',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 2,
  attack: 1,
  health: 2,
  abilities: [Ability.IMPACIENTE],
  effects: [
    {
      id: 'Duelista_Solo_Attack_Buff',
      description: 'Si es la única criatura atacante, gana +2/+1 hasta final del turno',
      timing: EffectTiming.ON_ATTACK,
      condition: {
        type: 'BOARD_STATE',
        value: 'SOLO_ATTACKER',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.SELF,
        value: '+2/+1',
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: '1/2 con Impaciente. Si es la única criatura atacante, gana +2/+1 hasta final del turno',
  flavorText: 'El honor exige un combate justo.'
}

export const COMERCIANTE_SAGAZ: Card = {
  id: 'Comerciante_Sagaz',
  name: 'Comerciante Sagaz',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 2,
  attack: 1,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Comerciante_Hand_Size_Taunt',
      description: 'Al inicio de tu turno: Si tienes 6+ cartas en mano, gana Taunt hasta final del turno',
      timing: EffectTiming.START_OF_TURN,
      condition: {
        type: 'HAND_SIZE',
        value: 6,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: Ability.TAUNT,
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: '1/3. Al inicio de tu turno: Si tienes 6+ cartas en mano, gana Taunt hasta final del turno',
  flavorText: 'Los recursos son poder, el poder es protección.'
}

export const DISPARO_CERTERO: Card = {
  id: 'Disparo_Certero',
  name: 'Disparo Certero',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Disparo_Anti_Flying',
      description: 'Haz 2 de daño a un objetivo. Si el objetivo es una criatura con Vuelo, en su lugar haz 4 de daño',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 2, // Será 4 si tiene vuelo
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 2 de daño a un objetivo. Si el objetivo es una criatura con Vuelo, en su lugar haz 4 de daño',
  flavorText: 'Contra las alturas, la precisión lo es todo.'
}

// === 3 MANA (6) ===

export const BERSERKER_HERIDO: Card = {
  id: 'Berserker_Herido',
  name: 'Berserker Herido',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 3,
  attack: 4,
  health: 2,
  abilities: [Ability.PRISA],
  effects: [
    {
      id: 'Berserker_Self_Damage',
      description: 'Al inicio de tu turno: Recibe 1 de daño',
      timing: EffectTiming.START_OF_TURN,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.SELF,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '4/2 con Prisa. Al inicio de tu turno: Recibe 1 de daño',
  flavorText: 'Su furia crece con cada herida.'
}

export const RECARGA_RAPIDA: Card = {
  id: 'Recarga_Rapida',
  name: 'Recarga Rapida',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Recarga_Draw_Cards',
      description: 'Roba 2 cartas',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 2,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Roba 2 cartas',
  flavorText: 'El conocimiento debe fluir libremente.'
}

export const MOMENTO_CRUCIAL: Card = {
  id: 'Momento_Crucial',
  name: 'Momento Crucial',
  type: CardType.INSTANT,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Momento_Combat_Trick',
      description: 'Una criatura atacante o defensora gana +2/+2. Si mata a su objetivo, no recibe daño de combate',
      timing: EffectTiming.INSTANT,
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.TARGET_CREATURE,
        value: '+2/+2',
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: 'Una criatura atacante o defensora gana +2/+2. Si mata a su objetivo, no recibe daño de combate',
  flavorText: 'El timing lo es todo.'
}

export const SOLDADO_VETERANO: Card = {
  id: 'Soldado_Veterano',
  name: 'Soldado Veterano',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 3,
  attack: 2,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Soldado_Board_Presence_Buff',
      description: 'Al entrar: Si controlas otra criatura, gana Escudo y +1/+0',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'BOARD_STATE',
        value: 'HAS_OTHER_CREATURES',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: Ability.ESCUDO,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '2/3. Al entrar: Si controlas otra criatura, gana Escudo y +1/+0',
  flavorText: 'La experiencia enseña el valor de los aliados.'
}

export const INTERCEPCION_RAPIDA: Card = {
  id: 'Intercepcion_Rapida',
  name: 'Intercepción Rápida',
  type: CardType.INSTANT,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Intercepcion_Taunt_And_Draw',
      description: 'Una criatura aliada gana Taunt hasta final del turno. Roba 1 carta si esa criatura recibe daño este turno',
      timing: EffectTiming.INSTANT,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_CREATURE,
        value: Ability.TAUNT,
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: 'Una criatura aliada gana Taunt hasta final del turno. Roba 1 carta si esa criatura recibe daño este turno',
  flavorText: 'Proteger tiene recompensas.'
}

export const CURANDERO_SABIO: Card = {
  id: 'Curandero_Sabio',
  name: 'Curandero Sabio',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 3,
  attack: 1,
  health: 5,
  abilities: [],
  effects: [
    {
      id: 'Curandero_Heal_Hero',
      description: 'Al final de tu turno: Cura 2 de vida a tu héroe',
      timing: EffectTiming.END_OF_TURN,
      action: {
        type: EffectActionType.HEAL,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 2,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/5. Al final de tu turno: Cura 2 de vida a tu héroe',
  flavorText: 'La paciencia sana todas las heridas.'
}

// === 4 MANA (5) ===

export const CENTINELA_VIGILANTE: Card = {
  id: 'Centinela_Vigilante',
  name: 'Centinela Vigilante',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 4,
  attack: 2,
  health: 5,
  abilities: [Ability.TAUNT],
  effects: [
    {
      id: 'Centinela_Passive_Draw',
      description: 'Al final de tu turno: Si no atacaste, roba 1 carta',
      timing: EffectTiming.END_OF_TURN,
      condition: {
        type: 'BOARD_STATE',
        value: 'DID_NOT_ATTACK',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '2/5 con Taunt. Al final de tu turno: Si no atacaste, roba 1 carta',
  flavorText: 'La paciencia es una virtud... rentable.'
}

export const LLAMA_IMPURA: Card = {
  id: 'Llama_Impura',
  name: 'Llama Impura',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 4,
  abilities: [],
  effects: [
    {
      id: 'Llama_Board_Clear_Face_Damage',
      description: 'Haz 2 de daño a todas las criaturas. Por cada criatura que muera así, haz 1 de daño al oponente',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.ALL_CREATURES,
        amount: 2,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 2 de daño a todas las criaturas. Por cada criatura que muera así, haz 1 de daño al oponente',
  flavorText: 'Dolor compartido, dolor duplicado.'
}

export const MAESTRO_DE_ARMAS: Card = {
  id: 'Maestro_de_Armas',
  name: 'Maestro de Armas',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 4,
  attack: 3,
  health: 4,
  abilities: [],
  effects: [
    {
      id: 'Maestro_Flexible_Buff',
      description: 'Al entrar: Elige una criatura aliada (puede ser él mismo). Hasta final del turno, gana Prisa y +1/+0',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_CREATURE,
        value: Ability.PRISA,
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: '3/4. Al entrar: Elige una criatura aliada (puede ser él mismo). Hasta final del turno, gana Prisa y +1/+0',
  flavorText: 'Cada soldado necesita un líder.'
}

export const ACECHADOR_NOCTURNO: Card = {
  id: 'Acechador_Nocturno',
  name: 'Acechador Nocturno',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 4,
  attack: 4,
  health: 3,
  abilities: [Ability.SIGILO],
  effects: [
    {
      id: 'Acechador_Hand_Disruption',
      description: 'Al atacar directamente al oponente: El oponente descarta 1 carta aleatoria de la mano',
      timing: EffectTiming.ON_ATTACK,
      condition: {
        type: 'BOARD_STATE',
        value: 'ATTACKING_HERO',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.ENEMY_HERO,
        amount: -1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '4/3 con Sigilo. Al atacar directamente al oponente: El oponente descarta 1 carta aleatoria de la mano',
  flavorText: 'Lo que no puedes ver puede lastimarte.'
}

export const PALABRA_DE_PODER: Card = {
  id: 'Palabra_de_Poder',
  name: 'Palabra de Poder',
  type: CardType.INSTANT,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 4,
  abilities: [],
  effects: [
    {
      id: 'Palabra_Conditional_Removal',
      description: 'Destruye una criatura con 3 o menos de vida. Si destruyes una criatura sin daño, tu próxima carta cuesta 2 menos',
      timing: EffectTiming.INSTANT,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 3,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 999,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Destruye una criatura con 3 o menos de vida. Si destruyes una criatura sin daño, tu próxima carta cuesta 2 menos',
  flavorText: 'La perfección de la destrucción alimenta la creación.'
}

// === 5 MANA (5) ===

export const VAMPIRO_ANCESTRAL: Card = {
  id: 'Vampiro_Ancestral',
  name: 'Vampiro Ancestral',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 5,
  attack: 4,
  health: 4,
  abilities: [Ability.ROBO_DE_VIDA],
  effects: [
    {
      id: 'Vampiro_Low_Life_Buff',
      description: 'Si tienes 10 de vida o menos, obtiene +2/+2',
      timing: EffectTiming.PASSIVE,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 10,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.SELF,
        value: '+2/+2',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '4/4 con Robo de vida. Si tienes 10 de vida o menos, obtiene +2/+2',
  flavorText: 'La sed crece con la desesperación.'
}

export const COLOSO_DE_HIERRO: Card = {
  id: 'Coloso_de_Hierro',
  name: 'Coloso de Hierro',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 5,
  attack: 6,
  health: 4,
  abilities: [],
  effects: [
    {
      id: 'Coloso_Awakening',
      description: 'No puede atacar el turno que entra. Al inicio de tu turno: Si hay 3+ criaturas en el tablero, gana Prisa',
      timing: EffectTiming.START_OF_TURN,
      condition: {
        type: 'BOARD_STATE',
        value: 'CREATURE_COUNT_3_PLUS',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: Ability.PRISA,
        duration: 'UNTIL_DEATH'
      }
    }
  ],
  description: '6/4. No puede atacar el turno que entra. Al inicio de tu turno: Si hay 3+ criaturas en el tablero, gana Prisa',
  flavorText: 'Despierta lentamente, pero cuando lo hace...'
}

export const INGENIERA_ASTUTA: Card = {
  id: 'Ingeniera_Astuta',
  name: 'Ingeniera Astuta',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 5,
  attack: 3,
  health: 5,
  abilities: [],
  effects: [
    {
      id: 'Ingeniera_Shield_Small_Creatures',
      description: 'Al entrar: Todas tus criaturas con costo 2 o menos ganan Escudo',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.ALL_FRIENDLY_CREATURES,
        value: Ability.ESCUDO,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '3/5. Al entrar: Todas tus criaturas con costo 2 o menos ganan Escudo',
  flavorText: 'Mejora lo que ya tienes.'
}

export const TORMENTA_DE_ACERO: Card = {
  id: 'Tormenta_de_Acero',
  name: 'Tormenta de Acero',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 5,
  abilities: [],
  effects: [
    {
      id: 'Tormenta_Asymmetric_Clear',
      description: 'Haz 3 de daño a todas las criaturas enemigas. Roba 1 carta por cada criatura aliada eliminada',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.ALL_ENEMY_CREATURES,
        amount: 3,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 3 de daño a todas las criaturas enemigas. Roba 1 carta por cada criatura aliada eliminada',
  flavorText: 'Hasta la derrota tiene lecciones.'
}

export const GOLPE_DEVASTADOR: Card = {
  id: 'Golpe_Devastador',
  name: 'Golpe Devastador',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.NEUTRAL,
  mana: 5,
  abilities: [],
  effects: [
    {
      id: 'Golpe_Big_Removal_Face',
      description: 'Haz 7 de daño a una criatura. Si la destruyes, haz 3 de daño al oponente',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 7,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 7 de daño a una criatura. Si la destruyes, haz 3 de daño al oponente',
  flavorText: 'La fuerza bruta tiene sus momentos.'
}

// === 6 MANA (3) ===

export const CAMPEON_CAIDO: Card = {
  id: 'Campeon_Caido',
  name: 'Campeón Caído',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 6,
  attack: 5,
  health: 5,
  abilities: [Ability.REGENERACION],
  effects: [
    {
      id: 'Campeon_Death_Scaling',
      description: 'Por cada criatura aliada que haya muerto este turno, gana +1/+1',
      timing: EffectTiming.PASSIVE,
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.SELF,
        value: '+1/+1',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '5/5 con Regeneración. Por cada criatura aliada que haya muerto este turno, gana +1/+1',
  flavorText: 'Los caídos dan fuerza a los que quedan.'
}

export const SENOR_DE_LA_GUERRA: Card = {
  id: 'Senor_de_la_Guerra',
  name: 'Señor de la Guerra',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 6,
  attack: 5,
  health: 7,
  abilities: [Ability.TAUNT],
  effects: [
    {
      id: 'Senor_Army_Pump',
      description: 'Al entrar: Todas las criaturas aliadas ganan +1/+0',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.BUFF_ATTACK,
        target: EffectTarget.ALL_FRIENDLY_CREATURES,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '5/7 con Taunt. Al entrar: Todas las criaturas aliadas ganan +1/+0',
  flavorText: 'Su presencia inspira valentía.'
}

export const RITUAL_DE_RENOVACION: Card = {
  id: 'Ritual_de_Renovacion',
  name: 'Ritual de Renovación',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 6,
  abilities: [],
  effects: [
    {
      id: 'Ritual_Board_Reset',
      description: 'Destruye todas las criaturas. El oponente roba 1 carta',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.ALL_CREATURES,
        amount: 999,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Destruye todas las criaturas. El oponente roba 1 carta',
  flavorText: 'La destrucción siempre enseña algo.'
}

// === 7+ MANA (2) ===

export const TITAN_PRIMORDIAL: Card = {
  id: 'Titan_Primordial',
  name: 'Titán Primordial',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 7,
  attack: 6,
  health: 8,
  abilities: [Ability.REGENERACION],
  effects: [
    {
      id: 'Titan_Removal_On_Enter',
      description: 'Al entrar: Destruye 1 criatura del oponente',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 999,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '6/8 con Regeneración. Al entrar: Destruye 1 criatura del oponente',
  flavorText: 'Su despertar reshapa el mundo.'
}

export const APOCALIPSIS: Card = {
  id: 'Apocalipsis',
  name: 'Apocalipsis',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.NEUTRAL,
  mana: 8,
  abilities: [],
  effects: [
    {
      id: 'Apocalipsis_Massive_Clear_Finisher',
      description: 'Haz 6 de daño a todas las criaturas. Si matas 5 o más criaturas de esta forma, haz daño igual a las criaturas eliminadas al rival',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.ALL_CREATURES,
        amount: 6,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 6 de daño a todas las criaturas. Si matas 5 o más criaturas de esta forma, haz daño igual a las criaturas eliminadas al rival',
  flavorText: 'La destrucción masiva tiene consecuencias.'
}