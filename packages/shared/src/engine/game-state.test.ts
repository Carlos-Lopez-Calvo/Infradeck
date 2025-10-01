/// <reference types="vitest/globals" />
import { describe, test, expect } from 'vitest'
import { 
  GamePhase, createGame, startGame, nextTurn, setPriorityWindow, playCard, declareAttackHero, declareAttackCreature, setCardResolver
} from './game-state'
import { Card } from '../types/cards'
import * as Basic from '../cards/basic-cards'
import * as Class from '../cards/class-cards'

// Registro de cartas del proyecto (básicas + de clase)
const REGISTRY: Record<string, Card> = {}
Object.values({ ...Basic, ...Class }).forEach((v: any) => {
  if (v && typeof v === 'object' && 'id' in v && 'type' in v) REGISTRY[v.id] = v as Card
})
const getCardById = (id: string) => REGISTRY[id]

describe('engine/game-state - turnos y prioridad', () => {
  test('createGame y startGame inicializan mano, mana y fase', () => {
    const s = createGame(
        { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: [
          'Fanatico_Desesperado','Ritual_Sangriento','Centinela_Vigilante',
          'Explorador_Audaz','Escriba_Estudioso'
        ] },
        { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [
          'Fanatico_Desesperado','Ritual_Sangriento','Centinela_Vigilante',
          'Explorador_Audaz','Escriba_Estudioso','Reflejo_Rapido'
        ] },
      )
    startGame(s)
    expect(s.turn.phase).toBe(GamePhase.MAIN)
    expect(s.players[0].mana).toBe(1)
    expect(s.players[0].hand.length).toBe(5)
    expect(s.players[1].hand.length).toBe(6)
  })

  test('ventanas de prioridad en START/MAIN/END', () => {
    const calls: Array<{phase: GamePhase, activePlayer: number}> = []
    setPriorityWindow((state, info) => { calls.push(info) })

    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: ['Fanatico_Desesperado'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: ['Fanatico_Desesperado'] },
    )
    startGame(s)
    expect(calls.some(c => c.phase === GamePhase.MAIN)).toBe(true)
    calls.length = 0

    nextTurn(s) // END + START
    expect(calls.some(c => c.phase === GamePhase.START)).toBe(true)

    // cleanup
    setPriorityWindow(() => {})
  })
})

describe('engine/game-state - jugar cartas y efectos (usando el set real)', () => {
  test('Ritual_Sangriento: ON_PLAY hace 3 de daño al héroe enemigo', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: ['Ritual_Sangriento'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] },
    )
    startGame(s)
    s.players[0].hand = ['Ritual_Sangriento']
    s.players[0].mana = s.players[0].maxMana = 2
    const r = playCard(s, 0, 0, getCardById)
    expect(r.ok).toBe(true)
    expect(s.players[1].life).toBe(17) // 20 - 3
    expect(s.players[0].graveyard[0]).toBe('Ritual_Sangriento')
  })

  test('Fanatico_Desesperado: entra al tablero (Prisa permite atacar)', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'VITALIDAD' as any, deck: ['Fanatico_Desesperado'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] },
    )
    startGame(s)
    s.players[0].hand = ['Fanatico_Desesperado']
    s.players[0].mana = s.players[0].maxMana = 1
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
    expect(s.players[0].board.length).toBe(1)
  })
})

describe('engine/game-state - combate básico con cartas reales', () => {
  test('PRISA (Fanatico_Desesperado) permite atacar al héroe el mismo turno', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'VITALIDAD' as any, deck: ['Fanatico_Desesperado'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] },
    )
    startGame(s)
    s.players[0].hand = ['Fanatico_Desesperado']
    s.players[0].mana = s.players[0].maxMana = 1
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
    const res = declareAttackHero(s, 0, 0)
    expect(res.ok).toBe(true)
    // daño = 1 (ataque base 1)
    expect(s.players[1].life).toBe(19)
  })

  test('TAUNT (Centinela_Vigilante) bloquea ataque al héroe y fuerza objetivo con Taunt', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'VITALIDAD' as any, deck: ['Fanatico_Desesperado'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: ['Centinela_Vigilante'] },
    )
    startGame(s)

    // P1 juega Fanático (1 mana)
    s.players[0].hand = ['Fanatico_Desesperado']
    s.players[0].mana = s.players[0].maxMana = 1
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)

    // Turno P2: juega Centinela_Vigilante (4 mana, Taunt)
    nextTurn(s)
    s.players[1].hand = ['Centinela_Vigilante']
    s.players[1].mana = s.players[1].maxMana = 4
    expect(playCard(s, 1, 0, getCardById).ok).toBe(true)

    // Vuelve a P1: TAUNT enemigo impide atacar al héroe
    nextTurn(s)
    const heroAttack = declareAttackHero(s, 0, 0)
    expect(heroAttack.ok).toBe(false)

    // Puede atacar a la criatura con Taunt (único defensor con Taunt)
    const creatureAttack = declareAttackCreature(s, 0, 0, 0)
    expect(creatureAttack.ok).toBe(true)
  })
})

setCardResolver(getCardById)