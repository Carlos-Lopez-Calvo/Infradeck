/// <reference types="vitest/globals" />
import { describe, test, expect } from 'vitest'
import { createGame, startGame, nextTurn, playCard, declareAttackHero, declareAttackCreature, setCardResolver, GamePhase } from './game-state'
import { Card } from '../types/cards'
import * as Basic from '../cards/basic-cards'
import * as Class from '../cards/class-cards'

const REGISTRY: Record<string, Card> = {}
Object.values({ ...Basic, ...Class }).forEach((v: any) => {
  if (v && typeof v === 'object' && 'id' in v && 'type' in v) REGISTRY[v.id] = v as Card
})
const getCardById = (id: string) => REGISTRY[id]

// registra el resolver ANTES de los tests
setCardResolver(getCardById)

describe('Simulación de partida básica', () => {
  test('flujo multi-turno con cartas reales', () => {
    const s = createGame(
        { id: 'P1', name: 'P1', classType: 'VITALIDAD' as any, deck: [
            'Fanatico_Desesperado','Ritual_Sangriento','Centinela_Vigilante','Escriba_Estudioso','Explorador_Audaz','Reflejo_Rapido'
          ] },
          { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [
            'Centinela_Vigilante','Curandero_Sabio','Ritual_de_Renovacion','Explorador_Audaz','Escriba_Estudioso','Reflejo_Rapido'
          ] },
    )

    startGame(s)
    // Turno P1: juega Fanático (1 mana) y ataca face
    s.players[0].hand = ['Fanatico_Desesperado']
    s.players[0].mana = s.players[0].maxMana = 1
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
    expect(declareAttackHero(s, 0, 0).ok).toBe(true)
    expect(s.players[1].life).toBe(19)

    // Turno P2: roba, juega Curandero (3 mana) – ajustamos mana para el test
    nextTurn(s)
    s.players[1].hand = ['Curandero_Sabio']
    s.players[1].mana = s.players[1].maxMana = 3
    expect(playCard(s, 1, 0, getCardById).ok).toBe(true)
    // End P2: Curandero cura 2
    // End P2: Curandero cura 2 (cap a 20)
nextTurn(s)
expect(s.players[1].life).toBe(20)

    // P1 juega Ritual_Sangriento (2 mana): hace 3 face
    s.players[0].hand = ['Ritual_Sangriento']
    s.players[0].mana = s.players[0].maxMana = 2
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
    expect(s.players[1].life).toBe(17)

    // P1 baja Centinela_Vigilante (4 mana) para Taunt
    s.players[0].hand = ['Centinela_Vigilante']
    s.players[0].mana = s.players[0].maxMana = 4
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)

    // P2 intenta atacar al héroe, pero Taunt lo bloquea → debe atacar criatura con Taunt
    nextTurn(s)
    // P2 juega Explorador_Audaz (1 mana) y no ataca (ejemplo)
    s.players[1].hand = ['Explorador_Audaz']
    s.players[1].mana = s.players[1].maxMana = 1
    expect(playCard(s, 1, 0, getCardById).ok).toBe(true)

    nextTurn(s) // vuelve a P1: ataque sobre Curandero con Fanático o sobre Explorador
    const res = declareAttackCreature(s, 0, 0, 0) // ataca a la primera criatura enemiga (Curandero o Explorador)
    expect(res.ok).toBe(true)

    // Comprobaciones finales básicas
    expect(s.players[0].life).toBeGreaterThan(0)
    expect(s.players[1].life).toBeGreaterThan(0)
  })
})