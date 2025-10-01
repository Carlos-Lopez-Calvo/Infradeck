/// <reference types="vitest/globals" />
import { describe, test, expect } from 'vitest'
import { validateCard } from '../engine/card-validator'
import { CardType, Ability } from '../types/cards'

// Import all 33 basic cards following documentation
import { 
  // 0 mana
  ULTIMA_OPORTUNIDAD,
  
  // 1 mana  
  MERCENARIO_AGIL, EXPLORADOR_ASTUTO, ASESINO_SILENCIOSO, 
  GUARDIAN_NOVATO, REFLEJO_RAPIDO, CUCHILLA_ENVENENADA, EXPLORADOR_AUDAZ,
  
  // 2 mana
  ESCRIBA_ESTUDIOSO, FLECHA_CERTEZA, DUELISTA_EXPERTO, 
  COMERCIANTE_SAGAZ, DISPARO_CERTERO,
  
  // 3 mana
  BERSERKER_HERIDO, RECARGA_RAPIDA, MOMENTO_CRUCIAL, 
  SOLDADO_VETERANO, INTERCEPCION_RAPIDA, CURANDERO_SABIO,
  
  // 4 mana
  CENTINELA_VIGILANTE, LLAMA_IMPURA, MAESTRO_DE_ARMAS, 
  ACECHADOR_NOCTURNO, PALABRA_DE_PODER,
  
  // 5 mana
  VAMPIRO_ANCESTRAL, COLOSO_DE_HIERRO, INGENIERA_ASTUTA, 
  TORMENTA_DE_ACERO, GOLPE_DEVASTADOR,
  
  // 6 mana
  CAMPEON_CAIDO, SENOR_DE_LA_GUERRA, RITUAL_DE_RENOVACION,
  
  // 7+ mana
  TITAN_PRIMORDIAL, APOCALIPSIS
} from './basic-cards'

