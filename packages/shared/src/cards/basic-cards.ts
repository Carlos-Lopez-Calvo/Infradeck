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
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 0,
  abilities: [],
  effects: [
    {
      id: 'Ultima_Emergency_Buff_Stats',
      description: 'Una criatura aliada objetivo gana +2/+2 hasta final del turno',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 5,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: '+2/+2',
        duration: 'END_OF_TURN'
      }
    },
    {
      id: 'Ultima_Emergency_Buff_Prisa',
      description: 'Una criatura aliada objetivo gana Prisa hasta final del turno',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 5,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: Ability.PRISA,
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: 'Solo se puede jugar si tienes 5 o menos de vida. Una criatura aliada objetivo gana +2/+2 y Prisa hasta final del turno',
  flavorText: 'Una última carta por jugar.'
}

// === 1 MANA (6) ===

export const MERCENARIO: Card = {
  id: 'Mercenario',
  name: 'Mercenario',
  image: '/imgCards/mercenario_agil.png',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 1,
  attack: 2,
  health: 1,
  abilities: [Ability.SIGILO],
  effects: [
    {
      id: 'Mercenario_Draw_On_Kill',
      description: 'Cuando esta criatura mata a una criatura enemiga, roba una carta',
      timing: EffectTiming.TRIGGERED,
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '2/1 con Sigilo. Cuando mata a una criatura enemiga, roba una carta',
  flavorText: 'Cada muerte es una lección aprendida.'
}

export const CUERVO_ASTUTO: Card = {
  id: 'Cuervo_Astuto',
  name: 'Cuervo Astuto',
  image: '/imgCards/cuervoastuto.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 1,
  attack: 1,
  health: 1,
  abilities: [Ability.VUELO],
  effects: [
    {
      id: 'Cuervo_Scry_1',
      description: 'Scry 1: Mira la primera carta de tu mazo. Puedes ponerla al fondo',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.SCRY,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/1 con Vuelo. Al ser jugado: Scry 1 (Mira la primera carta de tu mazo. Puedes ponerla al fondo)',
  flavorText: 'Ve más allá del horizonte.'
}

export const ASESINO_DELAROSSA: Card = {
  id: 'Asesino_Delarossa',
  name: 'Asesino Delarossa',
  image: '/imgCards/assesino.png',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 1,
  attack: 1,
  health: 2,
  abilities: [Ability.VENENO],
  effects: [],
  description: '1/2 con Veneno',
  flavorText: 'Soy la espina del rosa.'
}

export const GUARDIAN_NOVATO: Card = {
  id: 'Guardian_Novato',
  name: 'Guardián Novato',
  image: '/imgCards/guardia_novato.png',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 1,
  attack: 0,
  health: 3,
  abilities: [Ability.TAUNT],
  effects: [
    {
      id: 'Guardian_Draw_On_Death',
      description: 'Grito de muerte: Roba 1 carta',
      timing: EffectTiming.ON_DEATH,
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '0/3 con Provocar. Grito de muerte: Roba 1 carta',
  flavorText: 'Cada sacrificio enseña una lección.'
}

export const PRIMERA_OPORTUNIDAD: Card = {
  id: 'Primera_Oportunidad',
  name: 'Primera Oportunidad',
  image: '/imgCards/primeraoportunidad.jpg',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 1,
  abilities: [],
  effects: [
    {
      id: 'Primera_Oportunidad_attack',
      description: 'Una criatura aliada objetivo ataca a la criatura enemiga objetivo',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.ATTACK_SPELL,
        target: EffectTarget.TARGET_CREATURE,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Una criatura aliada objetivo ataca a la criatura enemiga objetivo',
  flavorText: 'No lo verás venir.'
}

export const CUCHILLA_ENVENENADA: Card = {
  id: 'Cuchilla_Envenenada',
  name: 'Cuchilla Envenenada',
  image: '/imgCards/cuchilla.png',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 1,
  abilities: [],
  effects: [
    {
      id: 'Cuchilla_Grant_Poison',
      description: 'Gana Veneno hasta el final del turno',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: Ability.VENENO,
        duration: 'END_OF_TURN'
      }
    },
    {
      id: 'Cuchilla_Grant_Draw_On_Kill',
      description: 'Si mata a una criatura este turno, roba 1 carta',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.GRANT_TEMP_DRAW_ON_KILL,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        amount: 1,
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: 'Una criatura aliada objetivo gana Veneno hasta el final del turno. Si mata a una criatura enemiga este turno, roba 1 carta',
  flavorText: 'El toque letal.'
}

export const EXPLORADOR_AUDAZ: Card = {
  id: 'Explorador_Audaz',
  name: 'Explorador Audaz',
  image: '/imgCards/explorador.png',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 2,
  attack: 1,
  health: 1,
  abilities: [],
  effects: [
    {
      id: 'Explorador_Advanced_Selection',
      description: 'Al entrar: Mira las 3 primeras cartas de tu mazo, pon 1 en tu mano, el resto abajo en cualquier orden',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.ADVANCED_SELECTION,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 3, // Número de cartas a mostrar
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/1. Al entrar: Mira las 3 primeras cartas de tu mazo, pon 1 en tu mano, el resto abajo en cualquier orden',
  flavorText: 'La curiosidad tiene recompensas.'
}

// === 2 MANA (5) ===

export const ESCRIBA_DEL_LYRIO: Card = {
  id: 'Escriba_Del_Lyrio',
  name: 'Escriba Del Lyrio',
  image: '/imgCards/escribadellyrio.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 2,
  attack: 1,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Escriba_Draw_Card',
      description: 'Al entrar: Roba 1 carta',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Escriba_Lose_Life',
      description: 'Al entrar: Pierde 3 de vida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 3,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/3. Al entrar: Roba 1 carta y pierde 3 de vida',
  flavorText: 'El conocimiento tiene su precio.'
}

export const FLECHA_CERTERA: Card = {
  id: 'Flecha_Certera',
  name: 'Flecha Certeza',
  image: '/imgCards/flechacerteza.jpg',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Flecha_Certera_Damage_And_Draw',
      description: 'Haz 3 de daño. Si el objetivo muere, roba 1 carta',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE_AND_DRAW_IF_KILL,
        target: EffectTarget.TARGET_CREATURE,
        amount: 3, // Daño
        value: 1, // Cartas a robar si mata
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 3 de daño. Si el objetivo muere, roba 1 carta',
  flavorText: 'La precisión tiene recompensas.'
}

export const DUELISTA_FRENETICO: Card = {
  id: 'Duelista_Frenetico',
  name: 'Duelista Frenetico',
  image: '/imgCards/duelista frenetico.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 2,
  attack: 1,
  health: 2,
  abilities: [Ability.IMPACIENTE],
  effects: [
    {
      id: 'Duelista_Frenetico_Solo_Attack_Buff',
      description: 'Si es la única criatura aliada al atacar, gana +2/+1 hasta final del turno',
      timing: EffectTiming.ON_ATTACK,
      condition: {
        type: 'BOARD_STATE',
        value: 'ONLY_CREATURE_ON_BOARD',
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
  description: 'Mientras sea tu única criatura, tiene +2/+1. Al atacar solo, gana +2/+1 adicional hasta fin de turno',
  flavorText: 'El honor exige un combate justo.'
}

export const COMERCIANTE_SAGAZ: Card = {
  id: 'Comerciante_Sagaz',
  name: 'Comerciante Sagaz',
  image: '/imgCards/comerciantesagaz.webp',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 2,
  attack: 1,
  health: 3,
  abilities: [],
  effects: [],
  description: 'Mientras tengas 6 o más cartas en mano, tiene Taunt',
  flavorText: 'Los recursos son poder, el poder es protección.'
}

export const PETALOS_CERTEROS: Card = {
  id: 'Petalos_Certeros',
  name: 'Petalos Certeros',
  image: '/imgCards/petalocerteros.webp',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Petalos_Certeros_Anti_Flying',
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
  image: '/imgCards/berserkerherido.webp',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
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

export const ESTUDIO_FRENETICO: Card = {
  id: 'Estudio_Frenetico',
  name: 'Estudio Frenetico',
  image: '/imgCards/estudiofrenetico.png',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Estudio_Frenetico_Draw_Cards',
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
  flavorText: 'Necesito mas conocimiento.'
}

export const ASCENDER: Card = {
  id: 'Ascender',
  name: 'Ascender',
  image: '/imgCards/ascender.png',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Ascender_Buff_Stats',
      description: 'Una criatura aliada gana +2/+2',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: '+2/+2',
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Ascender_Gain_Taunt',
      description: 'Luego gana Taunt',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: Ability.TAUNT,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Una criatura aliada gana +2/+2 y Taunt',
  flavorText: 'El tiempo es lo que hace al maestro.'
}

export const SOLDADO_VETERANO: Card = {
  id: 'Soldado_Veterano',
  name: 'Soldado Veterano',
  image: '/imgCards/soldadoveterano.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 3,
  attack: 2,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Soldado_Board_Presence_Buff',
      description: 'Al entrar: Si controlas otra criatura, una criatura aliada gana Escudo',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'BOARD_STATE',
        value: 'HAS_OTHER_CREATURES',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: Ability.ESCUDO,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Soldado_Board_Presence_Attack',
      description: 'Al entrar: Si controlas otra criatura, una criatura aliada gana +1/+0',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'BOARD_STATE',
        value: 'HAS_OTHER_CREATURES',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: '+1/+0',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '2/3. Al entrar: Si controlas otra criatura, elige una criatura aliada: gana Escudo y +1/+0',
  flavorText: 'La experiencia enseña el valor de los aliados.'
}

export const CAPA_DELAROSSA: Card = {
  id: 'Capa_Delarossa',
  name: 'Capa Delarossa',
  image: '/imgCards/nose.png',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Capa_Delarossa_Sigilo_And_Buff',
      description: 'Una criatura aliada gana Sigilo',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: Ability.SIGILO,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Capa_Delarossa_Buff',
      description: 'Una criatura aliada gana +2/+0',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
        value: '+2/+0',
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Una criatura aliada gana Sigilo y +2/+0',
  flavorText: 'Proteger tiene recompensas.'
}

export const CURANDERO_SABIO: Card = {
  id: 'Curandero_Sabio',
  name: 'Curandero Sabio',
  image: '/imgCards/curandersabio.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
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
  image: '/imgCards/centinelavigilante.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
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
  image: '/imgCards/llamaimpura.jpg',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
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
        value: 'FACE_PER_KILL',
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
  image: '/imgCards/maestrodearmas.webp',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
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
        target: EffectTarget.TARGET_FRIENDLY_CREATURE,
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
  image: '/imgCards/acechadornocturno.webp',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
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
  image: '/imgCards/palabradepoder.jpg',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  mana: 4,
  abilities: [],
  effects: [
    {
      id: 'Palabra_Conditional_Removal',
      description: 'Destruye una criatura con 3 o menos de vida. Si destruyes una criatura sin daño, tu próxima carta cuesta 2 menos',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 999,
        value: 'EXECUTE_3_OR_LESS_REDUCE_IF_UNDAMAGED',
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
  image: '/imgCards/vampiroancestral.webp',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
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
  image: '/imgCards/colosodehierro.jpeg',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  mana: 5,
  attack: 6,
  health: 4,
  abilities: [],
  effects: [
    {
      id: 'Coloso_Awakening_On_Enter',
      description: 'Al entrar: Si hay 3+ criaturas en el tablero, gana Prisa',
      timing: EffectTiming.ON_ENTER,
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
    },
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
  image: '/imgCards/ingenieriaastuta.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
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
  image: '/imgCards/tormentadeacero.jpg',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
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
  image: '/imgCards/golpedevastador.jpg',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
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
        value: 'FACE_3_IF_KILL',
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
  image: '/imgCards/campeoncaido.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
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
  image: '/imgCards/señordelaguerra.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
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
  image: '/imgCards/ritualderenovacion.webp',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  mana: 6,
  abilities: [],
  effects: [
    {
      id: 'Ritual_Board_Reset',
      description: 'Destruye todas las criaturas. Haz daño al héroe enemigo igual a las criaturas destruidas',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.ALL_CREATURES,
        amount: 999,
        value: 'FACE_PER_KILL',
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Destruye todas las criaturas. Haz daño al héroe enemigo igual a las criaturas destruidas',
  flavorText: 'La destrucción siempre enseña algo.'
}

// === 7+ MANA (2) ===

export const TITAN_PRIMORDIAL: Card = {
  id: 'Titan_Primordial',
  name: 'Titán Primordial',
  image: '/imgCards/titanprimordial.jpg',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
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
  image: '/imgCards/apocalipsis.png',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
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
        value: 'FACE_PER_KILL_MIN5',
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Haz 6 de daño a todas las criaturas. Si matas 5 o más criaturas de esta forma, haz daño igual a las criaturas eliminadas al rival',
  flavorText: 'La destrucción masiva tiene consecuencias.'
}

// Al final del archivo
export const BASIC_CARDS = [
  ULTIMA_OPORTUNIDAD,
  MERCENARIO,
  CUERVO_ASTUTO,
  ASESINO_DELAROSSA,
  GUARDIAN_NOVATO,
  PRIMERA_OPORTUNIDAD,
  CUCHILLA_ENVENENADA,
  EXPLORADOR_AUDAZ,
  ESCRIBA_DEL_LYRIO,
  FLECHA_CERTERA,
  DUELISTA_FRENETICO,
  COMERCIANTE_SAGAZ,
  PETALOS_CERTEROS,
  BERSERKER_HERIDO,
  ESTUDIO_FRENETICO,
  ASCENDER  ,
  SOLDADO_VETERANO,
  CAPA_DELAROSSA,
  CURANDERO_SABIO,
  CENTINELA_VIGILANTE,
  LLAMA_IMPURA,
  MAESTRO_DE_ARMAS,
  ACECHADOR_NOCTURNO,
  PALABRA_DE_PODER,
  VAMPIRO_ANCESTRAL,
  COLOSO_DE_HIERRO,
  INGENIERA_ASTUTA,
  TORMENTA_DE_ACERO,
  GOLPE_DEVASTADOR,
  CAMPEON_CAIDO,
  SENOR_DE_LA_GUERRA,
  RITUAL_DE_RENOVACION,
  TITAN_PRIMORDIAL,
  APOCALIPSIS,
]

// Opcional: acceso por id
export const BASIC_CARDS_BY_ID = Object.fromEntries(
  BASIC_CARDS.map(c => [c.id, c] as const)
)