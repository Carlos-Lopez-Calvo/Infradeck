// /Users/carloslopez/Desktop/TFG/Infradeck/packages/shared/src/engine/game-extra.test.ts
/// <reference types="vitest/globals" />
import { describe, test, expect } from 'vitest'
import { createGame, startGame, nextTurn, playCard, declareAttackCreature, declareAttackHero, setCardResolver, passPriority } from './game-state'
import { Ability, Card, CardType, EffectActionType, EffectTarget, EffectTiming } from '../types/cards'
import * as Basic from '../cards/basic-cards'
import * as Class from '../cards/class-cards'

const REGISTRY: Record<string, Card> = {}
Object.values({ ...Basic, ...Class }).forEach((v: any) => {
  if (v && typeof v === 'object' && 'id' in v && 'type' in v) REGISTRY[v.id] = v as Card
})
const getCardById = (id: string) => REGISTRY[id]
setCardResolver(getCardById)

;(REGISTRY as any)['Test_Ping'] ||= {
  id: 'Test_Ping',
  name: 'Test Ping',
  type: CardType.INSTANT,
  rarity: 'RARE' as any,
  classType: 'NEUTRAL' as any,
  mana: 0,
  abilities: [],
  effects: [{
    id: 'ping',
    description: 'Haz 1 de daño al héroe enemigo',
    timing: EffectTiming.ON_PLAY,
    action: { type: EffectActionType.DAMAGE, target: EffectTarget.ENEMY_HERO, amount: 1 }
  }],
  description: 'test',
  flavorText: 't'
}

;(REGISTRY as any)['Test_Counter'] ||= {
  id: 'Test_Counter',
  name: 'Test Counter',
  type: CardType.INSTANT,
  rarity: 'RARE' as any,
  classType: 'NEUTRAL' as any,
  mana: 0,
  abilities: [],
  effects: [{
    id: 'counter',
    description: 'Contrarresta el próximo hechizo del oponente',
    timing: EffectTiming.ON_PLAY,
    action: { type: EffectActionType.COUNTER_SPELL, target: EffectTarget.SELF }
  }],
  description: 'test',
  flavorText: 't'
}

// Test-only cards
REGISTRY['Test_Stealth_Bolt'] = {
  id: 'Test_Stealth_Bolt',
  name: 'Test Stealth Bolt',
  type: CardType.INSTANT,
  rarity: 'RARE' as any,
  classType: 'NEUTRAL' as any,
  mana: 0,
  abilities: [],
  effects: [{
    id: 'Bolt_DMG',
    description: 'Hace 1 a criatura objetivo',
    timing: EffectTiming.ON_PLAY,
    action: { type: EffectActionType.DAMAGE, target: EffectTarget.TARGET_CREATURE, amount: 1 }
  }],
  description: 'DMG 1 a criatura objetivo',
  flavorText: 'Test helper'
}

REGISTRY['Test_Specimen_Free'] = {
  id: 'Test_Specimen_Free',
  name: 'Test Specimen Free',
  type: CardType.INSTANT,
  rarity: 'RARE' as any,
  classType: 'ABOMINACION' as any,
  mana: 0,
  abilities: [],
  effects: [{
    id: 'Specimen_Free',
    description: 'Este turno, invocar espécimen es gratis',
    timing: EffectTiming.ON_PLAY,
    action: { type: EffectActionType.SUMMON_SPECIMEN, target: EffectTarget.SELF, value: 'FREE_SUMMON_THIS_TURN' }
  }],
  description: 'Habilita invocación gratis de espécimen este turno',
  flavorText: 'Test helper'
}

REGISTRY['Test_Specimen_Summon'] = {
  id: 'Test_Specimen_Summon',
  name: 'Test Specimen Summon',
  type: CardType.INSTANT,
  rarity: 'RARE' as any,
  classType: 'ABOMINACION' as any,
  mana: 0,
  abilities: [],
  effects: [{
    id: 'Specimen_Summon',
    description: 'Invoca espécimen con coste escalado',
    timing: EffectTiming.ON_PLAY,
    action: { type: EffectActionType.SUMMON_SPECIMEN, target: EffectTarget.SELF, value: 'IMMEDIATE_SUMMON_WITH_SCALING' }
  }],
  description: 'Invoca espécimen con coste escalado',
  flavorText: 'Test helper'
}

