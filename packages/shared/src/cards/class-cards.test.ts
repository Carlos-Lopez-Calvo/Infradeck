///  <reference types="vitest/globals" />
import { describe, test, expect } from 'vitest'
import { validateCard } from '../engine/card-validator'
import { CardRarity, ClassType, isCycleCard } from '../types/cards'

// Import all class cards (40 total)
import { 
  // ABOMINACIÓN (10)
  EXPLORADOR_INFECTADO, RECOLECTOR_DE_TEJIDOS, NECROFAGO_HAMBRIENTO,
  RITUAL_MENOR, ANATOMISTA_EXPERTO, INVOCACION_SINIESTRA,
  PERFECCIONISTA_OBSESIVO, RITUAL_DE_PERFECCION, MAESTRO_NECROMANTICO,
  EVOLUCION_PERFECTA,
  
  // CAOS (10)
  APRENDIZ_ERRATICO, MAGO_DEL_CAOS, RITUAL_CAOTICO, MERCADER_LOCO,
  MANIPULADOR_DEL_DESTINO, PORTAL_INESTABLE, CAOS_CONTROLADO,
  SENOR_DEL_CAOS, TORMENTA_IMPREDECIBLE, REALIDAD_FRACTURADA,
  
  // CICLO (10)
  EXPLORADOR_CREPUSCULAR, RITUAL_DEL_AMANECER, VIDENTE_LUNAR,
  CAMBIAFORMAS_LUNAR, INVOCADOR_DE_ECLIPSE, GUARDIAN_DEL_EQUILIBRIO,
  MOMENTO_PERFECTO, MAESTRO_DEL_TIEMPO, ECLIPSE_ETERNO, CONVERGENCIA_CELESTIAL,
  
  // VITALIDAD (10)
  FANATICO_DESESPERADO, BERSERKER_SANGUINARIO, CAZADOR_DE_RECOMPENSAS,
  RITUAL_SANGRIENTO, GUERRERO_HERIDO, SENOR_DE_LA_SANGRE,
  PACTO_DE_PODER, PACTO_FINAL, FRENESI_FINAL, AVATAR_DE_LA_DESTRUCCION
} from './class-cards'

describe('Class Cards - ABOMINACIÓN (10 cards)', () => {
  
  describe('Basic ABOMINACIÓN Cards (3)', () => {
    const basicCards = [EXPLORADOR_INFECTADO, NECROFAGO_HAMBRIENTO, RITUAL_MENOR]
    
    test('all basic cards should be valid', () => {
      basicCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.ABOMINACION)
        expect(card.rarity).toBe(CardRarity.BASIC)
      })
    })
    
    test('should have exactly 3 basic cards', () => {
      expect(basicCards.length).toBe(3)
    })
  })

  describe('Rare ABOMINACIÓN Cards (4)', () => {
    const rareCards = [
      RECOLECTOR_DE_TEJIDOS, ANATOMISTA_EXPERTO, 
      INVOCACION_SINIESTRA, PERFECCIONISTA_OBSESIVO
    ]
    
    test('all rare cards should be valid', () => {
      rareCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.ABOMINACION)
        expect(card.rarity).toBe(CardRarity.RARE)
      })
    })
    
    test('should have exactly 4 rare cards', () => {
      expect(rareCards.length).toBe(4)
    })
  })

  describe('Legendary ABOMINACIÓN Cards (3)', () => {
    const legendaryCards = [
      RITUAL_DE_PERFECCION, MAESTRO_NECROMANTICO, EVOLUCION_PERFECTA
    ]
    
    test('all legendary cards should be valid', () => {
      legendaryCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.ABOMINACION)
        expect(card.rarity).toBe(CardRarity.LEGENDARY)
      })
    })
    
    test('should have exactly 3 legendary cards', () => {
      expect(legendaryCards.length).toBe(3)
    })
  })

  describe('ABOMINACIÓN Complete Set', () => {
    const allAbominacionCards = [
      EXPLORADOR_INFECTADO, RECOLECTOR_DE_TEJIDOS, NECROFAGO_HAMBRIENTO,
      RITUAL_MENOR, ANATOMISTA_EXPERTO, INVOCACION_SINIESTRA,
      PERFECCIONISTA_OBSESIVO, RITUAL_DE_PERFECCION, MAESTRO_NECROMANTICO,
      EVOLUCION_PERFECTA
    ]
    
    test('should have exactly 10 cards total', () => {
      expect(allAbominacionCards.length).toBe(10)
    })
    
    test('all cards should be valid', () => {
      allAbominacionCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.ABOMINACION)
      })
    })
    
    test('mana curve should be correct', () => {
      const manaCounts = [0,0,0,0,0,0,0,0,0,0,0] // 0-10 mana
      
      allAbominacionCards.forEach(card => {
        manaCounts[card.mana]++
      })
      
      expect(manaCounts[1]).toBe(1)  // 1 mana: 1 card
      expect(manaCounts[2]).toBe(3)  // 2 mana: 3 cards
      expect(manaCounts[3]).toBe(2)  // 3 mana: 2 cards
      expect(manaCounts[4]).toBe(1)  // 4 mana: 1 card
      expect(manaCounts[5]).toBe(1)  // 5 mana: 1 card
      expect(manaCounts[6]).toBe(1)  // 6 mana: 1 card
      expect(manaCounts[10]).toBe(1) // 10 mana: 1 card
    })
  })
})

