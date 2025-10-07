import { 
  Card, 
  CycleCard, 
  CardType, 
  CardRarity, 
  ClassType, 
  CycleState, 
  Ability,
  EffectTiming,
  EffectTarget,
  EffectActionType  
} from '../types/cards'


/**
 * CARTAS DE CLASE - Implementación Completa  
 * 43 cartas total: 40 de clase + 3 versiones Espécimen Perfecto
 */

// ===== 🧬 ESPÉCIMEN PERFECTO - Las 3 Versiones Especiales =====

export const ESPECIMEN_PERFECTO: Card = {
  id: 'Especimen_Perfecto',
  name: 'Espécimen Perfecto',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.ABOMINACION,
  mana: 5, // 1er invocación: 5, 2da: 7, 3ra: 9, 4ta+: 10
  attack: 5,
  health: 5,
  abilities: [], // Se heredan dinámicamente
  effects: [
    {
      id: 'Especimen_Inherit_Abilities',
      description: 'Hereda todas las habilidades únicas de criaturas en tu cementerio',
      timing: EffectTiming.PASSIVE,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: 'INHERIT_FROM_GRAVEYARD',
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Especimen_Inherit_Programmed_Effects',
      description: 'Al entrar: Ejecuta todos los efectos programados por cartas de ABOMINACIÓN',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.SUMMON_SPECIMEN,
        target: EffectTarget.SELF,
        value: 'EXECUTE_PROGRAMMED_EFFECTS',
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'CEMENTERIO',
    amount: 1
  },
  description: '5/5. Hereda habilidades del cementerio y efectos programados por cartas de clase. Costo aumenta +2 cada invocación (máximo 10)',
  flavorText: 'La suma perfecta de todas las partes.'
}

export const ESPECIMEN_PERFECTO_FINAL_STAND: Card = {
  id: 'Especimen_Perfecto_Final_Stand',  
  name: 'Espécimen Imperfecto',
  type: CardType.CREATURE,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.ABOMINACION,
  mana: 0, // Se invoca gratis durante Final Stand
  attack: 2,
  health: 2,
  abilities: [],
  effects: [
    {
      id: 'Especimen_FS_Inherit_Abilities_Only',
      description: 'Hereda solo las habilidades únicas de criaturas en tu cementerio',
      timing: EffectTiming.PASSIVE,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: 'INHERIT_FROM_GRAVEYARD',
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Especimen_FS_Scaling',
      description: 'Al entrar: +1/+1 por cada habilidad diferente que tenga',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.SELF,
        value: '+1/+1_PER_ABILITY',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '2/2. Solo durante Final Stand. Hereda solo habilidades del cementerio (no efectos programados). Al entrar: +1/+1 por cada habilidad diferente',
  flavorText: 'En la desesperación, surge la esencia pura.'
}

export const ESPECIMEN_PERFECTO_EVOLUCIONADO: Card = {
  id: 'Especimen_Perfecto_Evolucionado',
  name: 'Apex de la evolución',
  type: CardType.CREATURE,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.ABOMINACION,
  mana: 10,
  attack: 10,
  health: 10,
  abilities: [],
  effects: [
    {
      id: 'Especimen_Evo_Inherit_All',
      description: 'Hereda habilidades + efectos programados + dispara todos los efectos "Al entrar" de todos los cementerios',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.SUMMON_SPECIMEN,
        target: EffectTarget.SELF,
        value: 'ULTIMATE_EVOLUTION_10_10',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '10/10. Solo mediante "Evolución Perfecta". Hereda todo + dispara efectos "Al entrar" de todos los cementerios',
  flavorText: 'La perfección absoluta trasciende la muerte.'
}

// ==========================================
// 🧬 CLASE: ABOMINACIÓN (10/10)
// Mecánica: Espécimen Perfecto + Cementerio
// ==========================================

export const EXPLORADOR_INFECTADO: Card = {
  id: 'Explorador_Infectado',
  name: 'Explorador Infectado',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.ABOMINACION,
  mana: 1,
  attack: 1,
  health: 1,
  abilities: [Ability.VENENO],
  effects: [
    {
      id: 'Explorador_Death_Draw',
      description: 'Roba 1 carta si han muerto 3+ criaturas',
      timing: EffectTiming.ON_DEATH,
      condition: {
        type: 'GRAVEYARD_COUNT',
        value: 3,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/1 con Veneno. Al morir: Roba 1 carta si tu cementerio tiene 3+ criaturas',
  flavorText: 'Su muerte alimenta el conocimiento.'
}

export const RECOLECTOR_DE_TEJIDOS: Card = {
  id: 'Recolector_de_Tejidos',
  name: 'Recolector de Tejidos',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.ABOMINACION,
  mana: 2,
  attack: 1,
  health: 3,
  abilities: [Ability.ROBO_DE_VIDA],
  effects: [
    {
      id: 'Recolector_Specimen_Enhancement',
      description: 'Al morir: Tu próximo Espécimen Perfecto gana "Al entrar: Haz 3 de daño a un objetivo"',
      timing: EffectTiming.ON_DEATH,
      action: {
        type: EffectActionType.SUMMON_SPECIMEN,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'DAMAGE_3_ON_ENTER',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '1/3 con Robo de vida. Al morir: Tu próximo Espécimen Perfecto gana "Al entrar: Haz 3 de daño a un objetivo"',
  flavorText: 'Las partes útiles nunca se desperdician.'
}

export const NECROFAGO_HAMBRIENTO: Card = {
  id: 'Necrofago_Hambriento',
  name: 'Necrófago Hambriento',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.ABOMINACION,
  mana: 2,
  attack: 1,
  health: 2,
  abilities: [Ability.ESCUDO],
  effects: [
    {
      id: 'Necrofago_Graveyard_Scaling',
      description: 'Al entrar: Gana +1/+1 por cada tipo de habilidad diferente en tu cementerio',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'GRAVEYARD_COUNT',
        value: 2,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.SELF,
        value: '+1/+1',
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'CEMENTERIO',
    amount: 2
  },
  description: '1/2 con Escudo. Cementerio 2+: Al entrar: Gana +1/+1 por cada tipo de habilidad diferente en tu cementerio',
  flavorText: 'Se alimenta de los caídos.'
}

export const RITUAL_MENOR: Card = {
  id: 'Ritual_Menor',
  name: 'Ritual Menor',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.ABOMINACION,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Ritual_Sacrifice_Draw',
      description: 'Destruye una criatura aliada. Roba 2 cartas. Si tenía una habilidad, roba 1 carta adicional',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 999,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Destruye una criatura aliada. Roba 2 cartas. Si tenía una habilidad, roba 1 carta adicional',
  flavorText: 'El sacrificio trae sabiduría.'
}

export const ANATOMISTA_EXPERTO: Card = {
  id: 'Anatomista_Experto',
  name: 'Anatomista Experto',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.ABOMINACION,
  mana: 3,
  attack: 2,
  health: 4,
  abilities: [],
  effects: [
    {
      id: 'Anatomista_Conditional_Regeneration',
      description: 'Si una criatura aliada murió este turno, esta carta gana Regeneración hasta tu próximo turno',
      timing: EffectTiming.TRIGGERED,
      condition: {
        type: 'BOARD_STATE',
        value: 'ALLY_DIED_THIS_TURN',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: Ability.REGENERACION,
        duration: 'UNTIL_DEATH'
      }
    }
  ],
  description: '2/4. Si una criatura aliada murió este turno, esta carta gana Regeneración hasta tu próximo turno',
  flavorText: 'Cada muerte enseña resistencia.'
}

export const INVOCACION_SINIESTRA: Card = {
  id: 'Invocacion_Siniestra',
  name: 'Invocación Siniestra',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.ABOMINACION,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Invocacion_Graveyard_Recursion',
      description: 'Descubre X criaturas de cualquier cementerio, puedes invocar una. Hasta el final del turno obtiene Prisa',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'GRAVEYARD_COUNT',
        value: 1,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.SUMMON_CREATURE,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'DISCOVER_FROM_GRAVEYARD',
        duration: 'END_OF_TURN'
      }
    }
  ],
  classResource: {
    type: 'CEMENTERIO',
    amount: 1
  },
  description: 'Cementerio X: Descubre X criaturas de cualquier cementerio, puedes invocar una. Hasta el final del turno obtiene Prisa',
  flavorText: 'Los muertos sirven una vez más.'
}

export const PERFECCIONISTA_OBSESIVO: Card = {
  id: 'Perfeccionista_Obsesivo',
  name: 'Perfeccionista Obsesivo',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.ABOMINACION,
  mana: 4,
  attack: 3,
  health: 3,
  abilities: [Ability.ESCUDO],
  effects: [
    {
      id: 'Perfeccionista_Specimen_Enhancement',
      description: 'Cuando tu Espécimen Perfecto sea invocado, gana Taunt y +2/+2',
      timing: EffectTiming.TRIGGERED,
      condition: {
        type: 'BOARD_STATE',
        value: 'SPECIMEN_SUMMONED',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.TARGET_CREATURE,
        value: Ability.TAUNT,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '3/3 con Escudo. Cuando tu Espécimen Perfecto sea invocado, gana Taunt y +2/+2',
  flavorText: 'Cada detalle debe ser perfecto.'
}

export const RITUAL_DE_PERFECCION: Card = {
  id: 'Ritual_de_Perfeccion',
  name: 'Ritual de Perfección',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.ABOMINACION,
  mana: 5,
  abilities: [],
  effects: [
    {
      id: 'Ritual_Immediate_Specimen',
      description: 'Invoca inmediatamente tu Espécimen Perfecto. Gana "Al entrar: Por cada habilidad diferente que tenga, gana +1/+1"',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.SUMMON_SPECIMEN,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'IMMEDIATE_SUMMON_WITH_SCALING',
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Invoca inmediatamente tu Espécimen Perfecto. Gana "Al entrar: Por cada habilidad diferente que tenga, gana +1/+1"',
  flavorText: 'La convergencia de toda evolución.'
}

export const MAESTRO_NECROMANTICO: Card = {
  id: 'Maestro_Necromantico',
  name: 'Maestro Necromántico',
  type: CardType.CREATURE,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.ABOMINACION,
  mana: 6,
  attack: 4,
  health: 6,
  abilities: [Ability.TAUNT],
  effects: [
    {
      id: 'Maestro_Grant_Stealth',
      description: 'Al entrar: Todas las criaturas en tu cementerio ganan Sigilo hasta el final de la partida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.FRIENDLY_HERO,
        value: Ability.SIGILO,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Maestro_Emergency_Specimen',
      description: 'Tu Espécimen Perfecto puede ser invocado este turno sin importar el mana',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'GRAVEYARD_COUNT',
        value: 6,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.SUMMON_SPECIMEN,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'FREE_SUMMON_THIS_TURN',
        duration: 'END_OF_TURN'
      }
    }
  ],
  classResource: {
    type: 'CEMENTERIO',
    amount: 6
  },
  description: '4/6 con Taunt. Al entrar: Todas las criaturas en tu cementerio ganan Sigilo hasta el final de la partida. Cementerio 6+: Tu Espécimen Perfecto puede ser invocado este turno sin importar el mana',
  flavorText: 'Domina tanto la vida como la muerte.'
}

export const EVOLUCION_PERFECTA: Card = {
  id: 'Evolucion_Perfecta',
  name: 'Evolución Perfecta',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.ABOMINACION,
  mana: 10,
  abilities: [],
  effects: [
    {
      id: 'Evolucion_Ultimate_Transform',
      description: 'Solo se puede jugar si tu Espécimen Perfecto está en juego. Destruye a tu Espécimen Perfecto y lo reinvoca como un 10/10 que dispara todos los efectos "Al entrar" de todos los cementerios',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'BOARD_STATE',
        value: 'SPECIMEN_ON_BOARD',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.SUMMON_SPECIMEN,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'ULTIMATE_EVOLUTION_10_10',
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Solo se puede jugar si tu Espécimen Perfecto está en juego. Destruye a tu Espécimen Perfecto y lo reinvoca como un 10/10 que dispara todos los efectos "Al entrar" de todos los cementerios',
  flavorText: 'La perfección absoluta trasciende la muerte.'
}

// ==========================================  
// 🎲 CLASE: CAOS (10/10)
// Mecánica: Entropía (0-10, persistente)
// ==========================================

export const APRENDIZ_ERRATICO: Card = {
  id: 'Aprendiz_Erratico',
  name: 'Aprendiz Errático',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.CAOS,
  mana: 1,
  attack: 1,
  health: 1,
  abilities: [],
  effects: [
    {
      id: 'Aprendiz_Extra_Entropy',
      description: 'Al ser jugado: Gana 1 Entropía adicional (total: 2 Entropía de esta carta)',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.GAIN_ENTROPY,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Aprendiz_Random_Buff',
      description: 'Entropía 3+: Una criatura aleatoria gana +1/+1',
      timing: EffectTiming.END_OF_TURN,
      condition: {
        type: 'CLASS_RESOURCE',
        value: 3,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.RANDOM_CREATURE,
        value: '+1/+1',
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ENTROPIA',
    amount: 3
  },
  description: '1/1. Al ser jugado: Gana 1 Entropía adicional (total: 2 Entropía de esta carta). Entropía 3+: Gana +1/+1 aleatorio al final del turno',
  flavorText: 'El caos premia a los imprudentes.'
}

export const MAGO_DEL_CAOS: Card = {
  id: 'Mago_del_Caos',
  name: 'Mago del Caos',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.CAOS,
  mana: 2,
  attack: 1,
  health: 2,
  abilities: [Ability.IMPACIENTE],
  effects: [
    {
      id: 'Mago_Gain_Entropy',
      description: 'Al ser jugado: Gana 1 Entropía',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.GAIN_ENTROPY,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Mago_Random_Damage',
      description: 'Al final del turno, inflige 1 de daño a cualquier objetivo menos el mismo',
      timing: EffectTiming.END_OF_TURN,
      condition: {
        type: 'CLASS_RESOURCE',
        value: 2,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.RANDOM_ENEMY,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ENTROPIA',
    amount: 2
  },
  description: '1/2 con Impaciente. Al ser jugado: Gana 1 Entropía. Entropía 2+: Al final del turno, inflige 1 de daño a cualquier objetivo menos el mismo',
  flavorText: 'La magia encuentra su propio camino.'
}

export const RITUAL_CAOTICO: Card = {
  id: 'Ritual_Caotico',
  name: 'Ritual Caótico',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.CAOS,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Ritual_Extra_Entropy',
      description: 'Gana 2 Entropía adicional (total: 3 Entropía de esta carta)',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.GAIN_ENTROPY,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 2,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Ritual_Steal_Card',
      description: 'Entropía 5+: Además, roba 2 cartas',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: 5,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 2,
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ENTROPIA',
    amount: 5
  },
  description: 'Gana 2 Entropía adicional (total: 3 Entropía de esta carta). Entropía 5+: Además, roba 1 carta aleatoria del mazo del oponente',
  flavorText: 'El desorden revela secretos.'
}

export const MERCADER_LOCO: Card = {
  id: 'Mercader_Loco',
  name: 'Mercader Loco',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.CAOS,
  mana: 2,
  attack: 2,
  health: 2,
  abilities: [],
  effects: [
    {
      id: 'Mercader_Card_Exchange',
      description: 'Entropía 2+: Roba 1 carta',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'CLASS_RESOURCE',
        value: 2,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ENTROPIA',
    amount: 2
  },
  description: '2/2. Entropía 2+: Al entrar: Roba 1 carta',
  flavorText: 'Comercia lo imposible por lo improbable.'
}

export const MANIPULADOR_DEL_DESTINO: Card = {
  id: 'Manipulador_del_Destino',
  name: 'Manipulador del Destino',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.CAOS,
  mana: 3,
  attack: 2,
  health: 3,
  abilities: [Ability.VUELO],
  effects: [
    {
      id: 'Manipulador_Entropy_Burst_Option',
      description: 'Al entrar: Puedes pagar 4 Entropía para hacer 2 de daño N veces a enemigos aleatorios.',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DISCOVER_PAY_ENTROPY,
        target: EffectTarget.FRIENDLY_HERO,
        options: {
          entropyCost: 4,
          buff: { type: EffectActionType.DAMAGE, target: EffectTarget.RANDOM_ENEMY, amount: 2, value: 'REPEAT_N:3', duration: 'PERMANENT' }
        }
      }
    }
  ],
  description: '2/3 con Vuelo. Al entrar: puedes pagar 4 Entropía para lanzar N impactos de 2 a enemigos aleatorios (N=3).',
  flavorText: 'El destino obedece a quien comprende el caos.'
}
export const PORTAL_INESTABLE: Card = {
  id: 'Portal_Inestable',
  name: 'Portal Inestable',
  image: '/imgCards/portal_inestable.jpg',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.CAOS,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Portal_Scaling_Summon',
      description: 'Entropía 3: Invoca una criatura aleatoria de costo 3 o menos. Entropía 6: de costo 6 o menos. Entropía 9: de cualquier costo (solo criaturas del set base)',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.SUMMON_CREATURE,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'RANDOM_BY_ENTROPY',
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Entropía 3: Invoca una criatura aleatoria de costo 3 o menos. Entropía 6: En su lugar, de costo 6 o menos. Entropía 9: En su lugar, de cualquier costo',
  flavorText: 'Cada portal lleva a un lugar diferente.'
}

export const CAOS_CONTROLADO: Card = {
  id: 'Caos_Controlado',
  name: 'Caos Controlado',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.CAOS,
  mana: 1,
  abilities: [],
  effects: [
    {
      id: 'Caos_Scaling_Cost_Reduction',
      description: 'Entropía 4: La próxima carta cuesta 2 menos. Entropía 7: Las próximas 2 cartas. Entropía 10: Todas tus cartas hasta fin de turno',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.REDUCE_CARD_COST,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 2,
        duration: 'END_OF_TURN',
        options: {
          thresholds: [
            { min: 4, uses: 1 },
            { min: 7, uses: 2 },
            { min: 10, uses: 'ALL' }
          ]
        }
      }
    }
  ],
  description: 'Entropía 4: Próxima carta -2. Entropía 7: Próximas 2 cartas -2. Entropía 10: Todas tus cartas -2 hasta fin de turno',
  flavorText: 'Dominar el caos es el arte supremo.'
}

export const SENOR_DEL_CAOS: Card = {
  id: 'Senor_del_Caos',
  name: 'Señor del Caos',
  type: CardType.CREATURE,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.CAOS,
  mana: 6,
  attack: 4,
  health: 4,
  abilities: [Ability.IMPACIENTE],
  effects: [
    {
      id: 'Senor_Effect_Recycling',
      description: 'Al final de tu turno: Activa un efecto aleatorio de una carta de CAOS que hayas jugado esta partida',
      timing: EffectTiming.END_OF_TURN,
      condition: {
        type: 'CLASS_RESOURCE',
        value: 6,
        comparison: 'GREATER_EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ENTROPY,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ENTROPIA',
    amount: 6
  },
  description: '4/4 con Impaciente. Entropía 6+: Al final de tu turno: Activa un efecto aleatorio de una carta de CAOS que hayas jugado esta partida',
  flavorText: 'Maestro de todos los efectos, esclavo de ninguno.'
}

export const TORMENTA_IMPREDECIBLE: Card = {
  id: 'Tormenta_Impredecible',
  name: 'Tormenta Impredecible',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.CAOS,
  mana: 0,
  abilities: [],
  effects: [
    {
      id: 'Tormenta_Entropy_Damage',
      description: 'Haz 2 de daño completamente aleatorio por cada punto de entropía',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.RANDOM_CHARACTER,
        amount: 2,
        value: 'RANDOM_BY_ENTROPY', // ← usa entropía, N disparos aleatorios
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Entropía X: Haz 2 de daño completamente aleatorio por cada punto de entropía',
  flavorText: 'El caos no distingue entre amigo y enemigo.'
}

export const REALIDAD_FRACTURADA: Card = {
  id: 'realidad_fracturada',
  name: 'Realidad Fracturada',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.CAOS,
  mana: 10,
  description: 'Entropía 8+: Juega todas las cartas de tu mano con objetivos aleatorios. Entropía 10: Además, todas se juegan dos veces.',
  flavorText: 'Cuando la realidad se fractura, todo sucede múltiples veces.',
  abilities: [],
  classResource: { type: 'ENTROPIA', amount: 8 },
  effects: [
    {
      id: 'realidad_fracturada_8',
      description: 'Entropía 8+: Juega todas las cartas de tu mano con objetivos aleatorios',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: 8,
        comparison: 'GREATER_EQUAL'          // ← añadir
      },
      action: {
        type: EffectActionType.TRANSFORM,
        target: EffectTarget.SELF,
        value: 'PLAY_ALL_HAND_RANDOM_TARGETS'
      }
    },
    {
      id: 'realidad_fracturada_10',
      description: 'Entropía 10: Todas las cartas se juegan dos veces',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: 10,
        comparison: 'GREATER_EQUAL'          // ← añadir
      },
      action: {
        type: EffectActionType.TRANSFORM,
        target: EffectTarget.SELF,
        value: 'PLAY_ALL_HAND_TWICE_RANDOM_TARGETS'
      }
    }
  ]
}

// ==========================================
// 🌓 CLASE: CICLO (10/10) 
// Mecánica: Día/Noche/Eclipse + CycleCards
// ==========================================

export const EXPLORADOR_CREPUSCULAR: CycleCard = {
  id: 'Explorador_Crepuscular',
  name: 'Explorador Crepuscular',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.CICLO,
  mana: 1,
  dayForm: {
    attack: 2,
    health: 1,
    abilities: [Ability.PRISA],
    effects: []
  },
  
  nightForm: {
    attack: 1,
    health: 2,
    abilities: [Ability.SIGILO],
    effects: []
  },
  
  eclipseForm: {
    attack: 3,
    health: 3,
    abilities: [Ability.PRISA, Ability.SIGILO],
    effects: []
  },
  
  description: 'Día: 2/1 con Prisa. Noche: 1/2 con Sigilo. Eclipse: 3/3 con Prisa y Sigilo',
  flavorText: 'Se adapta a cada momento del día.'
}

export const RITUAL_DEL_AMANECER: Card = {
  id: 'Ritual_del_Amanecer',
  name: 'Ritual del Amanecer',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.CICLO,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Ritual_Day_Effect',
      description: 'Día: Haz 3 de daño a un objetivo',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.DIA,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 3,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Ritual_Night_Effect',
      description: 'Noche: Cura 3 de vida a tu héroe',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.NOCHE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.HEAL,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 3,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Ritual_Eclipse_Effect',
      description: 'Eclipse: Haz 3 de daño Y cura 3 de vida',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.ECLIPSE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 3,
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ESTADO',
    state: CycleState.DIA // Placeholder - real implementation handles all states
  },
  description: 'Día: Haz 3 de daño a un objetivo. Noche: Cura 3 de vida a tu héroe. Eclipse: Haz 3 de daño Y cura 3 de vida',
  flavorText: 'El ciclo eterno de destrucción y renovación.'
}

export const VIDENTE_LUNAR: Card = {
  id: 'Vidente_Lunar',
  name: 'Vidente Lunar',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.CICLO,
  mana: 2,
  attack: 1,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Vidente_Day_Patience',
      description: 'Día: Al final del turno: Si no cambiaste de estado, roba 1 carta',
      timing: EffectTiming.END_OF_TURN,
      condition: {
        type: 'BOARD_STATE',
        value: 'NO_STATE_CHANGE_THIS_TURN',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.DRAW_CARDS,
        target: EffectTarget.FRIENDLY_HERO,
        amount: 1,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Vidente_Night_Patience',
      description: 'Noche: Al final del turno: Si no cambiaste de estado, gana Taunt hasta tu próximo turno',
      timing: EffectTiming.END_OF_TURN,
      condition: {
        type: 'BOARD_STATE',
        value: 'NO_STATE_CHANGE_THIS_TURN',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: Ability.TAUNT,
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: '1/3. Día: Al final del turno: Si no cambiaste de estado, roba 1 carta. Noche: Al final del turno: Si no cambiaste de estado, gana Taunt hasta tu próximo turno',
  flavorText: 'La paciencia revela secretos.'
}

export const CAMBIAFORMAS_LUNAR: CycleCard = {
  id: 'Cambiaformas_Lunar',
  name: 'Cambiaformas Lunar',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.CICLO,
  mana: 3,
  
  dayForm: {
    attack: 4,
    health: 2,
    abilities: [Ability.PRISA],
    effects: []
  },
  
  nightForm: {
    attack: 2,
    health: 4,
    abilities: [Ability.TAUNT],
    effects: []
  },
  
  eclipseForm: {
    attack: 4,
    health: 4,
    abilities: [Ability.TAUNT, Ability.PRISA],
    effects: []
  },
  
  description: 'Día: 4/2 con Prisa. Noche: 2/4 con Taunt. Eclipse: 4/4 con Taunt y Prisa',
  flavorText: 'Cada momento tiene su forma perfecta.'
}

export const INVOCADOR_DE_ECLIPSE: Card = {
  id: 'Invocador_de_Eclipse',
  name: 'Invocador de Eclipse',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.CICLO,
  mana: 3,
  attack: 3,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Invocador_Day_Activation',
      description: 'Día: Al entrar: Activa Eclipse si tienes 5+ mana',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'BOARD_STATE',
        value: 'MANA_5_PLUS',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.ACTIVATE_ECLIPSE,
        target: EffectTarget.FRIENDLY_HERO,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Invocador_Night_Activation',
      description: 'Noche: Al entrar: Activa Eclipse si tienes 6+ mana',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'BOARD_STATE',
        value: 'MANA_6_PLUS',
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.ACTIVATE_ECLIPSE,
        target: EffectTarget.FRIENDLY_HERO,
        duration: 'PERMANENT'
      }
    }
  ],
  description: '3/3. Día: Al entrar: Activa Eclipse si tienes 5+ mana. Noche: Al entrar: Activa Eclipse si tienes 6+ mana',
  flavorText: 'Fuerza la convergencia de los astros.'
}

export const GUARDIAN_DEL_EQUILIBRIO: Card = {
  id: 'Guardian_del_Equilibrio',
  name: 'Guardián del Equilibrio',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.CICLO,
  mana: 3,
  attack: 2,
  health: 4,
  abilities: [Ability.TAUNT],
  effects: [
    {
      id: 'Guardian_Eclipse_Regeneration',
      description: 'Al entrar: Si es Eclipse, todas tus criaturas ganan Regeneración hasta final del turno',
      timing: EffectTiming.ON_ENTER,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.ECLIPSE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.ALL_FRIENDLY_CREATURES,
        value: Ability.REGENERACION,
        duration: 'END_OF_TURN'
      }
    },
    {
      id: 'Guardian_Eclipse_Self_Buff',
      description: 'Eclipse: Gana +2/+2 y Escudo',
      timing: EffectTiming.PASSIVE,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.ECLIPSE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_STATS,
        target: EffectTarget.SELF,
        value: '+2/+2',
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ESTADO',
    state: CycleState.ECLIPSE
  },
  description: '2/4 con Taunt. Al entrar: Si es Eclipse, todas tus criaturas ganan Regeneración hasta final del turno. Eclipse: Gana +2/+2 y Escudo',
  flavorText: 'En el equilibrio perfecto, todo es posible.'
}

export const MOMENTO_PERFECTO: Card = {
  id: 'Momento_Perfecto',
  name: 'Momento Perfecto',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.CICLO,
  mana: 4,
  abilities: [],
  effects: [
    {
      id: 'Momento_Day_Attack',
      description: 'Día: Todas tus criaturas atacan inmediatamente con +1/+0',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.DIA,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.BUFF_ATTACK,
        target: EffectTarget.ALL_FRIENDLY_CREATURES,
        amount: 1,
        duration: 'END_OF_TURN'
      }
    },
    {
      id: 'Momento_Night_Defense',
      description: 'Noche: Todas tus criaturas ganan Taunt y +0/+1 hasta final del turno',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.NOCHE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.ALL_FRIENDLY_CREATURES,
        value: Ability.TAUNT,
        duration: 'END_OF_TURN'
      }
    },
    {
      id: 'Momento_Eclipse_Combined',
      description: 'Eclipse: Combina ambos efectos (Taunt y +0/+1 permanentes)',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.ECLIPSE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.ALL_FRIENDLY_CREATURES,
        value: Ability.TAUNT,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Día: Todas tus criaturas atacan inmediatamente con +1/+0. Noche: Todas tus criaturas ganan Taunt y +0/+1 hasta final del turno. Eclipse: Combina ambos efectos (Taunt y +0/+1 permanentes)',
  flavorText: 'El timing lo es todo.'
}

export const MAESTRO_DEL_TIEMPO: Card = {
  id: 'Maestro_del_Tiempo',
  name: 'Maestro del Tiempo',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.CICLO,
  mana: 5,
  attack: 4,
  health: 5,
  abilities: [],
  effects: [
    {
      id: 'Maestro_Force_Eclipse',
      description: 'Al final de tu turno: Puedes cambiar a Eclipse hasta tu próximo turno',
      timing: EffectTiming.END_OF_TURN,
      action: {
        type: EffectActionType.CHANGE_CYCLE_STATE,
        target: EffectTarget.FRIENDLY_HERO,
        value: CycleState.ECLIPSE,
        duration: 'END_OF_TURN'
      }
    },
    {
      id: 'Maestro_Eclipse_Control',
      description: 'Eclipse: Al final del turno: Puedes elegir si cambiar a Día o Noche',
      timing: EffectTiming.END_OF_TURN,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.ECLIPSE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.CHANGE_CYCLE_STATE,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'CHOOSE_DAY_OR_NIGHT',
        duration: 'PERMANENT'
      }
    }
  ],
  description: '4/5. Al final de tu turno: Puedes cambiar a Eclipse hasta tu próximo turno. Eclipse: Al final del turno: Puedes elegir si cambiar a Día o Noche',
  flavorText: 'Controla el flujo del tiempo mismo.'
}

export const ECLIPSE_ETERNO: Card = {
  id: 'Eclipse_Eterno',
  name: 'Eclipse Eterno',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.CICLO,
  mana: 6,
  abilities: [],
  effects: [
    {
      id: 'Eclipse_Activate',
      description: 'Activa Eclipse',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.ACTIVATE_ECLIPSE,
        target: EffectTarget.FRIENDLY_HERO,
        duration: 'PERMANENT'
      }
    },
    {
      id: 'Eclipse_AoE_Damage',
      description: 'Eclipse: Haz 4 de daño a un objetivo y 2 a cada criatura adyacente',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.ECLIPSE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.DAMAGE,
        target: EffectTarget.TARGET_CREATURE,
        amount: 4,
        duration: 'PERMANENT'
      }
    }
  ],
  description: 'Activa Eclipse. Eclipse: Haz 4 de daño a un objetivo y 2 a cada criatura adyacente',
  flavorText: 'Cuando las lunas se alinean, todo es posible.'
}

export const CONVERGENCIA_CELESTIAL: Card = {
  id: 'Convergencia_Celestial',
  name: 'Convergencia Celestial',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.CICLO,
  mana: 8,
  abilities: [],
  effects: [
    {
      id: 'Convergencia_Permanent_Eclipse',
      description: 'Solo se puede jugar durante Eclipse. El resto de la partida es Eclipse permanente. Todas tus cartas funcionan como si fuera Eclipse',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'CLASS_RESOURCE',
        value: CycleState.ECLIPSE,
        comparison: 'EQUAL'
      },
      action: {
        type: EffectActionType.CHANGE_CYCLE_STATE,
        target: EffectTarget.FRIENDLY_HERO,
        value: 'PERMANENT_ECLIPSE',
        duration: 'PERMANENT'
      }
    }
  ],
  classResource: {
    type: 'ESTADO',
    state: CycleState.ECLIPSE
  },
  description: 'Solo se puede jugar durante Eclipse. El resto de la partida es Eclipse permanente. Todas tus cartas funcionan como si fuera Eclipse',
  flavorText: 'Cuando los astros se alinean para siempre.'
}

// ==========================================
// ❤️ CLASE: VITALIDAD (10/10)
// Mecánica: Vida como recurso + All-in Aggro  
// ==========================================

export const FANATICO_DESESPERADO: Card = {
  id: 'Fanatico_Desesperado',
  name: 'Fanático Desesperado',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.VITALIDAD,
  mana: 1,
  attack: 1,
  health: 1,
  abilities: [Ability.PRISA],
  effects: [
    {
      id: 'Fanatico_Descubrir',
      description: 'Elige al entrar: sin cambios, o +2/+0 pagando 2 de vida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.SELF,
        options: {
          lifeCost: 2,
          base: {
            type: EffectActionType.BUFF_STATS,
            target: EffectTarget.SELF,
            value: '+0/+0',
            duration: 'PERMANENT'
          },
          buff: {
            type: EffectActionType.BUFF_STATS,
            target: EffectTarget.SELF,
            value: '+2/+0',
            duration: 'PERMANENT'
          }
        }
      }
    }
  ],
  description: '1/1 con Prisa. Al entrar: Elige sin cambios o +2/+0 pagando 2 de vida',
  flavorText: 'La desesperación es el combustible más puro.'
}

export const BERSERKER_SANGUINARIO: Card = {
  id: 'Berserker_Sanguinario',
  name: 'Berserker Sanguinario',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.VITALIDAD,
  mana: 2,
  attack: 2,
  health: 1,
  abilities: [],
  effects: [
    {
      id: 'Berserker_Descubrir',
      description: 'Al entrar: Elige sin cambios, o +3/+1 pagando 4 de vida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.SELF,
        options: {
          lifeCost: 4,
          base: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+0/+0', duration: 'PERMANENT' },
          buff: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+3/+1', duration: 'END_OF_TURN' }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 4
  },
  description: '2/1. Al entrar: Elige sin cambios, o +3/+1 pagando 4 de vida',
  flavorText: 'La sangre es combustible, la victoria es destino.'
}

export const CAZADOR_DE_RECOMPENSAS: Card = {
  id: 'Cazador_de_Recompensas',
  name: 'Cazador de Recompensas',
  type: CardType.CREATURE,
  rarity: CardRarity.BASIC,
  classType: ClassType.VITALIDAD,
  mana: 2,
  attack: 2,
  health: 2,
  abilities: [],
  effects: [
    {
      id: 'Cazador_Descubrir',
      description: 'Al entrar: Elige sin cambios, o haz 2 de daño pagando 2 de vida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.SELF,
        options: {
          lifeCost: 2,
          base: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+0/+0', duration: 'PERMANENT' },
          buff: { type: EffectActionType.DAMAGE, target: EffectTarget.TARGET_CREATURE, amount: 2, duration: 'PERMANENT' }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 2
  },
  description: '2/2. Al entrar: Elige sin cambios, o haz 2 de daño pagando 2 de vida',
  flavorText: 'El precio se paga en sangre.'
}

export const RITUAL_SANGRIENTO: Card = {
  id: 'Ritual_Sangriento',
  name: 'Ritual Sangriento',
  type: CardType.SPELL,
  rarity: CardRarity.BASIC,
  classType: ClassType.VITALIDAD,
  mana: 2,
  abilities: [],
  effects: [
    {
      id: 'Ritual_Descubrir',
      description: 'Al jugar: Elige 3 de daño al oponente, o 6 de daño pagando 6 de vida',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.FRIENDLY_HERO,
        options: {
          lifeCost: 6,
          base: { type: EffectActionType.DAMAGE, target: EffectTarget.ENEMY_HERO, amount: 3, duration: 'PERMANENT' },
          buff: { type: EffectActionType.DAMAGE, target: EffectTarget.ENEMY_HERO, amount: 6, duration: 'PERMANENT' }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 6
  },
  description: 'Elige: Haz 3 de daño al oponente o 6 de daño pagando 6 de vida',
  flavorText: 'El dolor compartido duele más.'
}

export const GUERRERO_HERIDO: Card = {
  id: 'Guerrero_Herido',
  name: 'Guerrero Herido',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.VITALIDAD,
  mana: 2,
  attack: 2,
  health: 1,
  abilities: [Ability.ROBO_DE_VIDA],
  effects: [
    {
      id: 'Guerrero_Descubrir',
      description: 'Al entrar: Elige sin cambios, o +1/+1 pagando 4 de vida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.SELF,
        options: {
          lifeCost: 4,
          base: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+0/+0', duration: 'PERMANENT' },
          buff: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+1/+1', duration: 'END_OF_TURN' }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 4
  },
  description: '2/1 con Robo de vida. Al entrar: Elige sin cambios, o +1/+1 pagando 4 de vida',
  flavorText: 'La sangre derramada fortalece al guerrero.'
}

export const SENOR_DE_LA_SANGRE: Card = {
  id: 'Senor_de_la_Sangre',
  name: 'Señor de la Sangre',
  type: CardType.CREATURE,
  rarity: CardRarity.RARE,
  classType: ClassType.VITALIDAD,
  mana: 3,
  attack: 2,
  health: 3,
  abilities: [],
  effects: [
    {
      id: 'Senor_Descubrir_Marcha',
      description: 'Al entrar: Elige sin cambios, o todas tus criaturas ganan Prisa este turno pagando 4 de vida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.SELF,
        options: {
          lifeCost: 4,
          base: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+0/+0', duration: 'PERMANENT' },
          buff: { type: EffectActionType.GAIN_ABILITY, target: EffectTarget.ALL_FRIENDLY_CREATURES, value: Ability.PRISA, duration: 'END_OF_TURN' }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 4
  },
  description: '2/3. Al entrar: Elige sin cambios o da Prisa a todas tus criaturas hasta final de turno pagando 4 de vida',
  flavorText: 'Su llamado despierta la furia dormida.'
}

export const PACTO_DE_PODER: Card = {
  id: 'Pacto_de_Poder',
  name: 'Pacto de Poder',
  type: CardType.SPELL,
  rarity: CardRarity.RARE,
  classType: ClassType.VITALIDAD,
  mana: 3,
  abilities: [],
  effects: [
    {
      id: 'Pacto_Descubrir_Summon',
      description: 'Al jugar: Elige invocar 2/2 con Prisa, o 4/4 con Prisa y Robo de vida pagando 5 de vida (muere al final del turno)',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.FRIENDLY_HERO,
        options: {
          lifeCost: 5,
          base: {
            type: EffectActionType.SUMMON_CREATURE,
            target: EffectTarget.FRIENDLY_HERO,
            value: 'TOKEN_2_2_PRISA',
            duration: 'END_OF_TURN'
          },
          buff: {
            type: EffectActionType.SUMMON_CREATURE,
            target: EffectTarget.FRIENDLY_HERO,
            value: 'TOKEN_4_4_PRISA_LIFESTEAL',
            duration: 'END_OF_TURN'
          }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 5
  },
  description: 'Elige: Invoca 2/2 con Prisa o 4/4 con Prisa y Robo de vida pagando 5 de vida (muere al final del turno)',
  flavorText: 'Poder prestado, precio diferido.'
}

export const PACTO_FINAL: Card = {
  id: 'Pacto_Final',
  name: 'Pacto Final',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.VITALIDAD,
  mana: 4,
  abilities: [],
  effects: [
    {
      id: 'PactoFinal_Descubrir',
      description: 'Al jugar: Elige 5 de daño al oponente, o 12 de daño pagando 8 de vida',
      timing: EffectTiming.ON_PLAY,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.FRIENDLY_HERO,
        options: {
          lifeCost: 8,
          base: { type: EffectActionType.DAMAGE, target: EffectTarget.ENEMY_HERO, amount: 5, duration: 'PERMANENT' },
          buff: { type: EffectActionType.DAMAGE, target: EffectTarget.ENEMY_HERO, amount: 12, duration: 'PERMANENT' }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 8
  },
  description: 'Elige: 5 de daño o 12 de daño pagando 8 de vida',
  flavorText: 'Todo o nada. Prefiero todo.'
}

export const FRENESI_FINAL: Card = {
  id: 'Frenesi_Final',
  name: 'Frenesí Final',
  type: CardType.SPELL,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.VITALIDAD,
  mana: 4,
  abilities: [],
  effects: [
    {
      id: 'Frenesi_Play_Restriction',
      description: 'Solo se puede jugar si tienes 10 o menos vida',
      timing: EffectTiming.ON_PLAY,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 10,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.FRIENDLY_HERO,
        options: {
          lifeCost: 6,
          // Base: sin efecto (no-op)
          base: { type: EffectActionType.BUFF_STATS, target: EffectTarget.FRIENDLY_HERO, value: '+0/+0', duration: 'PERMANENT' },
          // Buff: todas tus criaturas “atacan inmediatamente” (flag 999), hasta fin de turno
          buff: { type: EffectActionType.BUFF_ATTACK, target: EffectTarget.ALL_FRIENDLY_CREATURES, amount: 999, duration: 'END_OF_TURN' }
        }
      }
    }
  ],
  classResource: {
    type: 'VIDA',
    amount: 6
  },
  description: 'Solo si tienes 10 o menos vida. Elige: no hacer nada, o todas tus criaturas atacan inmediatamente pagando 6 de vida (no bloqueable).',
  flavorText: 'Cuando todo está perdido, todo vale.'
}

export const AVATAR_DE_LA_DESTRUCCION: Card = {
  id: 'Avatar_de_la_Destruccion',
  name: 'Avatar de la Destrucción',
  type: CardType.CREATURE,
  rarity: CardRarity.LEGENDARY,
  classType: ClassType.VITALIDAD,
  mana: 10,
  attack: 1,
  health: 1,
  abilities: [],
  effects: [
    {
      id: 'Avatar_Descubrir_Poder',
      description: 'Al entrar: Elige sin cambios, o +5/+5 pagando 5 de vida',
      timing: EffectTiming.ON_ENTER,
      action: {
        type: EffectActionType.DISCOVER_PAY_LIFE,
        target: EffectTarget.SELF,
        options: {
          lifeCost: 5,
          base: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+0/+0', duration: 'PERMANENT' },
          buff: { type: EffectActionType.BUFF_STATS, target: EffectTarget.SELF, value: '+5/+5', duration: 'PERMANENT' }
        }
      }
    },
    {
      id: 'Avatar_Double_Strike',
      description: 'Al atacar: Si tienes 5 o menos vida, gana Doble golpe',
      timing: EffectTiming.ON_ATTACK,
      condition: {
        type: 'HEALTH_THRESHOLD',
        value: 5,
        comparison: 'LESS_EQUAL'
      },
      action: {
        type: EffectActionType.GAIN_ABILITY,
        target: EffectTarget.SELF,
        value: 'DOBLE_GOLPE',
        duration: 'END_OF_TURN'
      }
    }
  ],
  description: '1/1. Al entrar: Elige sin cambios o +5/+5 pagando 5 de vida. Al atacar: Si tienes 5 o menos vida, gana Doble golpe',
  flavorText: 'Más cerca de la muerte, más cerca de la perfección.'
}

// Al final del archivo
export const CLASS_CARDS = [
  // Abominación
  ESPECIMEN_PERFECTO,
  ESPECIMEN_PERFECTO_FINAL_STAND,
  ESPECIMEN_PERFECTO_EVOLUCIONADO,
  EXPLORADOR_INFECTADO,
  RECOLECTOR_DE_TEJIDOS,
  NECROFAGO_HAMBRIENTO,
  RITUAL_MENOR,
  ANATOMISTA_EXPERTO,
  INVOCACION_SINIESTRA,
  PERFECCIONISTA_OBSESIVO,
  RITUAL_DE_PERFECCION,
  MAESTRO_NECROMANTICO,
  EVOLUCION_PERFECTA,

  // Caos
  APRENDIZ_ERRATICO,
  MAGO_DEL_CAOS,
  RITUAL_CAOTICO,
  MERCADER_LOCO,
  MANIPULADOR_DEL_DESTINO,
  PORTAL_INESTABLE,
  CAOS_CONTROLADO,
  SENOR_DEL_CAOS,
  TORMENTA_IMPREDECIBLE,
  REALIDAD_FRACTURADA,

  // Ciclo
  EXPLORADOR_CREPUSCULAR,
  RITUAL_DEL_AMANECER,
  VIDENTE_LUNAR,
  CAMBIAFORMAS_LUNAR,
  INVOCADOR_DE_ECLIPSE,
  GUARDIAN_DEL_EQUILIBRIO,
  MOMENTO_PERFECTO,
  MAESTRO_DEL_TIEMPO,
  ECLIPSE_ETERNO,
  CONVERGENCIA_CELESTIAL,

  // Vitalidad
  FANATICO_DESESPERADO,
  BERSERKER_SANGUINARIO,
  CAZADOR_DE_RECOMPENSAS,
  RITUAL_SANGRIENTO,
  GUERRERO_HERIDO,
  SENOR_DE_LA_SANGRE,
  PACTO_DE_PODER,
  PACTO_FINAL,
  FRENESI_FINAL,
  AVATAR_DE_LA_DESTRUCCION,
] as const

export const CLASS_CARDS_BY_ID = Object.fromEntries(
  CLASS_CARDS.map(c => [c.id, c] as const)
)