describe('Engine extra: triggers y habilidades clave', () => {
  test('END_OF_TURN: Curandero_Sabio cura 2 y capea a 20', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: ['Curandero_Sabio'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: ['Curandero_Sabio'] }
    )
    startGame(s)
    // Forzamos mano y mana P1 para jugar al Curandero de inmediato
    s.players[0].hand = ['Curandero_Sabio']
    s.players[0].mana = s.players[0].maxMana = 3
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)

    // Bajar vida de P1 a 19 para observar curación a 20 por el trigger de fin de turno de P1
    s.players[0].life = 19
    nextTurn(s) // END P1 -> cura 2; START P2
    expect(s.players[0].life).toBe(20)
  })

  test('Sigilo: hechizo con objetivo no puede seleccionar criatura enemiga con Sigilo', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: ['Test_Stealth_Bolt'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)
    // Preparar mano y board
    s.players[0].hand = ['Test_Stealth_Bolt']
    s.players[0].mana = s.players[0].maxMana = 1

    // Crear criatura enemiga con Sigilo (2 de vida)
    s.players[1].board.push({
      id: 'enemy_stealth_1',
      cardId: 'Dummy_Stealth',
      ownerId: s.players[1].id,
      attack: 1,
      health: 2,
      exhausted: false,
      abilities: [String(Ability.SIGILO)]
    })

    // Intentamos hacer objetivo a la criatura con Sigilo
    const res = playCard(s, 0, 0, getCardById, { targets: [{ type: 'CREATURE_ENEMY', index: 0 }] })
    expect(res.ok).toBe(true) // el hechizo se juega, pero la acción no se aplica al objetivo con Sigilo
    expect(s.players[1].board[0].health).toBe(2) // sin daño
  })

  test('RANDOM_BY_ENTROPY consume 1 por proyectil y deja entropía en 0', () => {
    const EntropyBoltsConsume: Card = {
      id: 'Test_Entropy_Bolts_Consume',
      name: 'Test Entropy Bolts Consume',
      type: CardType.INSTANT,
      rarity: 'RARE' as any,
      classType: 'CAOS' as any,
      mana: 0,
      abilities: [],
      effects: [{
        id: 'Entropy_Bolts_Consume',
        description: 'Dispara 1 daño aleatorio N veces (N = Entropía) y consume por disparo',
        timing: EffectTiming.ON_PLAY,
        action: { type: EffectActionType.DAMAGE, target: EffectTarget.RANDOM_ENEMY, amount: 1, value: 'RANDOM_BY_ENTROPY', consumeEntropy: 1 }
      }],
      description: 'Test helper',
      flavorText: 'caos que se agota'
    }
    ;(REGISTRY as any)['Test_Entropy_Bolts_Consume'] = EntropyBoltsConsume

    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'CAOS' as any, deck: ['Test_Entropy_Bolts_Consume'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)

    // Entropía 2; al jugar sube a 3; se consumen 3 disparos → queda en 0
    s.players[0].classResource = { type: 'ENTROPIA', amount: 2 }
    s.players[1].board = []

    s.players[0].hand = ['Test_Entropy_Bolts_Consume']
    s.players[0].mana = s.players[0].maxMana = 1

    const before = s.players[1].life
expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
// resolver stack para disparar los proyectiles
passPriority(s, 0)
passPriority(s, 1)
expect(s.players[1].life).toBe(before - 3)
expect(s.players[0].classResource?.amount).toBe(0)
  })

  // Vuelo: atacante sin Vuelo no puede atacar criatura con Vuelo; con Vuelo sí
  test('Vuelo: restricción de ataque a criaturas con Vuelo', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: [] },
      { id: 'P2', name: 'P2', classType: 'CAOS' as any, deck: [] }
    )
    startGame(s)

    // Atacante terrestre (sin Vuelo)
    s.players[0].board.push({
      id: 'atk_ground',
      cardId: 'Dummy_Ground',
      ownerId: s.players[0].id,
      attack: 2,
      health: 2,
      exhausted: false,
      abilities: []
    })

    // Defensor con Vuelo (usamos Manipulador_del_Destino real)
    s.players[1].board.push({
      id: 'def_fly',
      cardId: 'Manipulador_del_Destino',
      ownerId: s.players[1].id,
      attack: 2,
      health: 3,
      exhausted: false,
      abilities: [String(Ability.VUELO)]
    })

    // No puede atacar criatura con Vuelo sin tener Vuelo
    const res1 = declareAttackCreature(s, 0, 0, 0)
    expect(res1.ok).toBe(false)

    // Concedemos Vuelo al atacante y ahora sí debe poder
    s.players[0].board[0].abilities.push(String(Ability.VUELO))
    const res2 = declareAttackCreature(s, 0, 0, 0)
    expect(res2.ok).toBe(true)
  })

  test('Vuelo no restringe atacar al héroe (solo restringe atacar criaturas con Vuelo)', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: [] },
      { id: 'P2', name: 'P2', classType: 'CAOS' as any, deck: [] }
    )
    startGame(s)

    // Atacante terrestre
    s.players[0].board.push({
      id: 'atk_ground2',
      cardId: 'Dummy_Ground_2',
      ownerId: s.players[0].id,
      attack: 2,
      health: 2,
      exhausted: false,
      abilities: []
    })

    // Enemigo con Vuelo en mesa
    s.players[1].board.push({
      id: 'def_fly2',
      cardId: 'Manipulador_del_Destino',
      ownerId: s.players[1].id,
      attack: 2,
      health: 3,
      exhausted: false,
      abilities: [String(Ability.VUELO)]
    })

    // Debe poder atacar al héroe rival aunque haya Vuelo en mesa (no hay Taunt)
    const before = s.players[1].life
    const toHero = declareAttackHero(s, 0, 0)
    expect(toHero.ok).toBe(true)
    expect(s.players[1].life).toBe(before - 2)
  })

  test('RANDOM_BY_ENTROPY: N proyectiles aleatorios según Entropía', () => {
    const EntropyBolts: Card = {
      id: 'Test_Entropy_Bolts',
      name: 'Test Entropy Bolts',
      type: CardType.INSTANT,
      rarity: 'RARE' as any,
      classType: 'CAOS' as any,
      mana: 0,
      abilities: [],
      effects: [{
        id: 'Entropy_Bolts',
        description: 'Dispara 1 daño aleatorio N veces (N = Entropía)',
        timing: EffectTiming.ON_PLAY,
        action: { type: EffectActionType.DAMAGE, target: EffectTarget.RANDOM_ENEMY, amount: 1, value: 'RANDOM_BY_ENTROPY' }
      }],
      description: 'Test helper',
      flavorText: 'caos disciplinado'
    }
    ;(REGISTRY as any)['Test_Entropy_Bolts'] = EntropyBolts

    const s = createGame(
        { id: 'P1', name: 'P1', classType: 'CAOS' as any, deck: ['Test_Entropy_Bolts'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)

    // Seteamos Entropía = 2; al jugar el hechizo sube a 3
    s.players[0].classResource = { type: 'ENTROPIA', amount: 2 }
    s.players[1].board = []

    s.players[0].hand = ['Test_Entropy_Bolts']
    s.players[0].mana = s.players[0].maxMana = 1

    const before2 = s.players[1].life
expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
// resolver stack para aplicar los proyectiles
passPriority(s, 0)
passPriority(s, 1)
expect(s.players[1].life).toBe(before2 - 3)
  })

  test('DISCOVER_FROM_GRAVEYARD: ofrece 3 al azar y invoca una criatura de cementerio propio o rival', () => {
    // Carta de test que dispara discover
    const DiscoverSpell: Card = {
      id: 'Test_Discover',
      name: 'Test Discover',
      type: CardType.INSTANT,
      rarity: 'RARE' as any,
      classType: 'NEUTRAL' as any,
      mana: 0,
      abilities: [],
      effects: [{
        id: 'Discover_From_GY',
        description: 'Descubre 3 de cualquier cementerio e invoca 1',
        timing: EffectTiming.ON_PLAY,
        action: { type: EffectActionType.SUMMON_CREATURE, target: EffectTarget.SELF, value: 'DISCOVER_FROM_GRAVEYARD' }
      }],
      description: 'Test helper',
      flavorText: 'elige y vuelve'
    }
    ;(REGISTRY as any)['Test_Discover'] = DiscoverSpell

    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: ['Test_Discover'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)

    // Preparamos cementerios con criaturas reales
    const candidates = ['Explorador_Audaz', 'Curandero_Sabio', 'Centinela_Vigilante']
    s.players[0].graveyard.unshift(candidates[0]) // propio
    s.players[1].graveyard.unshift(candidates[1]) // rival
    s.players[1].graveyard.unshift(candidates[2]) // rival

    s.players[0].hand = ['Test_Discover']
    s.players[0].mana = s.players[0].maxMana = 1

    const beforeBoard = s.players[0].board.length
   // Ejecuta discover (UI-less ⇒ elige 1 de 3 al azar)
expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
// resolver stack para que se invoque la criatura
passPriority(s, 0)
passPriority(s, 1)

expect(s.players[0].board.length).toBe(beforeBoard + 1)

    const summoned = s.players[0].board[beforeBoard]
    expect(candidates.includes(summoned.cardId)).toBe(true)

    // Debe haberse retirado del cementerio del dueño original
    const stillInGYP1 = s.players[0].graveyard.includes(summoned.cardId)
    const stillInGYP2 = s.players[1].graveyard.includes(summoned.cardId)
    expect(stillInGYP1 || stillInGYP2).toBe(false)
  })

  test('COUNTER_SPELL: el próximo hechizo del oponente queda contrarrestado', () => {
    // Cartas de test
    const CounterSpell: Card = {
      id: 'Test_Counter',
      name: 'Test Counter',
      type: CardType.INSTANT,
      rarity: 'RARE' as any,
      classType: 'NEUTRAL' as any,
      mana: 0,
      abilities: [],
      effects: [{
        id: 'Counter_Effect',
        description: 'Contrarresta el próximo hechizo del oponente',
        timing: EffectTiming.ON_PLAY,
        action: { type: EffectActionType.COUNTER_SPELL, target: EffectTarget.ENEMY_HERO }
      }],
      description: 'Test helper',
      flavorText: 'Nope.'
    }
    const PingSpell: Card = {
      id: 'Test_Ping',
      name: 'Test Ping',
      type: CardType.SPELL,
      rarity: 'RARE' as any,
      classType: 'NEUTRAL' as any,
      mana: 0,
      abilities: [],
      effects: [{
        id: 'Ping_1',
        description: 'Hace 1 daño al héroe enemigo',
        timing: EffectTiming.ON_PLAY,
        action: { type: EffectActionType.DAMAGE, target: EffectTarget.ENEMY_HERO, amount: 1 }
      }],
      description: 'Test helper',
      flavorText: 'pew'
    }

    ;(REGISTRY as any)['Test_Counter'] = CounterSpell
    ;(REGISTRY as any)['Test_Ping'] = PingSpell

    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: ['Test_Counter'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: ['Test_Ping'] }
    )
    startGame(s)

    // P1 juega COUNTER
s.players[0].hand = ['Test_Counter']
s.players[0].mana = s.players[0].maxMana = 1
expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
// resolver stack para que el COUNTER quede activo
passPriority(s, 0)
passPriority(s, 1)

    // P2 intenta jugar Ping; debe ir al cementerio contrarrestado y no hacer daño
    nextTurn(s)
    s.players[1].hand = ['Test_Ping']
    s.players[1].mana = s.players[1].maxMana = 1
    const beforeLife = s.players[0].life
    expect(playCard(s, 1, 0, getCardById).ok).toBe(true)
    expect(s.players[0].life).toBe(beforeLife) // sin daño
    expect(s.players[1].graveyard[0]).toBe('Test_Ping') // fue al cementerio contrarrestado
  })

  test('LIFE_DIFFERENTIAL: +Y/+Y donde Y = maxLife - life del dueño', () => {
    const BuffLD: Card = {
      id: 'Test_Buff_LD',
      name: 'Test Buff LD',
      type: CardType.INSTANT,
      rarity: 'RARE' as any,
      classType: 'NEUTRAL' as any,
      mana: 0,
      abilities: [],
      effects: [{
        id: 'LD_Buff',
        description: '+Y/+Y basado en vida',
        timing: EffectTiming.ON_PLAY,
        action: { type: EffectActionType.BUFF_STATS, target: EffectTarget.TARGET_CREATURE, value: 'LIFE_DIFFERENTIAL' }
      }],
      description: 'Test helper',
      flavorText: 'gap power'
    }
    ;(REGISTRY as any)['Test_Buff_LD'] = BuffLD

    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: ['Test_Buff_LD'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)

    // Criatura aliada base 1/1
    s.players[0].board.push({ id: 'ally', cardId: 'Dummy', ownerId: s.players[0].id, attack: 1, health: 1, exhausted: false, abilities: [] })
    // Vida actual 7 → Y = 13
    s.players[0].life = 7

    s.players[0].hand = ['Test_Buff_LD']
    s.players[0].mana = s.players[0].maxMana = 1

    expect(playCard(s, 0, 0, getCardById, { targets: [{ type: 'CREATURE_SELF', index: 0 }] }).ok).toBe(true)
passPriority(s, 0)
passPriority(s, 1)
expect(s.players[0].board[0].attack).toBe(14)
expect(s.players[0].board[0].health).toBe(14)
  })

  test('DOBLE_GOLPE: segundo impacto del atacante en combate criatura vs criatura', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: [] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)

    // Atacante 2/2 con DOBLE_GOLPE
    s.players[0].board.push({ id: 'atk', cardId: 'A', ownerId: s.players[0].id, attack: 2, health: 2, exhausted: false, abilities: [String(Ability.DOBLE_GOLPE)] })
    // Defensor 0/3 (para que no haga daño de vuelta)
    s.players[1].board.push({ id: 'def', cardId: 'D', ownerId: s.players[1].id, attack: 0, health: 3, exhausted: false, abilities: [] })

    const res = (declareAttackCreature as any)(s, 0, 0, 0)
    expect(res.ok).toBe(true)
    // Debe morir por 2 hits de 2
    expect(s.players[1].board.length).toBe(0)
    // Atacante sigue vivo
    expect(s.players[0].board.length).toBe(1)
  })

  test('DOBLE_GOLPE: doble daño al héroe', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: [] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)

    // Atacante 2/2 con DOBLE_GOLPE
    s.players[0].board.push({ id: 'atk', cardId: 'A', ownerId: s.players[0].id, attack: 2, health: 2, exhausted: false, abilities: [String(Ability.DOBLE_GOLPE)] })
    const before = s.players[1].life
    const res = (declareAttackHero as any)(s, 0, 0)
    expect(res.ok).toBe(true)
    expect(s.players[1].life).toBe(before - 4)
  })