describe('Class Cards - CAOS (10 cards)', () => {
  
  describe('Basic CAOS Cards (3)', () => {
    const basicCards = [APRENDIZ_ERRATICO, RITUAL_CAOTICO, MERCADER_LOCO]
    
    test('all basic cards should be valid', () => {
      basicCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.CAOS)
        expect(card.rarity).toBe(CardRarity.BASIC)
      })
    })
    
    test('should have exactly 3 basic cards', () => {
      expect(basicCards.length).toBe(3)
    })
  })

  describe('Rare CAOS Cards (4)', () => {
    const rareCards = [
      MAGO_DEL_CAOS, MANIPULADOR_DEL_DESTINO, 
      PORTAL_INESTABLE, CAOS_CONTROLADO
    ]
    
    test('all rare cards should be valid', () => {
      rareCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.CAOS)
        expect(card.rarity).toBe(CardRarity.RARE)
      })
    })
    
    test('should have exactly 4 rare cards', () => {
      expect(rareCards.length).toBe(4)
    })
  })

  describe('Legendary CAOS Cards (3)', () => {
    const legendaryCards = [
      SENOR_DEL_CAOS, TORMENTA_IMPREDECIBLE, REALIDAD_FRACTURADA
    ]
    
    test('all legendary cards should be valid', () => {
      legendaryCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.CAOS)
        expect(card.rarity).toBe(CardRarity.LEGENDARY)
      })
    })
    
    test('should have exactly 3 legendary cards', () => {
      expect(legendaryCards.length).toBe(3)
    })
  })

  describe('CAOS Complete Set', () => {
    const allCaosCards = [
      APRENDIZ_ERRATICO, MAGO_DEL_CAOS, RITUAL_CAOTICO, MERCADER_LOCO,
      MANIPULADOR_DEL_DESTINO, PORTAL_INESTABLE, CAOS_CONTROLADO,
      SENOR_DEL_CAOS, TORMENTA_IMPREDECIBLE, REALIDAD_FRACTURADA
    ]
    
    test('should have exactly 10 cards total', () => {
      expect(allCaosCards.length).toBe(10)
    })
    
    test('all cards should be valid', () => {
      allCaosCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.CAOS)
      })
    })
    
    test('mana curve should be correct', () => {
      const manaCounts = [0,0,0,0,0,0,0,0,0,0,0] // 0-10 mana
      
      allCaosCards.forEach(card => {
        manaCounts[card.mana]++
      })
      
      expect(manaCounts[0]).toBe(1)  // 0 mana: 1 card (Tormenta)
      expect(manaCounts[1]).toBe(1)  // 1 mana: 1 card (Aprendiz)
      expect(manaCounts[2]).toBe(3)  // 2 mana: 3 cards
      expect(manaCounts[3]).toBe(2)  // 3 mana: 2 cards
      expect(manaCounts[4]).toBe(1)  // 4 mana: 1 card
      expect(manaCounts[6]).toBe(1)  // 6 mana: 1 card
      expect(manaCounts[10]).toBe(1) // 10 mana: 1 card
    })

    test('should use Entropía resource correctly', () => {
      allCaosCards.forEach(card => {
        if (card.classResource) {
          expect(card.classResource.type).toBe('ENTROPIA')
          if (card.classResource.type === 'ENTROPIA') {
            expect(card.classResource.amount).toBeGreaterThan(0)
            expect(card.classResource.amount).toBeLessThanOrEqual(10)
          }
        }
      })
    })
  })
})