describe('Basic Cards - Complete Set (33 cards)', () => {
  
  describe('0 Mana Cards', () => {
    test('Última Oportunidad should be valid', () => {
      expect(validateCard(ULTIMA_OPORTUNIDAD)).toBe(true)
      expect(ULTIMA_OPORTUNIDAD.mana).toBe(0)
      expect(ULTIMA_OPORTUNIDAD.type).toBe(CardType.INSTANT)
    })
  })

  describe('1 Mana Cards (7)', () => {  // ← 7, no 6
    const oneManaCards = [
      MERCENARIO_AGIL, EXPLORADOR_ASTUTO, ASESINO_SILENCIOSO, 
      GUARDIAN_NOVATO, REFLEJO_RAPIDO, CUCHILLA_ENVENENADA, EXPLORADOR_AUDAZ
    ]
    
    test('all 1-mana cards should be valid', () => {
      oneManaCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.mana).toBe(1)
      })
    })
    
    test('should have exactly 7 cards', () => {  // ← 7, no 6
      expect(oneManaCards.length).toBe(7)
    })
  })

  describe('2 Mana Cards (5)', () => {
    const twoManaCards = [
      ESCRIBA_ESTUDIOSO, FLECHA_CERTEZA, DUELISTA_EXPERTO, 
      COMERCIANTE_SAGAZ, DISPARO_CERTERO
    ]
    
    test('all 2-mana cards should be valid', () => {
      twoManaCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.mana).toBe(2)
      })
    })
    
    test('should have exactly 5 cards', () => {
      expect(twoManaCards.length).toBe(5)
    })
  })

  describe('3 Mana Cards (6)', () => {
    const threeManaCards = [
      BERSERKER_HERIDO, RECARGA_RAPIDA, MOMENTO_CRUCIAL, 
      SOLDADO_VETERANO, INTERCEPCION_RAPIDA, CURANDERO_SABIO
    ]
    
    test('all 3-mana cards should be valid', () => {
      threeManaCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.mana).toBe(3)
      })
    })
    
    test('should have exactly 6 cards', () => {
      expect(threeManaCards.length).toBe(6)
    })
  })

  describe('4 Mana Cards (5)', () => {
    const fourManaCards = [
      CENTINELA_VIGILANTE, LLAMA_IMPURA, MAESTRO_DE_ARMAS, 
      ACECHADOR_NOCTURNO, PALABRA_DE_PODER
    ]
    
    test('all 4-mana cards should be valid', () => {
      fourManaCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.mana).toBe(4)
      })
    })
    
    test('should have exactly 5 cards', () => {
      expect(fourManaCards.length).toBe(5)
    })
  })

  describe('5 Mana Cards (5)', () => {
    const fiveManaCards = [
      VAMPIRO_ANCESTRAL, COLOSO_DE_HIERRO, INGENIERA_ASTUTA, 
      TORMENTA_DE_ACERO, GOLPE_DEVASTADOR
    ]
    
    test('all 5-mana cards should be valid', () => {
      fiveManaCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.mana).toBe(5)
      })
    })
    
    test('should have exactly 5 cards', () => {
      expect(fiveManaCards.length).toBe(5)
    })
  })

  describe('6 Mana Cards (3)', () => {
    const sixManaCards = [
      CAMPEON_CAIDO, SENOR_DE_LA_GUERRA, RITUAL_DE_RENOVACION
    ]
    
    test('all 6-mana cards should be valid', () => {
      sixManaCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.mana).toBe(6)
      })
    })
    
    test('should have exactly 3 cards', () => {
      expect(sixManaCards.length).toBe(3)
    })
  })

  describe('7+ Mana Cards (2)', () => {
    const highManaCards = [TITAN_PRIMORDIAL, APOCALIPSIS]
    
    test('all high-mana cards should be valid', () => {
      highManaCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
        expect(card.mana).toBeGreaterThanOrEqual(7)
      })
    })
    
    test('should have exactly 2 cards', () => {
      expect(highManaCards.length).toBe(2)
    })
  })

  describe('Complete Set Verification', () => {
    const allBasicCards = [
      // 0 mana
      ULTIMA_OPORTUNIDAD,
      // 1 mana  
      MERCENARIO_AGIL, EXPLORADOR_ASTUTO, ASESINO_SILENCIOSO, 
      GUARDIAN_NOVATO, REFLEJO_RAPIDO, CUCHILLA_ENVENENADA, EXPLORADOR_AUDAZ,
      // 2 mana
      ESCRIBA_ESTUDIOSO, FLECHA_CERTEZA, DUELISTA_EXPERTO, 
      COMERCIANTE_SAGAZ, DISPARO_CERTERO,
      // 3 mana
      BERSERKER_HERIDO, RECARGA_RAPIDA, MOMENTO_CRUCIAL, 
      SOLDADO_VETERANO, INTERCEPCION_RAPIDA, CURANDERO_SABIO,
      // 4 mana
      CENTINELA_VIGILANTE, LLAMA_IMPURA, MAESTRO_DE_ARMAS, 
      ACECHADOR_NOCTURNO, PALABRA_DE_PODER,
      // 5 mana
      VAMPIRO_ANCESTRAL, COLOSO_DE_HIERRO, INGENIERA_ASTUTA, 
      TORMENTA_DE_ACERO, GOLPE_DEVASTADOR,
      // 6 mana
      CAMPEON_CAIDO, SENOR_DE_LA_GUERRA, RITUAL_DE_RENOVACION,
      // 7+ mana
      TITAN_PRIMORDIAL, APOCALIPSIS
    ]
    
    test('should have exactly 34 basic cards total', () => {  // ← 34, no 33
      expect(allBasicCards.length).toBe(34)
    })
    
    test('all cards should be valid', () => {
      allBasicCards.forEach(card => {
        expect(validateCard(card)).toBe(true)
      })
    })
    
    test('mana curve should match documentation', () => {
      const manaCounts = [0,0,0,0,0,0,0,0,0,0,0] // 0-10 mana
      
      allBasicCards.forEach(card => {
        manaCounts[card.mana]++
      })
      
      expect(manaCounts[0]).toBe(1)  // 0 mana: 1 card
      expect(manaCounts[1]).toBe(7)  // 1 mana: 7 cards ← CORREGIDO  
      expect(manaCounts[2]).toBe(5)  // 2 mana: 5 cards
      expect(manaCounts[3]).toBe(6)  // 3 mana: 6 cards
      expect(manaCounts[4]).toBe(5)  // 4 mana: 5 cards
      expect(manaCounts[5]).toBe(5)  // 5 mana: 5 cards
      expect(manaCounts[6]).toBe(3)  // 6 mana: 3 cards
      expect(manaCounts[7]).toBe(1)  // 7 mana: 1 card
      expect(manaCounts[8]).toBe(1)  // 8 mana: 1 card
    })
  })

  describe('Abilities Coverage', () => {
    test('should use all 9 official abilities', () => {
      const allBasicCards = [
        ULTIMA_OPORTUNIDAD, MERCENARIO_AGIL, EXPLORADOR_ASTUTO, ASESINO_SILENCIOSO, 
        GUARDIAN_NOVATO, REFLEJO_RAPIDO, CUCHILLA_ENVENENADA, EXPLORADOR_AUDAZ,
        ESCRIBA_ESTUDIOSO, FLECHA_CERTEZA, DUELISTA_EXPERTO, 
        COMERCIANTE_SAGAZ, DISPARO_CERTERO, BERSERKER_HERIDO, RECARGA_RAPIDA, MOMENTO_CRUCIAL, 
        SOLDADO_VETERANO, INTERCEPCION_RAPIDA, CURANDERO_SABIO, CENTINELA_VIGILANTE, LLAMA_IMPURA, MAESTRO_DE_ARMAS, 
        ACECHADOR_NOCTURNO, PALABRA_DE_PODER, VAMPIRO_ANCESTRAL, COLOSO_DE_HIERRO, INGENIERA_ASTUTA, 
        TORMENTA_DE_ACERO, GOLPE_DEVASTADOR, CAMPEON_CAIDO, SENOR_DE_LA_GUERRA, RITUAL_DE_RENOVACION,
        TITAN_PRIMORDIAL, APOCALIPSIS
      ]

      const usedAbilities = new Set()
      allBasicCards.forEach(card => {
        card.abilities?.forEach(ability => {
          usedAbilities.add(ability)
        })
      })

      // Check we use all 9 official abilities
      expect(usedAbilities.has(Ability.PRISA)).toBe(true)
      expect(usedAbilities.has(Ability.SIGILO)).toBe(true)  
      expect(usedAbilities.has(Ability.TAUNT)).toBe(true)
      expect(usedAbilities.has(Ability.VUELO)).toBe(true)
      expect(usedAbilities.has(Ability.VENENO)).toBe(true)
      expect(usedAbilities.has(Ability.ESCUDO)).toBe(true)
      expect(usedAbilities.has(Ability.REGENERACION)).toBe(true)
      expect(usedAbilities.has(Ability.ROBO_DE_VIDA)).toBe(true)
      expect(usedAbilities.has(Ability.IMPACIENTE)).toBe(true)
    })
  })
})