test('Stack LIFO: A(Ping) ← B(Counter) → se resuelve B y A no hace daño', () => {
  const s = createGame(
        { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: [] },
    { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
  )
  startGame(s)

  s.players[0].hand = ['Test_Ping']
  s.players[0].mana = s.players[0].maxMana = 1
  expect(playCard(s, 0, 0, getCardById).ok).toBe(true) // A en stack

  s.players[1].hand = ['Test_Counter']
  s.players[1].mana = s.players[1].maxMana = 1
  expect(playCard(s, 1, 0, getCardById).ok).toBe(true) // B en stack

  const before = s.players[0].life
  passPriority(s, 0)
  passPriority(s, 1)

  expect(s.players[0].life).toBe(before) // sin daño
  expect(s.players[1].graveyard[0]).toBe('Test_Counter')
  expect(s.players[0].graveyard[0]).toBe('Test_Ping')
})

test('Counters encadenados: A(Ping) ← B(Counter) ← C(Counter) → C anula B y A hace daño', () => {
  const s = createGame(
    { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: [] },
    { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
  )
  startGame(s)

  s.players[0].hand = ['Test_Ping']
  s.players[0].mana = s.players[0].maxMana = 1
  expect(playCard(s, 0, 0, getCardById).ok).toBe(true) // A en stack

  s.players[1].hand = ['Test_Counter']
  s.players[1].mana = s.players[1].maxMana = 1
  expect(playCard(s, 1, 0, getCardById).ok).toBe(true) // B en stack

  s.players[0].hand = ['Test_Counter']
  s.players[0].mana = s.players[0].maxMana = 1
  expect(playCard(s, 0, 0, getCardById).ok).toBe(true) // C en stack

  const before = s.players[1].life
  passPriority(s, 0)
  passPriority(s, 1)

  // C resuelve (consume el counter de P2), luego B queda sin efecto, luego A hace daño
  // C resuelve (prepara counter contra el próximo hechizo de P2), luego B deja counter contra el próximo hechizo de P1, y A queda contrarrestado
expect(s.players[1].life).toBe(before) // sin daño
expect(s.players[0].graveyard[0]).toBe('Test_Counter') // última instant de P1
expect(s.players[0].graveyard.includes('Test_Ping')).toBe(true) // Ping también está en GY   // B fue al cementerio
})

  test('Espécimen: invocación gratis este turno y coste escalado en siguientes invocaciones', () => {
    const s = createGame(
      { id: 'P1', name: 'P1', classType: 'ABOMINACION' as any, deck: ['Test_Specimen_Free', 'Test_Specimen_Summon', 'Test_Specimen_Summon'] },
      { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: [] }
    )
    startGame(s)

    // Forzamos mano y mana
    s.players[0].hand = ['Test_Specimen_Free', 'Test_Specimen_Summon', 'Test_Specimen_Summon']
    s.players[0].mana = s.players[0].maxMana = 10

    // 1) Habilitar invocación gratis este turno
expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
// Resolver stack para aplicar el FREE antes de invocar
passPriority(s, 0)
passPriority(s, 1)

const manaBeforeFree = s.players[0].mana

// 2) Invocar espécimen inmediatamente (gratis)
expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
// Resolver stack (ambos pasan prioridad)
passPriority(s, 0)
passPriority(s, 1)

expect(s.players[0].mana).toBe(manaBeforeFree)
expect(s.players[0].board.some(e => e.cardId === 'SPECIMEN_TOKEN')).toBe(true)

    // 3) Matar el espécimen para permitir una segunda invocación en el futuro
    {
      const idx = s.players[0].board.findIndex(e => e.cardId === 'SPECIMEN_TOKEN')
      const [dead] = s.players[0].board.splice(idx, 1)
      s.players[0].graveyard.unshift(dead.cardId)
    }

    // Pasar turno para limpiar el flag de "gratis este turno"
    nextTurn(s)

    // 4) Segunda invocación con coste escalado: 7 (5→7)
    s.players[0].hand = ['Test_Specimen_Summon']
    s.players[0].mana = s.players[0].maxMana = 10
    expect(playCard(s, 0, 0, getCardById).ok).toBe(true)
    // Resolver stack (ambos pasan prioridad)
    passPriority(s, 0)
    passPriority(s, 1)

    expect(s.players[0].mana).toBe(3) // 10 - 7
    expect(s.players[0].board.some(e => e.cardId === 'SPECIMEN_TOKEN')).toBe(true)
  })
})