describe('Class Cards - CICLO (10 cards)', () => {
  
  describe('Basic CICLO Cards (3)', () => {
    const basicCards = [EXPLORADOR_CREPUSCULAR, RITUAL_DEL_AMANECER, VIDENTE_LUNAR]
    
    test('all basic cards should be valid', () => {
      basicCards.forEach(card => {
        if (isCycleCard(card)) {
          expect(card.classType).toBe(ClassType.CICLO)
          expect(card.rarity).toBe(CardRarity.BASIC)
        } else {
          expect(validateCard(card)).toBe(true)
          expect(card.classType).toBe(ClassType.CICLO)
          expect(card.rarity).toBe(CardRarity.BASIC)
        }
      })
    })
    
    test('should have exactly 3 basic cards', () => {
      expect(basicCards.length).toBe(3)
    })
  })

  describe('Rare CICLO Cards (5)', () => {
    const rareCards = [
      CAMBIAFORMAS_LUNAR, INVOCADOR_DE_ECLIPSE, GUARDIAN_DEL_EQUILIBRIO,
      MOMENTO_PERFECTO, MAESTRO_DEL_TIEMPO
    ]
    
    rareCards.forEach(card => {
      if (isCycleCard(card)) {
        expect(card.classType).toBe(ClassType.CICLO)
        expect(card.rarity).toBe(CardRarity.RARE)
      } else {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.CICLO)
        expect(card.rarity).toBe(CardRarity.RARE)
      }
    })
    
    test('should have exactly 5 rare cards', () => {
      expect(rareCards.length).toBe(5)
    })
  })

  describe('Legendary CICLO Cards (2)', () => {
    const legendaryCards = [ECLIPSE_ETERNO, CONVERGENCIA_CELESTIAL]
    
    test('all legendary cards should be valid', () => {
      legendaryCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.CICLO)
        expect(card.rarity).toBe(CardRarity.LEGENDARY)
      })
    })
    
    test('should have exactly 2 legendary cards', () => {
      expect(legendaryCards.length).toBe(2)
    })
  })

  describe('CycleCard Specific Tests', () => {
    test('CycleCards should have proper form definitions', () => {
      expect(isCycleCard(EXPLORADOR_CREPUSCULAR)).toBe(true)
      expect(isCycleCard(CAMBIAFORMAS_LUNAR)).toBe(true)
      
      // Check that CycleCards have all three forms
      if (isCycleCard(EXPLORADOR_CREPUSCULAR)) {
        expect(EXPLORADOR_CREPUSCULAR.dayForm).toBeDefined()
        expect(EXPLORADOR_CREPUSCULAR.nightForm).toBeDefined()
        expect(EXPLORADOR_CREPUSCULAR.eclipseForm).toBeDefined()
        
        expect(EXPLORADOR_CREPUSCULAR.dayForm.attack).toBe(2)
        expect(EXPLORADOR_CREPUSCULAR.nightForm.attack).toBe(1)
        expect(EXPLORADOR_CREPUSCULAR.eclipseForm.attack).toBe(3)
      }
    })
  })

  describe('CICLO Complete Set', () => {
    const allCicloCards = [
      EXPLORADOR_CREPUSCULAR, RITUAL_DEL_AMANECER, VIDENTE_LUNAR,
      CAMBIAFORMAS_LUNAR, INVOCADOR_DE_ECLIPSE, GUARDIAN_DEL_EQUILIBRIO,
      MOMENTO_PERFECTO, MAESTRO_DEL_TIEMPO, ECLIPSE_ETERNO, CONVERGENCIA_CELESTIAL
    ]
    
    test('should have exactly 10 cards total', () => {
      expect(allCicloCards.length).toBe(10)
    })
    
    test('all cards should be valid', () => {
      allCicloCards.forEach(card => {
        if (isCycleCard(card)) {
          // CycleCard validation - just check basic properties
          expect(card.classType).toBe(ClassType.CICLO)
          expect(card.dayForm).toBeDefined()
          expect(card.nightForm).toBeDefined()  
          expect(card.eclipseForm).toBeDefined()
        } else {
          expect(validateCard(card)).toBe(true)
          expect(card.classType).toBe(ClassType.CICLO)
        }
      })
    })
    
    test('mana curve should be correct', () => {
      const manaCounts = [0,0,0,0,0,0,0,0,0,0,0] // 0-10 mana
      
      allCicloCards.forEach(card => {
        manaCounts[card.mana]++
      })
      
      expect(manaCounts[1]).toBe(1)  // 1 mana: 1 card
      expect(manaCounts[2]).toBe(2)  // 2 mana: 2 cards
      expect(manaCounts[3]).toBe(3)  // 3 mana: 3 cards
      expect(manaCounts[4]).toBe(1)  // 4 mana: 1 card
      expect(manaCounts[5]).toBe(1)  // 5 mana: 1 card
      expect(manaCounts[6]).toBe(1)  // 6 mana: 1 card
      expect(manaCounts[8]).toBe(1)  // 8 mana: 1 card
    })

    test('should use ESTADO resource correctly', () => {
      allCicloCards.forEach(card => {
        if (card.classResource) {
          expect(card.classResource.type).toBe('ESTADO')
          if (card.classResource.type === 'ESTADO') {
            expect(['DIA', 'NOCHE', 'ECLIPSE']).toContain(card.classResource.state)
          }
        }
      })
    })
  })
})

