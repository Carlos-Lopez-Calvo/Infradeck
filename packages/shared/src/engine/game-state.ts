
import { Card, CardType, Ability, EffectTiming, EffectTarget, EffectActionType, EffectAction } from '../types/cards'

export enum GamePhase {
    START = 'START',
    MAIN = 'MAIN',
    COMBAT = 'COMBAT',
    END = 'END',
  }
  
  export interface Entity {
    id: string
  }
  
  export interface CardInZone extends Entity {
    cardId: string
    ownerId: string
  }
  
  export interface CreatureOnBoard extends CardInZone {
    attack: number
    health: number
    exhausted: boolean
    abilities: string[]
    damagedThisTurn?: boolean
  }
  
  export interface PlayerState {
    id: string
    name: string
    classType: string
    life: number
    maxLife: number
    maxMana: number
    mana: number
    deck: string[]
    hand: string[]
    graveyard: string[]
    board: CreatureOnBoard[]
    classResource?: {
      type: 'CEMENTERIO' | 'ENTROPIA' | 'ESTADO' | 'VIDA'
      amount?: number
      state?: 'DIA' | 'NOCHE' | 'ECLIPSE'
    }
    specimenSummons?: number
    permanentEclipse?: boolean
    specimenFreeThisTurn?: boolean
    manualCycleChangedThisTurn?: boolean
    allyDiedThisTurn?: boolean
    specimenSummonedThisTurn?: boolean
    attackersDeclaredThisTurn?: number
    lastAttackTargetHero?: boolean
  }
  
  export interface TurnState {
    currentPlayerIndex: number
    phase: GamePhase
    turnNumber: number
  }
  
  export interface StackItem {
    id: string
    type: 'CARD_PLAY' | 'EFFECT_TRIGGER' | 'ABILITY_ACTIVATION'
    playerIndex: number
    sourceId: string
    action: EffectAction
    targets?: TargetRef[]
    priority: number  // timestamp para orden
    cardData?: Card   // datos de la carta para resolución
  }
  
  export interface GameState {
    players: [PlayerState, PlayerState]
    turn: TurnState
    stack: StackItem[]           // ← cambiar de Entity[] a StackItem[]
    rngSeed?: number
    endOfTurnTasks?: Array<() => void>
    pendingCounters?: [number, number]
    priorityPassed: [boolean, boolean]  // ← añadir esto
  }


  
  // --- Utilidades simples ---
  
  function shuffle<T>(arr: T[], rng = Math.random): T[] {
    const a = arr.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  
  export function createGame(p1: Omit<PlayerState, 'deck' | 'hand' | 'graveyard' | 'board' | 'mana' | 'maxMana' | 'life' | 'maxLife'> & { deck: string[] }, 
    p2: Omit<PlayerState, 'deck' | 'hand' | 'graveyard' | 'board' | 'mana' | 'maxMana' | 'life' | 'maxLife'> & { deck: string[] },
    rngSeed?: number): GameState {
    const rng = rngSeed != null ? mulberry32(rngSeed) : Math.random
    const base = (p: typeof p1): PlayerState => ({
        id: p.id,
        name: p.name,
        classType: p.classType,
        life: 20,
        maxLife: 20,
        maxMana: 0,
        mana: 0,
        deck: shuffle(p.deck, rng),
        hand: [],
        graveyard: [],
        board: [],
        classResource: initialClassResource(p.classType),
        specimenSummons: 0,
        permanentEclipse: false,
        specimenFreeThisTurn: false,
        manualCycleChangedThisTurn: false,
        allyDiedThisTurn: false,
        specimenSummonedThisTurn: false,
        attackersDeclaredThisTurn: 0,
        lastAttackTargetHero: false,
      })
    // En createGame, línea 106-113, cambiar:
return {
    players: [base(p1), base(p2)],
    turn: { currentPlayerIndex: 0, phase: GamePhase.START, turnNumber: 1 },
    stack: [],
    rngSeed,
    endOfTurnTasks: [],
    pendingCounters: [0, 0],
    priorityPassed: [false, false],  // ← añadir esto
  }
  }

 export function createInitialGameState(): GameState {
  const basicDeck = [
    // ✅ USAR IDs que SÍ EXISTEN en tus cartas:
    'Ultima_Oportunidad', 'Ultima_Oportunidad', 'Ultima_Oportunidad', 'Ultima_Oportunidad',
    'Mercenario_Agil', 'Mercenario_Agil', 'Mercenario_Agil', 'Mercenario_Agil', 
    'Explorador_Astuto', 'Explorador_Astuto', 'Asesino_Silencioso', 'Asesino_Silencioso',
    'Guardian_Novato', 'Guardian_Novato', 'Reflejo_Rapido', 'Reflejo_Rapido'
  ]

  const player1 = {
    id: 'player1',
    name: 'Player 1',
    classType: 'ABOMINACION',
    deck: [...basicDeck]
  }

  const player2 = {
    id: 'player2', 
    name: 'Player 2',
    classType: 'CAOS',
    deck: [...basicDeck]
  }

  const gameState = createGame(player1, player2)
  startGame(gameState)
  return gameState
}
  
  export function startGame(state: GameState): void {
    // Mano inicial: 5 para P1, 6 para P2
    draw(state, 0, 5)
    draw(state, 1, 5)
    state.players[0].maxMana = 1
    state.players[0].mana = 1
    state.turn.phase = GamePhase.MAIN
    onPriorityWindow(state, { phase: GamePhase.MAIN, activePlayer: getCurrentPlayerIndex(state) })
  }
  
  function effectConditionPasses(state: GameState, playerIndex: number, eff: any): boolean {
    if (!eff.condition) return true
    const p = state.players[playerIndex]
    const c = eff.condition
    if (c.type === 'CLASS_RESOURCE') {
      const cr = p.classResource
      if (!cr) return false
      const want = c.value
      if (typeof want === 'number' && 'amount' in cr) {
        if (c.comparison === 'EQUAL') return (cr.amount ?? 0) === want
        if (c.comparison === 'GREATER_EQUAL') return (cr.amount ?? 0) >= want
      }
      if (typeof want === 'string' && 'state' in cr) {
        return cr.state === want
      }
      return false
    }
    if (c.type === 'HEALTH_THRESHOLD') {
      if (c.comparison === 'LESS_EQUAL') return p.life <= c.value
      if (c.comparison === 'EQUAL') return p.life === c.value
      if (c.comparison === 'GREATER_EQUAL') return p.life >= c.value
      return false
    }
    // Nuevas condiciones simples
    if (c.type === 'HAND_SIZE') {
      if (c.comparison === 'LESS_EQUAL') return p.hand.length <= c.value
      if (c.comparison === 'EQUAL') return p.hand.length === c.value
      if (c.comparison === 'GREATER_EQUAL') return p.hand.length >= c.value
      return false
    }
    if (c.type === 'MANA_X_PLUS') {
        return p.mana >= (c.value ?? 0)
      }
      if (c.type === 'CREATURE_COUNT_3_PLUS') {
        return p.board.length >= 3
      }
      if (c.type === 'BOARD_STATE') {
        switch (String(c.value)) {
          case 'ALLY_DIED_THIS_TURN':       return !!p.allyDiedThisTurn
          case 'SPECIMEN_SUMMONED':         return !!p.specimenSummonedThisTurn
          case 'SPECIMEN_ON_BOARD':         return hasSpecimenOnBoard(p)
          case 'NO_STATE_CHANGE_THIS_TURN': return !p.manualCycleChangedThisTurn
          case 'MANA_5_PLUS':               return p.mana >= 5
          case 'MANA_6_PLUS':               return p.mana >= 6
          case 'SOLO_ATTACKER':             return (p.attackersDeclaredThisTurn ?? 0) === 1
          case 'ATTACKING_HERO':            return !!p.lastAttackTargetHero
          case 'DID_NOT_ATTACK':            return (p.attackersDeclaredThisTurn ?? 0) === 0
          case 'HAS_OTHER_CREATURES':       return p.board.length > 1
          default:                          return false
        }
      }
      return false
    }
  
  export function draw(state: GameState, playerIndex: number, count = 1): void {
    const p = state.players[playerIndex]
    for (let i = 0; i < count; i++) {
      const top = p.deck.shift()
      if (!top) break
      p.hand.push(top)
    }
  }
  
  // Recursos iniciales por clase
  function initialClassResource(classType: string): PlayerState['classResource'] {
    switch (classType) {
      case 'CAOS':
        return { type: 'ENTROPIA', amount: 0 }
      case 'CICLO':
        return { type: 'ESTADO', state: 'DIA' }
      case 'VITALIDAD':
        return { type: 'VIDA' } // se usa la vida del héroe, no amount
      case 'ABOMINACION':
        return { type: 'CEMENTERIO', amount: 0 }
      default:
        return undefined
    }
  }
  
  // PRNG determinista opcional
  function mulberry32(a: number) {
    return function() {
      let t = a += 0x6D2B79F5
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  
  // --- Priority windows (instants) ---
  
  export type PriorityHandler = (state: GameState, info: { phase: GamePhase, activePlayer: number }) => void

export let onPriorityWindow: PriorityHandler = () => {}
export function setPriorityWindow(handler: PriorityHandler) {
  onPriorityWindow = handler
}
  // Helper para disparar prioridad en el jugador activo
  function triggerPriority(state: GameState, phase: GamePhase) {
    onPriorityWindow(state, { phase, activePlayer: getCurrentPlayerIndex(state) })
  }
  // Añadir después de triggerPriority
export function addToStack(
    state: GameState, 
    item: Omit<StackItem, 'id' | 'priority'>
  ): void {
    const stackItem: StackItem = {
      ...item,
      id: `stack_${Date.now()}_${Math.floor(Math.random()*1e6)}`,
      priority: Date.now()
    }
    state.stack.push(stackItem)
    state.priorityPassed = [false, false]  // reset priority
    triggerPriority(state, state.turn.phase)
}

export function getStack(state: GameState): StackItem[] {
  return state.stack.slice()
}

export function passPriority(state: GameState, playerIndex: number): void {
    state.priorityPassed[playerIndex] = true
    if (state.priorityPassed.every(passed => passed)) {
      resolveStack(state)
    }
  }
  
  export function resolveStack(state: GameState): void {
    while (state.stack.length > 0) {
      const item = state.stack.pop()!
      applyStackItem(state, item)
      state.priorityPassed = [false, false]
      triggerPriority(state, state.turn.phase)
    }
  }

export function canRespond(state: GameState, playerIndex: number, getCardById: GetCardById): boolean {
  // Regla simple: puedes responder si tienes alguna instantánea en mano
  const p = state.players[playerIndex]
  return p.hand.some(id => {
    const c = getCardById(id)
    return !!c && c.type === CardType.INSTANT
  })
}

export function respondWithCard(
  state: GameState,
  playerIndex: number,
  handIndex: number,
  getCardById: GetCardById,
  options?: PlayOptions
): PlayResult {
  // Reutiliza playCard: encola al stack sin resolver (hasta que ambos pasen)
  return playCard(state, playerIndex, handIndex, getCardById, options)
}
  
  function applyStackItem(state: GameState, item: StackItem): void {
    const { playerIndex, action, targets, cardData } = item
    
    // Aplicar la acción del stack item
    applyAction(state, playerIndex, action, targets)
    
    // Notificar que se resolvió
    notifyEffectTriggered(state, playerIndex, item.sourceId, 'ON_PLAY')
  }

  

  // --- Notificaciones de prioridad en eventos de juego ---

export type PriorityEvent =
| { type: 'CARD_PLAYED'; player: number; cardId: string }
| { type: 'EFFECT_TRIGGERED'; player: number; sourceId: string; timing: 'ON_PLAY'|'ON_ENTER'|'ON_DEATH'|'ON_ATTACK'|'END_OF_TURN' }
| { type: 'ENTER_BATTLEFIELD'; player: number; entityId: string }
| { type: 'LEAVE_BATTLEFIELD'; player: number; entityId: string }

export function notifyCardPlayed(state: GameState, playerIndex: number, cardId: string): void {
// Aquí iría encolado a la pila si hay efectos
triggerPriority(state, state.turn.phase)
}



export function notifyEffectTriggered(
  state: GameState,
  playerIndex: number,
  sourceId: string,
  timing: 'ON_PLAY'|'ON_ENTER'|'ON_DEATH'|'ON_ATTACK'|'END_OF_TURN'
): void {
  triggerPriority(state, state.turn.phase)
}

export function notifyEnterBattlefield(state: GameState, playerIndex: number, entityId: string): void {
triggerPriority(state, state.turn.phase)
}

export function notifyLeaveBattlefield(state: GameState, playerIndex: number, entityId: string): void {
    triggerPriority(state, state.turn.phase)
    state.players[playerIndex].allyDiedThisTurn = true
  }
  
  // --- Turnos ---
  
  export function getCurrentPlayerIndex(state: GameState): number {
    return state.turn.currentPlayerIndex
  }
  
  export function getOpponentPlayerIndex(state: GameState): number {
    return 1 - state.turn.currentPlayerIndex
  }
  
  export function startTurn(state: GameState): void {
    const i = getCurrentPlayerIndex(state)
    const p = state.players[i]
    state.turn.phase = GamePhase.START
    triggerPriority(state, GamePhase.START)
  
    if (p.maxMana < 10) p.maxMana += 1
    p.mana = p.maxMana
  
    if (!(state.turn.turnNumber === 1 && i === 0)) {
      draw(state, i, 1)
    }
  
    p.board.forEach(c => { c.exhausted = false; c.damagedThisTurn = false })
    if (p.classResource?.type === 'ESTADO') {
      if (!p.permanentEclipse && p.classResource.state === 'ECLIPSE') {
        p.classResource.state = 'DIA'
      }
    }
  
    // reset flags de turno
    p.attackersDeclaredThisTurn = 0
    p.lastAttackTargetHero = false
    p.manualCycleChangedThisTurn = false
    p.allyDiedThisTurn = false
    p.specimenSummonedThisTurn = false
    p.board.forEach(c => { c.exhausted = false; c.damagedThisTurn = false })
  
    triggerBoardEffects(state, i, EffectTiming.START_OF_TURN)
  
    state.turn.phase = GamePhase.MAIN
    triggerPriority(state, GamePhase.MAIN)
  }
  
  export function endTurn(state: GameState): void {
    const i = getCurrentPlayerIndex(state)
    const p = state.players[i]
  
    state.turn.phase = GamePhase.END
    triggerPriority(state, GamePhase.END)
  
    // TRIGGERS: END_OF_TURN (jugador activo)
    triggerBoardEffects(state, i, EffectTiming.END_OF_TURN)
  
    // Ejecuta tareas programadas para fin de turno
    if (state.endOfTurnTasks && state.endOfTurnTasks.length) {
      const tasks = state.endOfTurnTasks.splice(0, state.endOfTurnTasks.length)
      tasks.forEach(fn => { try { fn() } catch {} })
    }

    if (p.classResource?.type === 'ESTADO') {
      if (!p.permanentEclipse) {
        if (p.classResource.state === 'DIA') p.classResource.state = 'NOCHE'
        else if (p.classResource.state === 'NOCHE') p.classResource.state = 'DIA'
        else if (p.classResource.state === 'ECLIPSE') p.classResource.state = 'DIA'
      }
    }
  
    state.turn.currentPlayerIndex = 1 - state.turn.currentPlayerIndex
    state.turn.turnNumber += 1
    state.turn.phase = GamePhase.START
    triggerPriority(state, GamePhase.START)
  }
  
  export function nextTurn(state: GameState): void {
    endTurn(state)
    startTurn(state)
  }

// Resolver de cartas por id (inyectado)
export type GetCardById = (id: string) => Card | undefined

export type PlayResult = { ok: true } | { ok: false, error: string }

export function playCard(
  state: GameState,
  playerIndex: number,
  handIndex: number,
  getCardById: GetCardById,  // ← ESTE es el problema
  options?: PlayOptions
): PlayResult {
    if (playerIndex !== getCurrentPlayerIndex(state) && !isInstantInPriority(state, playerIndex, handIndex, getCardById)) {
      return { ok: false, error: 'No es tu turno o no es ventana de prioridad para instantáneas' }
    }
    const player = state.players[playerIndex]
    const playedId = player.hand[handIndex]
    if (!playedId) return { ok: false, error: 'Índice de mano inválido' }
  
    const card = getCardById(playedId)
    if (!card) return { ok: false, error: 'Carta desconocida' }
  
    if (!canPlayThisPhase(state, card)) {
      return { ok: false, error: 'No puedes jugar esta carta en esta fase' }
    }
    if (player.mana < card.mana) return { ok: false, error: 'Mana insuficiente' }
  
    {
      const r = canPayClassCost(state, playerIndex, card, getCardById)
      if (!r.ok) return r
      applyClassCost(state, playerIndex, card)
    }
  
    player.mana -= card.mana
    player.hand.splice(handIndex, 1)
    notifyCardPlayed(state, playerIndex, card.id)
    gainEntropyOnPlay(player)

  
    if (card.type === CardType.CREATURE) {
        const creatureId = `${card.id}#${Date.now()}#${Math.floor(Math.random()*1e6)}`
        const hasPrisa = !!card.abilities?.includes(Ability.PRISA)
        const hasImpaciente = !!card.abilities?.includes(Ability.IMPACIENTE)
        const exhausted = !(hasPrisa || hasImpaciente)

        const entity = {
        id: creatureId,
        cardId: card.id,
        ownerId: player.id,
        attack: card.attack ?? 0,
        health: card.health ?? 1,
        exhausted,
        abilities: (card.abilities ?? []).map(String),
        }
      player.board.push(entity)
  
      notifyEnterBattlefield(state, playerIndex, creatureId)
      for (const eff of card.effects ?? []) {
        if (eff.timing === EffectTiming.ON_ENTER && effectConditionPasses(state, playerIndex, eff)) {
          applyAction(state, playerIndex, eff.action, options?.targets?.slice())
          notifyEffectTriggered(state, playerIndex, card.id, 'ON_ENTER')
        }
      }
      return { ok: true }
    }

    if (card.type === CardType.INSTANT) {
        // Counter check
        if ((state.pendingCounters?.[playerIndex] ?? 0) > 0) {
          state.pendingCounters![playerIndex]!--
          player.graveyard.unshift(card.id)
          return { ok: true }
        }
      
        for (const eff of card.effects ?? []) {
          if (eff.timing === EffectTiming.ON_PLAY && effectConditionPasses(state, playerIndex, eff)) {
            addToStack(state, {
              type: 'CARD_PLAY',
              playerIndex,
              sourceId: card.id,
              action: eff.action,
              targets: options?.targets,
              cardData: card
            })
          }
        }
        // No resolvemos; se resolverá cuando ambos pasen prioridad
        player.graveyard.unshift(card.id)
        return { ok: true }
      }
      if (card.type === CardType.SPELL) {
        // Counter check
        if ((state.pendingCounters?.[playerIndex] ?? 0) > 0) {
          state.pendingCounters![playerIndex]!--
          state.players[playerIndex].graveyard.unshift(card.id)
          return { ok: true }
        }
      
        notifyEffectTriggered(state, playerIndex, card.id, 'ON_PLAY')
        for (const eff of card.effects ?? []) {
          if (eff.timing === EffectTiming.ON_PLAY && effectConditionPasses(state, playerIndex, eff)) {
            applyAction(state, playerIndex, eff.action, options?.targets?.slice())
          }
        }
        state.players[playerIndex].graveyard.unshift(card.id)
        return { ok: true }
      }
    
      return { ok: false, error: 'Tipo de carta no soportado aún' }  // ← añadir
    }

function consumeEntropy(state: GameState, playerIndex: number, amount: number): boolean {
    const p = state.players[playerIndex]
    if (p.classResource?.type !== 'ENTROPIA') return false
    const have = p.classResource.amount ?? 0
    if (have < amount) return false
    p.classResource.amount = have - amount
    return true
  }

function canPlayThisPhase(state: GameState, card: Card): boolean {
  return card.type === CardType.INSTANT || state.turn.phase === GamePhase.MAIN
}

function isInstantInPriority(state: GameState, playerIndex: number, handIndex: number, getCardById: GetCardById): boolean {
  const p = state.players[playerIndex]
  const cardId = p.hand[handIndex]
  if (!cardId) return false
  const card = getCardById(cardId)
  return !!card && card.type === CardType.INSTANT
}

function gainEntropyOnPlay(player: PlayerState) {
  if (player.classResource?.type === 'ENTROPIA') {
    player.classResource.amount = Math.min(10, (player.classResource.amount ?? 0) + 1)
  }
}

// Helpers de coste de clase

function getSpecimenCost(p: PlayerState): number {
    const summons = p.specimenSummons ?? 0
    return Math.min(10, 5 + 2 * summons)
  }

  function summonSpecimenToken(state: GameState, playerIndex: number, evolved = false) {
    const p = state.players[playerIndex]
    const id = `SPECIMEN_${evolved ? 'EVOLVED' : 'BASE'}#${Date.now()}#${Math.floor(Math.random()*1e6)}`
    const entity: CreatureOnBoard = {
      id,
      cardId: evolved ? 'SPECIMEN_EVOLVED_TOKEN' : 'SPECIMEN_TOKEN',
      ownerId: p.id,
      attack: evolved ? 10 : 5,
      health: evolved ? 10 : 5,
      exhausted: true,
      abilities: [],
    }
    p.board.push(entity)
    p.specimenSummons = (p.specimenSummons ?? 0) + 1
    p.specimenSummonedThisTurn = true
    notifyEnterBattlefield(state, playerIndex, id)
  }

function canPayClassCost(
    state: GameState,
    playerIndex: number,
    card: Card,
    getCardById: GetCardById
  ): { ok: true } | { ok: false, error: string } {
    const p = state.players[playerIndex]
    if (!card.classResource) return { ok: true }
  
    const cr = card.classResource
    switch (cr.type) {
      case 'VIDA': {
        const cost = cr.amount ?? 0
        // No puedes pagar por debajo de 1 de vida
        if (p.life - cost < 1) return { ok: false, error: 'Vida insuficiente para pagar el coste' }
        return { ok: true }
      }
      case 'ENTROPIA': {
        const need = cr.amount ?? 0
        const have = p.classResource?.type === 'ENTROPIA' ? (p.classResource.amount ?? 0) : 0
        if (have < need) return { ok: false, error: 'Entropía insuficiente (requiere X+)' }
        return { ok: true }
      }
      case 'ESTADO': {
        const needState = (cr as any).state as 'DIA'|'NOCHE'|'ECLIPSE'|undefined
        const currentState = p.classResource?.type === 'ESTADO' ? p.classResource.state : undefined
        if (needState && currentState !== needState) return { ok: false, error: 'Estado de ciclo incorrecto para esta carta' }
        return { ok: true }
      }
      case 'CEMENTERIO': {
        const need = cr.amount ?? 0
        const count = countGraveyardCreatures(p, getCardById)
        if (count < need) return { ok: false, error: 'Cementerio insuficiente (requiere X+ criaturas)' }
        return { ok: true }
      }
      default:
        return { ok: true }
    }
  }
  
  function applyClassCost(state: GameState, playerIndex: number, card: Card): void {
    // No-op: VIDA/ENTROPIA/ESTADO/CEMENTERIO actúan como requisitos (no se pagan aquí)
  }
  
  function countGraveyardCreatures(p: PlayerState, getCardById: GetCardById): number {
    let n = 0
    for (const id of p.graveyard) {
      const c = getCardById(id)
      if (c && c.type === CardType.CREATURE) n++
    }
    return n
  }

  // ---- Targeting & Actions ----

export type TargetRef =
| { type: 'HERO_SELF' }
| { type: 'HERO_ENEMY' }
| { type: 'CREATURE_SELF'; index: number }       // índice en tu board
| { type: 'CREATURE_ENEMY'; index: number }      // índice en board rival
| { type: 'ANY_CREATURE'; owner: 'SELF'|'ENEMY'; index: number }

export interface PlayOptions {
targets?: TargetRef[]
}

type TargetResolved =
  | { kind: 'HERO'; playerIndex: number }
  | { kind: 'CREATURE'; playerIndex: number; index: number }
  | { kind: 'MULTI'; scope: 'FRIENDLY' | 'ENEMY' }
  | { kind: 'RANDOM_ENEMY' }
  | { kind: 'SELF' }
  | { kind: 'STACK_TOP_ENEMY' }


function resolveSingleTarget(
  state: GameState,
  playerIndex: number,
  effectTarget: EffectTarget,
  hint?: TargetRef
): TargetResolved | undefined {
  const me = state.players[playerIndex]
  const opp = state.players[getOpponentPlayerIndex(state)]

  switch (effectTarget) {
    case EffectTarget.FRIENDLY_HERO: return { kind: 'HERO', playerIndex }
    case EffectTarget.ENEMY_HERO:    return { kind: 'HERO', playerIndex: getOpponentPlayerIndex(state) }
    case EffectTarget.TARGET_CREATURE: {
      if (!hint) return undefined
      if (hint.type === 'CREATURE_SELF' && me.board[hint.index]) {
        return { kind: 'CREATURE', playerIndex, index: hint.index }
      }
      if (hint.type === 'CREATURE_ENEMY' && opp.board[hint.index]) {
        return { kind: 'CREATURE', playerIndex: getOpponentPlayerIndex(state), index: hint.index }
      }
      if (hint.type === 'ANY_CREATURE') {
        const ownerIdx = hint.owner === 'SELF' ? playerIndex : getOpponentPlayerIndex(state)
        const owner = hint.owner === 'SELF' ? me : opp
        if (owner.board[hint.index]) {
          return { kind: 'CREATURE', playerIndex: ownerIdx, index: hint.index }
        }
      }
      return undefined
    }
    case EffectTarget.ALL_FRIENDLY_CREATURES: return { kind: 'MULTI', scope: 'FRIENDLY' }
    case EffectTarget.ALL_ENEMY_CREATURES:    return { kind: 'MULTI', scope: 'ENEMY' }
    case EffectTarget.RANDOM_ENEMY:           return { kind: 'RANDOM_ENEMY' }
    case EffectTarget.SELF:                   return { kind: 'SELF' }
    case EffectTarget.TARGET_SPELL: return { kind: 'STACK_TOP_ENEMY' }
    default:                                  return undefined
  }
}

function applyAction(
state: GameState,
playerIndex: number,
action: any,
targetsHints?: TargetRef[]
) {
const me = state.players[playerIndex]
const opp = state.players[getOpponentPlayerIndex(state)]
const pickHint = () => (targetsHints && targetsHints.length ? targetsHints.shift() : undefined)

const target = resolveSingleTarget(state, playerIndex, action.target, pickHint())
if (!target) return

// Stealth: no puedes targetear criaturas ENEMIGAS con Sigilo con objetivos puntuales
if (target.kind === 'CREATURE') {
  const ownerIdx = target.playerIndex
  if (ownerIdx !== playerIndex) {
    const owner = state.players[ownerIdx]
    const cr = owner.board[target.index]
    if (cr && hasAbility(cr, Ability.SIGILO)) return
  }
}

// Consumo opcional de Entropía si el action lo especifica
if (action.consumeEntropy && action.consumeEntropy > 0 && String(action.value) !== 'RANDOM_BY_ENTROPY') {
    if (!consumeEntropy(state, playerIndex, action.consumeEntropy)) return
  }

switch (action.type as EffectActionType) {
  case EffectActionType.BUFF_ATTACK: {
    const amount = action.amount ?? 0
    if (target.kind === 'CREATURE') {
      const owner = state.players[target.playerIndex]
      const cr = owner.board[target.index]
      if (cr) {
        cr.attack += amount
        if (action.duration === 'END_OF_TURN') {
          state.endOfTurnTasks?.push(() => {
            const o = state.players[target.playerIndex]
            const c = o.board[target.index]
            if (c) c.attack -= amount
          })
        }
      }
    } else if (target.kind === 'MULTI') {
      const list = target.scope === 'FRIENDLY' ? me.board : opp.board
      list.forEach(c => { c.attack += amount })
      if (action.duration === 'END_OF_TURN') {
        state.endOfTurnTasks?.push(() => {
          const list2 = target.scope === 'FRIENDLY' ? me.board : opp.board
          list2.forEach(c => { c.attack -= amount })
        })
      }
    }
    break
  }
  case EffectActionType.BUFF_STATS: {
    // Soporte especial: '+1/+1_PER_ABILITY'
    if (action.value === '+1/+1_PER_ABILITY') {
      if (target.kind === 'CREATURE') {
        const owner = state.players[target.playerIndex]
        const cr = owner.board[target.index]
        if (cr) {
          const unique = new Set(cr.abilities || []).size
          cr.attack += unique
          cr.health += unique
          if (action.duration === 'END_OF_TURN') {
            state.endOfTurnTasks?.push(() => {
              const o = state.players[target.playerIndex]
              const c = o.board[target.index]
              if (c) { c.attack -= unique; c.health -= unique }
            })
          }
        }
      }
      break
    }
  
    // Soporte especial: 'LIFE_DIFFERENTIAL' => +Y/+Y con Y = maxLife - life del dueño de la criatura objetivo
    if (action.value === 'LIFE_DIFFERENTIAL') {
      if (target.kind === 'CREATURE') {
        const owner = state.players[target.playerIndex]
        const cr = owner.board[target.index]
        if (cr) {
          const y = Math.max(0, (owner.maxLife ?? 20) - (owner.life ?? 0))
          cr.attack += y
          cr.health += y
          if (action.duration === 'END_OF_TURN') {
            state.endOfTurnTasks?.push(() => {
              const o = state.players[target.playerIndex]
              const c = o.board[target.index]
              if (c) { c.attack -= y; c.health -= y }
            })
          }
        }
      }
      break
    }
  
    // Formato '+X/+Y' o amount numérico para héroe
    if (typeof action.value === 'string' && action.value.includes('/')) {
      const [a, h] = action.value.replace('+', '').split('/')
      const addA = parseInt(a || '0', 10)
      const addH = parseInt(h || '0', 10)
      const applyOne = (c?: CreatureOnBoard) => {
        if (!c) return
        c.attack += addA
        c.health += addH
      }
      const revertOne = (c?: CreatureOnBoard) => {
        if (!c) return
        c.attack -= addA
        c.health -= addH
      }
      if (target.kind === 'CREATURE') {
        const owner = state.players[target.playerIndex]
        const cr = owner.board[target.index]
        applyOne(cr)
        if (action.duration === 'END_OF_TURN') {
          state.endOfTurnTasks?.push(() => revertOne(owner.board[target.index]))
        }
      } else if (target.kind === 'MULTI') {
        const list = target.scope === 'FRIENDLY' ? me.board : opp.board
        list.forEach(applyOne)
        if (action.duration === 'END_OF_TURN') {
          state.endOfTurnTasks?.push(() => {
            const list2 = target.scope === 'FRIENDLY' ? me.board : opp.board
            list2.forEach(revertOne)
          })
        }
      }
    }
  
    break
  }
  case EffectActionType.DRAW_CARDS: {
    const count = action.amount ?? 1
    const who = action.target === EffectTarget.ENEMY_HERO ? getOpponentPlayerIndex(state) : playerIndex
    draw(state, who, count)
    break
  }
  case EffectActionType.DISCARD_CARDS: {
    const count = action.amount ?? 1
    const who = action.target === EffectTarget.ENEMY_HERO ? getOpponentPlayerIndex(state) : playerIndex
    const p = state.players[who]
    for (let i = 0; i < count; i++) { if (p.hand.length) p.hand.splice(Math.floor(Math.random()*p.hand.length), 1) }
    break
  }
  case EffectActionType.BUFF_HEALTH: {
    const amount = action.amount ?? 0
    if (target.kind === 'CREATURE') {
      const owner = state.players[target.playerIndex]
      const cr = owner.board[target.index]
      if (cr) {
        cr.health += amount
        if (action.duration === 'END_OF_TURN') {
          state.endOfTurnTasks?.push(() => {
            const o = state.players[target.playerIndex]
            const c = o.board[target.index]
            if (c) c.health -= amount
          })
        }
      }
    } else if (target.kind === 'MULTI') {
      const list = target.scope === 'FRIENDLY' ? me.board : opp.board
      list.forEach(c => { c.health += amount })
      if (action.duration === 'END_OF_TURN') {
        state.endOfTurnTasks?.push(() => {
          const list2 = target.scope === 'FRIENDLY' ? me.board : opp.board
          list2.forEach(c => { c.health -= amount })
        })
      }
    }
    break
  }
  case EffectActionType.SUMMON_CREATURE: {
    // DISCOVER_FROM_GRAVEYARD: ofrece 3 al azar de ambos cementerios y, sin UI, elige 1 al azar e invoca
    if (String(action.value) === 'DISCOVER_FROM_GRAVEYARD') {
      const poolIds: string[] = []
      for (const id of me.graveyard) {
        const c = getCardByIdGlobal(id)
        if (c && c.type === CardType.CREATURE) poolIds.push(id)
      }
      for (const id of opp.graveyard) {
        const c = getCardByIdGlobal(id)
        if (c && c.type === CardType.CREATURE) poolIds.push(id)
      }
      if (poolIds.length === 0) break
      // toma hasta 3 únicas, aleatorias
      const choices = [...new Set(poolIds)].sort(() => Math.random() - 0.5).slice(0, 3)
      const pickId = choices[Math.floor(Math.random() * choices.length)]
      const pickCard = getCardByIdGlobal(pickId)
      if (!pickCard) break

      // quitar de cementerio (del dueño original)
      const ownerIdx = me.graveyard.includes(pickId) ? playerIndex : getOpponentPlayerIndex(state)
      const ownerGY = state.players[ownerIdx].graveyard
      const rm = ownerGY.indexOf(pickId)
      if (rm >= 0) ownerGY.splice(rm, 1)

      // invocar copia con sus stats/abilities base
      const entId = `${pickCard.id}#DISCOVER#${Date.now()}#${Math.floor(Math.random()*1e6)}`
      const entity: CreatureOnBoard = {
        id: entId,
        cardId: pickCard.id,
        ownerId: me.id,
        attack: pickCard.attack ?? 0,
        health: pickCard.health ?? 1,
        exhausted: true,
        abilities: (pickCard.abilities ?? []).map(String),
      }
      me.board.push(entity)
      notifyEnterBattlefield(state, playerIndex, entId)
      // Disparar ON_ENTER de la criatura invocada por discover
const def = getCardByIdGlobal(pickCard.id)
if (def && def.effects) {
  for (const eff of def.effects) {
    if (eff.timing === EffectTiming.ON_ENTER && effectConditionPasses(state, playerIndex, eff)) {
      applyAction(state, playerIndex, eff.action)
      notifyEffectTriggered(state, playerIndex, def.id, 'ON_ENTER')
    }
  }
}
      break
    }

    const token = createTokenFromValue(String(action.value))
    if (token) {
      token.ownerId = me.id
      me.board.push(token)
      notifyEnterBattlefield(state, playerIndex, token.id)
      // Si es el 4/4 de Pacto de Poder, muere al final del turno
      if (token.cardId === 'TOKEN_4_4_PRISA_LIFESTEAL') {
        state.endOfTurnTasks?.push(() => {
          const idx = me.board.findIndex(c => c.id === token.id)
          if (idx >= 0) {
            const [dead] = me.board.splice(idx, 1)
            me.graveyard.unshift(dead.cardId)
            notifyLeaveBattlefield(state, playerIndex, dead.id)
            notifyEffectTriggered(state, playerIndex, dead.cardId, 'ON_DEATH')
          }
        })
      }
    }
    break
  }
  case EffectActionType.ACTIVATE_ECLIPSE: {
    const p = me
    if (p.classResource?.type === 'ESTADO') {
      p.classResource.state = 'ECLIPSE'
      state.players[playerIndex].manualCycleChangedThisTurn = true
    }
    break
  }
  case EffectActionType.CHANGE_CYCLE_STATE: {
    const p = me
    if (p.classResource?.type === 'ESTADO') {
      if (action.value === 'CHOOSE_DAY_OR_NIGHT') {
        p.classResource.state = 'DIA' // placeholder UI
      } else if (action.value === 'PERMANENT_ECLIPSE') {
        p.classResource.state = 'ECLIPSE'
        p.permanentEclipse = true
      } else {
        p.classResource.state = action.value
      }
      state.players[playerIndex].manualCycleChangedThisTurn = true
    }
    break
  }
  case EffectActionType.GAIN_ENTROPY: {
    const p = action.target === EffectTarget.ENEMY_HERO ? opp : me
    if (p.classResource?.type === 'ENTROPIA') {
      p.classResource.amount = Math.min(10, (p.classResource.amount ?? 0) + (action.amount ?? 1))
    }
    break
  }
  case EffectActionType.DAMAGE: {
    const amount = action.amount ?? 0

    // RANDOM_BY_ENTROPY: repite 'entropía' veces y consume 1 por proyectil si así se indica
    if (String(action.value) === 'RANDOM_BY_ENTROPY' && target.kind === 'RANDOM_ENEMY') {
      let entropy = me.classResource?.type === 'ENTROPIA' ? (me.classResource.amount ?? 0) : 0
      if (entropy > 0) {
        for (let i = 0; i < entropy; i++) {
          if (action.consumeEntropy && action.consumeEntropy > 0) {
            if (!consumeEntropy(state, playerIndex, 1)) break
          }
          const hasCreatures = opp.board.length > 0
          if (hasCreatures) {
            const idx = Math.floor(Math.random() * opp.board.length)
            const cr = opp.board[idx]
            cr.health -= (action.amount ?? 1)
            cr.damagedThisTurn = true
            if (cr.health <= 0) {
              const [dead] = opp.board.splice(idx, 1)
              opp.graveyard.unshift(dead.cardId)
              notifyLeaveBattlefield(state, getOpponentPlayerIndex(state), dead.id)
              notifyEffectTriggered(state, getOpponentPlayerIndex(state), dead.cardId, 'ON_DEATH')
            }
          } else {
            opp.life = Math.max(0, opp.life - (action.amount ?? 1))
          }
        }
      }
      break
    }

    if (target.kind === 'HERO') {
      const p = state.players[target.playerIndex]
      p.life = Math.max(0, p.life - amount)
    } else if (target.kind === 'CREATURE') {
      const owner = state.players[target.playerIndex]
      const cr = owner.board[target.index]
      if (!cr) break
      cr.health -= amount
      cr.damagedThisTurn = true
      if (cr.health <= 0) {
        const [dead] = owner.board.splice(target.index, 1)
        owner.graveyard.unshift(dead.cardId)
        notifyLeaveBattlefield(state, target.playerIndex, dead.id)
        notifyEffectTriggered(state, target.playerIndex, dead.cardId, 'ON_DEATH')
      }
    } else if (target.kind === 'MULTI') {
      const list = target.scope === 'FRIENDLY' ? me.board : opp.board
      // Daño en paralelo
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].health -= amount
        list[i].damagedThisTurn = true
        if (list[i].health <= 0) {
          const [dead] = list.splice(i, 1)
          const deadOwner = target.scope === 'FRIENDLY' ? playerIndex : getOpponentPlayerIndex(state)
          state.players[deadOwner].graveyard.unshift(dead.cardId)
          notifyLeaveBattlefield(state, deadOwner, dead.id)
          notifyEffectTriggered(state, deadOwner, dead.cardId, 'ON_DEATH')
        }
      }
    } else if (target.kind === 'RANDOM_ENEMY') {
      const pool = opp.board.length ? 'CREATURE' : 'HERO'
      if (pool === 'CREATURE') {
        const idx = Math.floor(Math.random() * opp.board.length)
        const cr = opp.board[idx]
        cr.health -= amount
        cr.damagedThisTurn = true
        if (cr.health <= 0) {
          const [dead] = opp.board.splice(idx, 1)
          opp.graveyard.unshift(dead.cardId)
          notifyLeaveBattlefield(state, getOpponentPlayerIndex(state), dead.id)
          notifyEffectTriggered(state, getOpponentPlayerIndex(state), dead.cardId, 'ON_DEATH')
        }
      } else {
        opp.life = Math.max(0, opp.life - amount)
      }
    }
    break
  }
  case EffectActionType.HEAL: {
    const amount = action.amount ?? 0
    if (target.kind === 'HERO') {
      const p = state.players[target.playerIndex]
      p.life = Math.min(p.maxLife, p.life + amount)
    } else if (target.kind === 'CREATURE') {
      const owner = state.players[target.playerIndex]
      const cr = owner.board[target.index]
      if (cr) cr.health += amount
    } else if (target.kind === 'MULTI') {
      const list = target.scope === 'FRIENDLY' ? me.board : opp.board
      list.forEach(c => { c.health += amount })
    }
    break
  }
case EffectActionType.GAIN_ABILITY: {
  const ability = String(action.value)
  if (target.kind === 'CREATURE') {
    const owner = state.players[target.playerIndex]
    const cr = owner.board[target.index]
    if (cr && !cr.abilities.includes(ability)) {
      cr.abilities.push(ability)
      if (action.duration === 'END_OF_TURN') {
        state.endOfTurnTasks?.push(() => {
          const o = state.players[target.playerIndex]
          const c = o.board[target.index]
          if (c) c.abilities = c.abilities.filter(a => a !== ability)
        })
      }
    }
  } else if (target.kind === 'MULTI') {
    const list = target.scope === 'FRIENDLY' ? me.board : opp.board
    list.forEach((c, idx) => {
      if (!c.abilities.includes(ability)) c.abilities.push(ability)
    })
    if (action.duration === 'END_OF_TURN') {
      state.endOfTurnTasks?.push(() => {
        const list2 = target.scope === 'FRIENDLY' ? me.board : opp.board
        list2.forEach(c => { c.abilities = c.abilities.filter(a => a !== ability) })
      })
    }
  }
  break
}
case EffectActionType.LOSE_ABILITY: {
  const ability = String(action.value)
  if (target.kind === 'CREATURE') {
    const owner = state.players[target.playerIndex]
    const cr = owner.board[target.index]
    if (cr) cr.abilities = cr.abilities.filter(a => a !== ability)
  } else if (target.kind === 'MULTI') {
    const list = target.scope === 'FRIENDLY' ? me.board : opp.board
    list.forEach(c => { c.abilities = c.abilities.filter(a => a !== ability) })
  }
  break
}
case EffectActionType.COUNTER_SPELL: {
    if (target.kind === 'STACK_TOP_ENEMY') {
      const opp = getOpponentPlayerIndex(state)
      for (let i = state.stack.length - 1; i >= 0; i--) {
        const it = state.stack[i]
        if (it.playerIndex === opp) {
          const [removed] = state.stack.splice(i, 1)
          // Si era una carta, va al cementerio de su dueño
          if (removed.cardData) {
            state.players[opp].graveyard.unshift(removed.cardData.id)
          }
          break
        }
      }
    } else {
      // Back-compat: modo Hearthstone (pendiente)
      const enemy = getOpponentPlayerIndex(state)
      state.pendingCounters![enemy] = (state.pendingCounters![enemy] ?? 0) + 1
    }
    break
  }
  case EffectActionType.SUMMON_SPECIMEN: {
    const p = state.players[playerIndex]
    const mode = String(action.value || '')

    if (mode === 'FREE_SUMMON_THIS_TURN') {
      p.specimenFreeThisTurn = true
      state.endOfTurnTasks?.push(() => { p.specimenFreeThisTurn = false })
      break
    }

    if (mode === 'ULTIMATE_EVOLUTION_10_10') {
      // opcional: exigir espécimen en mesa antes de evolucionar
      if (!hasSpecimenOnBoard(p)) break
      summonSpecimenToken(state, playerIndex, true)
      break
    }

    // IMMEDIATE_SUMMON_WITH_SCALING (o vacío): coste escalado 5→7→9→10
    if (hasSpecimenOnBoard(p)) break
    const cost = getSpecimenCost(p)
    if (!p.specimenFreeThisTurn) {
      if (p.mana < cost) break
      p.mana -= cost
    }
    summonSpecimenToken(state, playerIndex, false)
    break
  }
  default:
    // otros tipos se implementarán más adelante
    break
}

// ventana de prioridad tras aplicar acción
notifyEffectTriggered(state, playerIndex, 'ACTION', 'ON_PLAY')
}

// ---- Combat basics ----

function hasAbility(creature: CreatureOnBoard, ability: Ability) {
    return creature.abilities?.some(a => a === String(ability)) ?? false
  }
  
  function enemyHasTaunt(state: GameState, enemyIndex: number): boolean {
    return state.players[enemyIndex].board.some(c => hasAbility(c, Ability.TAUNT))
  }
  
  export type AttackResult = { ok: true } | { ok: false, error: string }
  
  export function declareAttackHero(state: GameState, attackerIndex: number, attackerBoardIndex: number): AttackResult {
    const active = getCurrentPlayerIndex(state)
    if (attackerIndex !== active) return { ok: false, error: 'No es tu turno' }
    if (state.turn.phase !== GamePhase.COMBAT) return { ok: false, error: 'No estás en fase de combate' }

    const me = state.players[attackerIndex]
    const oppIndex = getOpponentPlayerIndex(state)
    const opp = state.players[oppIndex]
    const atk = me.board[attackerBoardIndex]
    if (!atk) return { ok: false, error: 'Atacante inválido' }
    if (atk.exhausted) return { ok: false, error: 'Esta criatura está exhausta' }
  
    if (hasAbility(atk, Ability.IMPACIENTE)) return { ok: false, error: 'Impaciente: solo puede atacar criaturas' }
    if (enemyHasTaunt(state, oppIndex)) return { ok: false, error: 'Hay Taunt enemigo: debes atacar a una criatura con Taunt' }
  
    if (hasAbility(atk, Ability.SIGILO)) {
      atk.abilities = atk.abilities.filter(a => a !== String(Ability.SIGILO))
    }
    notifyEffectTriggered(state, attackerIndex, atk.cardId, 'ON_ATTACK')
  
    me.attackersDeclaredThisTurn = (me.attackersDeclaredThisTurn ?? 0) + 1
    me.lastAttackTargetHero = true
  
    const atkDmg = atk.attack ?? 0
    opp.life = Math.max(0, opp.life - atkDmg)
    if (hasAbility(atk, Ability.DOBLE_GOLPE) && opp.life > 0) {
      opp.life = Math.max(0, opp.life - atkDmg)
    }
  
    atk.exhausted = true
    notifyEffectTriggered(state, attackerIndex, atk.cardId, 'END_OF_TURN')
   // Abre ventana de prioridad tras declarar ataque al héroe
  triggerPriority(state, state.turn.phase)
    return { ok: true }}
  
    export function declareAttackCreature(state: GameState, attackerIndex: number, attackerBoardIndex: number, defenderBoardIndex: number): AttackResult {
        const active = getCurrentPlayerIndex(state)
        if (attackerIndex !== active) return { ok: false, error: 'No es tu turno' }
        if (state.turn.phase !== GamePhase.COMBAT && state.turn.phase !== GamePhase.MAIN) return { ok: false, error: 'No estás en fase de combate' }
      
        const me = state.players[attackerIndex]
        const oppIndex = getOpponentPlayerIndex(state)
        const opp = state.players[oppIndex]
        const atk = me.board[attackerBoardIndex]
        const def = opp.board[defenderBoardIndex]
        if (!atk) return { ok: false, error: 'Atacante inválido' }
        if (!def) return { ok: false, error: 'Defensor inválido' }
        if (atk.exhausted) return { ok: false, error: 'Esta criatura está exhausta' }
      
        // Sigilo: no puedes atacar a una criatura con Sigilo
        if (def.abilities?.includes(String(Ability.SIGILO))) {
          return { ok: false, error: 'No puedes atacar a una criatura con Sigilo' }
        }
    
  
      // Quitar Sigilo al atacar por primera vez
  if (hasAbility(atk, Ability.SIGILO)) {
    atk.abilities = atk.abilities.filter(a => a !== String(Ability.SIGILO))
  }
  // ON_ATTACK triggers
  notifyEffectTriggered(state, attackerIndex, atk.cardId, 'ON_ATTACK')

  // Regla de Vuelo: solo criaturas con Vuelo pueden atacar criaturas con Vuelo
  if (hasAbility(def, Ability.VUELO) && !hasAbility(atk, Ability.VUELO)) {
    return { ok: false, error: 'No puedes atacar a una criatura con Vuelo sin tener Vuelo' }
  }

  // Daño simultáneo
  const atkDamage = atk.attack ?? 0
    const defDamage = def.attack ?? 0
  
    // Escudo: previene el próximo daño que recibiría (consumirlo si existe)
    const attackerHasShield = hasAbility(atk, Ability.ESCUDO)
    const defenderHasShield = hasAbility(def, Ability.ESCUDO)
  
    // Aplicar daño a defensor
    if (defenderHasShield) {
        def.abilities = def.abilities.filter(a => a !== String(Ability.ESCUDO))
      } else {
        def.health -= atkDamage
        def.damagedThisTurn = true
      }
  
      if (attackerHasShield) {
        atk.abilities = atk.abilities.filter(a => a !== String(Ability.ESCUDO))
      } else {
        atk.health -= defDamage
        atk.damagedThisTurn = true
      }
  
    // Veneno: cualquier daño que conecte destruye
    const attackerHasPoison = hasAbility(atk, Ability.VENENO)
    const defenderHasPoison = hasAbility(def, Ability.VENENO)
    if (atkDamage > 0 && attackerHasPoison) def.health = 0
    if (defDamage > 0 && defenderHasPoison) atk.health = 0
  
    // Robo de vida: cura al dueño por el daño que hace
    if (atkDamage > 0 && hasAbility(atk, Ability.ROBO_DE_VIDA)) {
      me.life += atkDamage
    }
    if (defDamage > 0 && hasAbility(def, Ability.ROBO_DE_VIDA)) {
      opp.life += defDamage
    }
  
    // Muertes y triggers ON_DEATH
    if (def.health <= 0) {
      const [dead] = opp.board.splice(defenderBoardIndex, 1)
      opp.graveyard.unshift(dead.cardId)
      notifyLeaveBattlefield(state, oppIndex, dead.id)
      notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
    }
    if (atk.health <= 0) {
      const [dead] = me.board.splice(attackerBoardIndex, 1)
      me.graveyard.unshift(dead.cardId)
      notifyLeaveBattlefield(state, attackerIndex, dead.id)
      notifyEffectTriggered(state, attackerIndex, dead.cardId, 'ON_DEATH')
    }
  
    // Exhaust atacante tras atacar si sigue vivo
  if (me.board[attackerBoardIndex]) {
    me.board[attackerBoardIndex].exhausted = true
  }

  // DOBLE_GOLPE: segundo impacto solo del atacante si ambos siguen presentes y defensor sigue en mesa
  if (hasAbility(atk, Ability.DOBLE_GOLPE)) {
    // Releer referencias actuales por si hubo cambios
    const atkNow = me.board[attackerBoardIndex]
    const defNow = opp.board[defenderBoardIndex]
    if (atkNow && defNow) {
      const dmg = atkNow.attack ?? 0

      // Escudo del defensor para el segundo golpe
      const defenderHasShield2 = hasAbility(defNow, Ability.ESCUDO)
      if (defenderHasShield2) {
        defNow.abilities = defNow.abilities.filter(a => a !== String(Ability.ESCUDO))
      } else {
        defNow.health -= dmg
        defNow.damagedThisTurn = true
      }
      // Veneno del atacante en el segundo golpe
      if (dmg > 0 && hasAbility(atkNow, Ability.VENENO)) defNow.health = 0

      // Robo de vida por el segundo golpe
      if (dmg > 0 && hasAbility(atkNow, Ability.ROBO_DE_VIDA)) {
        me.life += dmg
      }

      // Muerte del defensor tras segundo golpe
      if (defNow.health <= 0) {
        const [dead] = opp.board.splice(defenderBoardIndex, 1)
        opp.graveyard.unshift(dead.cardId)
        notifyLeaveBattlefield(state, oppIndex, dead.id)
        notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
      }
    }
  }

    // Prioridad después del combate
    notifyEffectTriggered(state, attackerIndex, atk.cardId, 'END_OF_TURN')
     triggerPriority(state, state.turn.phase)
      return { ok: true }

  }
  function createTokenFromValue(value: string): CreatureOnBoard | undefined {
    // ejemplos usados: TOKEN_2_2_PRISA, TOKEN_4_4_PRISA_LIFESTEAL
    const id = `token_${value}_${Date.now()}`
    if (value === 'TOKEN_2_2_PRISA') {
      return { id, cardId: 'TOKEN_2_2_PRISA', ownerId: '', attack: 2, health: 2, exhausted: false, abilities: [String(Ability.PRISA)] }
    }
    if (value === 'TOKEN_4_4_PRISA_LIFESTEAL') {
      return { id, cardId: 'TOKEN_4_4_PRISA_LIFESTEAL', ownerId: '', attack: 4, health: 4, exhausted: false, abilities: [String(Ability.PRISA), String(Ability.ROBO_DE_VIDA)] }
    }
    // DISCOVER_FROM_GRAVEYARD / RANDOM_BY_ENTROPY etc. requieren sistema avanzado (pendiente)
    return undefined
  }
  export function beginCombat(state: GameState): void {
    state.turn.phase = GamePhase.COMBAT
    onPriorityWindow(state, { phase: GamePhase.COMBAT, activePlayer: getCurrentPlayerIndex(state) })
  }
  export function endCombat(state: GameState): void {
    state.turn.phase = GamePhase.MAIN
    onPriorityWindow(state, { phase: GamePhase.MAIN, activePlayer: getCurrentPlayerIndex(state) })
  }
  
export type CardResolver = (id: string) => Card | undefined
let getCardByIdGlobal: CardResolver = () => undefined
export function setCardResolver(r: CardResolver) { getCardByIdGlobal = r }

function triggerBoardEffects(state: GameState, playerIndex: number, timing: EffectTiming) {
    const p = state.players[playerIndex]
    for (let i = 0; i < p.board.length; i++) {
      const ent = p.board[i]
      const card = getCardByIdGlobal(ent.cardId)
      if (!card || !card.effects) continue
      for (const eff of card.effects) {
        if (eff.timing !== timing) continue
        if (timing === EffectTiming.END_OF_TURN && eff.condition?.type === 'SELF_NOT_DAMAGED_THIS_TURN' && ent.damagedThisTurn) continue
        if (!effectConditionPasses(state, playerIndex, eff)) continue
  
        // Hints para targets SELF -> criatura actual
        const hints: TargetRef[] | undefined =
  eff.action?.target === EffectTarget.SELF
    ? ([{ type: 'CREATURE_SELF', index: i }] as TargetRef[])
    : undefined
  
        applyAction(state, playerIndex, eff.action, hints)
        notifyEffectTriggered(state, playerIndex, card.id, timing === EffectTiming.START_OF_TURN ? 'ON_PLAY' : 'END_OF_TURN')
      }
    }
  }

// helper: comprobar si ya hay espécimen en mesa
function hasSpecimenOnBoard(p: PlayerState): boolean {
  return p.board.some(e => e.cardId === 'SPECIMEN_TOKEN' || e.cardId === 'SPECIMEN_EVOLVED_TOKEN')
}

export function activateFinalStand(state: GameState, playerIndex: number): void {
    const p = state.players[playerIndex]
    p.maxLife = 10
    p.life = Math.min(p.life, 1)
  }