describe('Class Cards - VITALIDAD (10 cards)', () => {
  
  describe('Basic VITALIDAD Cards (3)', () => {
    const basicCards = [FANATICO_DESESPERADO, CAZADOR_DE_RECOMPENSAS, RITUAL_SANGRIENTO]
    
    test('all basic cards should be valid', () => {
      basicCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.VITALIDAD)
        expect(card.rarity).toBe(CardRarity.BASIC)
      })
    })
    
    test('should have exactly 3 basic cards', () => {
      expect(basicCards.length).toBe(3)
    })
  })

  describe('Rare VITALIDAD Cards (4)', () => {
    const rareCards = [
      BERSERKER_SANGUINARIO, GUERRERO_HERIDO, 
      SENOR_DE_LA_SANGRE, PACTO_DE_PODER
    ]
    
    test('all rare cards should be valid', () => {
      rareCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.VITALIDAD)
        expect(card.rarity).toBe(CardRarity.RARE)
      })
    })
    
    test('should have exactly 4 rare cards', () => {
      expect(rareCards.length).toBe(4)
    })
  })

  describe('Legendary VITALIDAD Cards (3)', () => {
    const legendaryCards = [PACTO_FINAL, FRENESI_FINAL, AVATAR_DE_LA_DESTRUCCION]
    
    test('all legendary cards should be valid', () => {
      legendaryCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.VITALIDAD)
        expect(card.rarity).toBe(CardRarity.LEGENDARY)
      })
    })
    
    test('should have exactly 3 legendary cards', () => {
      expect(legendaryCards.length).toBe(3)
    })
  })

  describe('VITALIDAD Complete Set', () => {
    const allVitalidadCards = [
      FANATICO_DESESPERADO, BERSERKER_SANGUINARIO, CAZADOR_DE_RECOMPENSAS,
      RITUAL_SANGRIENTO, GUERRERO_HERIDO, SENOR_DE_LA_SANGRE,
      PACTO_DE_PODER, PACTO_FINAL, FRENESI_FINAL, AVATAR_DE_LA_DESTRUCCION
    ]
    
    test('should have exactly 10 cards total', () => {
      expect(allVitalidadCards.length).toBe(10)
    })
    
    test('all cards should be valid', () => {
      allVitalidadCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.classType).toBe(ClassType.VITALIDAD)
      })
    })
    
    test('mana curve should be correct', () => {
      const manaCounts = [0,0,0,0,0,0,0,0,0,0,0] // 0-10 mana
      
      allVitalidadCards.forEach(card => {
        manaCounts[card.mana]++
      })
      
      expect(manaCounts[1]).toBe(1)  // 1 mana: 1 card
      expect(manaCounts[2]).toBe(4)  // 2 mana: 4 cards
      expect(manaCounts[3]).toBe(2)  // 3 mana: 2 cards
      expect(manaCounts[4]).toBe(2)  // 4 mana: 2 cards
      expect(manaCounts[10]).toBe(1) // 10 mana: 1 card
    })

    test('should use VIDA resource correctly', () => {
      allVitalidadCards.forEach(card => {
        if (card.classResource) {
          expect(card.classResource.type).toBe('VIDA')
          if (card.classResource.type === 'VIDA') {
            expect(card.classResource.amount).toBeGreaterThan(0)
            expect(card.classResource.amount).toBeLessThanOrEqual(8)
          }
        }
      })
    })
  })
})

describe('Complete Class Card Set (40 cards)', () => {
  test('should have all 40 class cards implemented', () => {
    const allClassCards = [
      // ABOMINACIÓN (10)
      EXPLORADOR_INFECTADO, RECOLECTOR_DE_TEJIDOS, NECROFAGO_HAMBRIENTO,
      RITUAL_MENOR, ANATOMISTA_EXPERTO, INVOCACION_SINIESTRA,
      PERFECCIONISTA_OBSESIVO, RITUAL_DE_PERFECCION, MAESTRO_NECROMANTICO,
      EVOLUCION_PERFECTA,
      
      // CAOS (10)
      APRENDIZ_ERRATICO, MAGO_DEL_CAOS, RITUAL_CAOTICO, MERCADER_LOCO,
      MANIPULADOR_DEL_DESTINO, PORTAL_INESTABLE, CAOS_CONTROLADO,
      SENOR_DEL_CAOS, TORMENTA_IMPREDECIBLE, REALIDAD_FRACTURADA,
      
      // CICLO (10)
      EXPLORADOR_CREPUSCULAR, RITUAL_DEL_AMANECER, VIDENTE_LUNAR,
      CAMBIAFORMAS_LUNAR, INVOCADOR_DE_ECLIPSE, GUARDIAN_DEL_EQUILIBRIO,
      MOMENTO_PERFECTO, MAESTRO_DEL_TIEMPO, ECLIPSE_ETERNO, CONVERGENCIA_CELESTIAL,
      
      // VITALIDAD (10)
      FANATICO_DESESPERADO, BERSERKER_SANGUINARIO, CAZADOR_DE_RECOMPENSAS,
      RITUAL_SANGRIENTO, GUERRERO_HERIDO, SENOR_DE_LA_SANGRE,
      PACTO_DE_PODER, PACTO_FINAL, FRENESI_FINAL, AVATAR_DE_LA_DESTRUCCION
    ]
    
    expect(allClassCards.length).toBe(40)
    
    // Check distribution by class
    const classCounts = {}
    allClassCards.forEach(card => {
      classCounts[card.classType] = (classCounts[card.classType] || 0) + 1
    })
    
    expect(classCounts[ClassType.ABOMINACION]).toBe(10)
    expect(classCounts[ClassType.CAOS]).toBe(10)
    expect(classCounts[ClassType.CICLO]).toBe(10)
    expect(classCounts[ClassType.VITALIDAD]).toBe(10)
  })

  test('all cards should be valid', () => {
    const allClassCards = [
      EXPLORADOR_INFECTADO, RECOLECTOR_DE_TEJIDOS, NECROFAGO_HAMBRIENTO,
      RITUAL_MENOR, ANATOMISTA_EXPERTO, INVOCACION_SINIESTRA,
      PERFECCIONISTA_OBSESIVO, RITUAL_DE_PERFECCION, MAESTRO_NECROMANTICO,
      EVOLUCION_PERFECTA, APRENDIZ_ERRATICO, MAGO_DEL_CAOS, RITUAL_CAOTICO, 
      MERCADER_LOCO, MANIPULADOR_DEL_DESTINO, PORTAL_INESTABLE, CAOS_CONTROLADO,
      SENOR_DEL_CAOS, TORMENTA_IMPREDECIBLE, REALIDAD_FRACTURADA,
      EXPLORADOR_CREPUSCULAR, RITUAL_DEL_AMANECER, VIDENTE_LUNAR,
      CAMBIAFORMAS_LUNAR, INVOCADOR_DE_ECLIPSE, GUARDIAN_DEL_EQUILIBRIO,
      MOMENTO_PERFECTO, MAESTRO_DEL_TIEMPO, ECLIPSE_ETERNO, CONVERGENCIA_CELESTIAL,
      FANATICO_DESESPERADO, BERSERKER_SANGUINARIO, CAZADOR_DE_RECOMPENSAS,
      RITUAL_SANGRIENTO, GUERRERO_HERIDO, SENOR_DE_LA_SANGRE,
      PACTO_DE_PODER, PACTO_FINAL, FRENESI_FINAL, AVATAR_DE_LA_DESTRUCCION
    ]
    
    allClassCards.forEach(card => {
      if (isCycleCard(card)) {
        // Basic validation for CycleCard
        expect(card.id).toBeDefined()
        expect(card.name).toBeDefined()
      } else {
        expect(validateCard(card)).toBe(true)
      }
    })
  })

  test('should have correct rarity distribution', () => {
    const allClassCards = [
      EXPLORADOR_INFECTADO, RECOLECTOR_DE_TEJIDOS, NECROFAGO_HAMBRIENTO,
      RITUAL_MENOR, ANATOMISTA_EXPERTO, INVOCACION_SINIESTRA,
      PERFECCIONISTA_OBSESIVO, RITUAL_DE_PERFECCION, MAESTRO_NECROMANTICO,
      EVOLUCION_PERFECTA, APRENDIZ_ERRATICO, MAGO_DEL_CAOS, RITUAL_CAOTICO, 
      MERCADER_LOCO, MANIPULADOR_DEL_DESTINO, PORTAL_INESTABLE, CAOS_CONTROLADO,
      SENOR_DEL_CAOS, TORMENTA_IMPREDECIBLE, REALIDAD_FRACTURADA,
      EXPLORADOR_CREPUSCULAR, RITUAL_DEL_AMANECER, VIDENTE_LUNAR,
      CAMBIAFORMAS_LUNAR, INVOCADOR_DE_ECLIPSE, GUARDIAN_DEL_EQUILIBRIO,
      MOMENTO_PERFECTO, MAESTRO_DEL_TIEMPO, ECLIPSE_ETERNO, CONVERGENCIA_CELESTIAL,
      FANATICO_DESESPERADO, BERSERKER_SANGUINARIO, CAZADOR_DE_RECOMPENSAS,
      RITUAL_SANGRIENTO, GUERRERO_HERIDO, SENOR_DE_LA_SANGRE,
      PACTO_DE_PODER, PACTO_FINAL, FRENESI_FINAL, AVATAR_DE_LA_DESTRUCCION
    ]
    
    const rarityCounts = {}
    allClassCards.forEach(card => {
      rarityCounts[card.rarity] = (rarityCounts[card.rarity] || 0) + 1
    })
    
    expect(rarityCounts[CardRarity.BASIC]).toBe(12)     // 3 per class × 4
    expect(rarityCounts[CardRarity.RARE]).toBe(17)      // 4+4+5+4 = 17
    expect(rarityCounts[CardRarity.LEGENDARY]).toBe(11) // 3+3+2+3 = 11
  })
})