import { 
  GameState, 
  PlayerState, 
  CreatureOnBoard, 
  TargetRef, 
  TargetResolved,
  getCardByIdGlobal,
  playCard,
  onDiscoverRequest
} from './game-state'
import { Card, EffectTiming, EffectActionType, EffectTarget, getCurrentForm, CycleState } from '../types/cards'

import { CardType, Ability } from '../types/cards'
import { getOpponentPlayerIndex } from './turns'
import { notifyEffectTriggered, notifyLeaveBattlefield, notifyEnterBattlefield } from './priority'
import { hasAbility, canTargetCreature } from './combat'
import { hasSpecimenOnBoard, getSpecimenCost, summonSpecimenToken, handleSpecimenOnEnter, summonSpecimen } from './specimen'
import { checkAndActivateFinalStand, hasFinalStandImmunity } from './final-stand'
import { draw } from './turns' // solo si usas draw aquí
import { declareAttackCreature } from './combat'

// Si usas getCardByIdGlobal, asegúrate de que esté accesible (importa o declara externamente)
// declare const getCardByIdGlobal: (id: string) => Card | undefined;

// =======================
// Condición de efectos
// =======================
export function effectConditionPasses(state: GameState, playerIndex: number, eff: any): boolean {
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

// =======================
// Triggers de tablero
// =======================
export function triggerBoardEffects(state: GameState, playerIndex: number, timing: EffectTiming) {
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

// =======================
// Efectos ON_ENTER
// =======================
export function applyOnEnterEffects(
  state: GameState, 
  creature: CreatureOnBoard, 
  playerIndex: number, 
  card: Card
): void {
  if (card.effects) {
    for (const eff of card.effects) {
      if (eff.timing === EffectTiming.ON_ENTER && effectConditionPasses(state, playerIndex, eff)) {
        // Prioriza objetivos UI (pendingTargets); si no hay y el target es SELF, usa SELF
        const uiHints: TargetRef[] =
          state.pendingTargets && state.pendingTargets.length
            ? ([...(state.pendingTargets as TargetRef[])] as TargetRef[])
            : ([] as TargetRef[])
        const selfHints: TargetRef[] =
          eff.action?.target === EffectTarget.SELF
            ? ([{ type: 'CREATURE_SELF', index: state.players[playerIndex].board.length - 1 }] as TargetRef[])
            : ([] as TargetRef[])
        const hints: TargetRef[] = uiHints.length ? uiHints : selfHints
        applyAction(state, playerIndex, eff.action, hints)
      }
    }
    state.pendingTargets = []
  }
}

// =======================
// Aplicación de acciones
// =======================
export function applyAction(
  state: GameState,
  playerIndex: number,
  action: any,
  targetsHints?: TargetRef[]
) {
  const me = state.players[playerIndex]
  const oppIndex = getOpponentPlayerIndex(state)
  const opp = state.players[oppIndex]
  const pickHint = () => (targetsHints && targetsHints.length ? targetsHints.shift() : undefined)

  // Evita resolver target de forma global para acciones que no lo requieren
  const skipPreTarget = [
    EffectActionType.DISCOVER_PAY_LIFE,
    EffectActionType.DISCOVER_PAY_ENTROPY,
    EffectActionType.TRANSFORM,
    EffectActionType.SUMMON_SPECIMEN,
    EffectActionType.GAIN_ENTROPY,
    EffectActionType.CHANGE_CYCLE_STATE,
    EffectActionType.SUMMON_CREATURE,
    EffectActionType.DISCARD_CARDS,
    EffectActionType.ACTIVATE_ECLIPSE,
  ].includes(action.type as EffectActionType)

  // Si una rama quiere usar target, que lo pida explícitamente
  const preResolved = skipPreTarget ? undefined : resolveSingleTarget(state, playerIndex, action.target, pickHint())
  const ensureTarget = () => {
    const t = preResolved ?? resolveSingleTarget(state, playerIndex, action.target, pickHint())
    if (!t) return undefined
    if (t.kind === 'CREATURE') {
      const ownerIdx = t.playerIndex
      if (ownerIdx !== playerIndex) {
        const owner = state.players[ownerIdx]
        const cr = owner.board[t.index]
        if (cr && hasAbility(cr, Ability.SIGILO)) return undefined
      }
    }
    return t
  }

  if (action.consumeEntropy && action.consumeEntropy > 0 && String(action.value) !== 'RANDOM_BY_ENTROPY') {
    if (!consumeEntropy(state, playerIndex, action.consumeEntropy)) return
  }

  switch (action.type as EffectActionType) {
    case EffectActionType.DAMAGE: {
      // RANDOM_BY_ENTROPY: dispara 1 daño aleatorio N veces consumiendo 1 por disparo
      if (String(action.value) === 'RANDOM_BY_ENTROPY' && me.classResource?.type === 'ENTROPIA') {
        let shots = Math.min(10, me.classResource.amount ?? 0)
        while (shots-- > 0 && consumeEntropy(state, playerIndex, 1)) {
          if (opp.board.length > 0) {
            const idx = Math.floor(Math.random() * opp.board.length)
            const c = opp.board[idx]
            c.health -= (action.amount ?? 1)
            c.damagedThisTurn = true
            if (c.health <= 0) {
              const [dead] = opp.board.splice(idx, 1)
              opp.graveyard.unshift(dead.cardId)
              notifyLeaveBattlefield(state, oppIndex, dead.id)
              notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
            }
          } else {
            if (!hasFinalStandImmunity(state, oppIndex)) {
              const old = opp.life
              opp.life = Math.max(0, opp.life - (action.amount ?? 1))
              if (opp.life <= 0 && old > 0) {
                checkAndActivateFinalStand(state, oppIndex, playerIndex)
              }
            }
          }
        }
        break
      }

      // RANDOM_BY_ENTROPY_PLUS_2: N+2 disparos (previo discover paga entropía)
      if (String(action.value) === 'RANDOM_BY_ENTROPY_PLUS_2' && me.classResource?.type === 'ENTROPIA') {
        const base = Math.min(10, me.classResource.amount ?? 0)
        let shots = base + 2
        while (shots-- > 0) {
          if (opp.board.length > 0) {
            const idx = Math.floor(Math.random() * opp.board.length)
            const c = opp.board[idx]
            c.health -= (action.amount ?? 1)
            c.damagedThisTurn = true
            if (c.health <= 0) {
              const [dead] = opp.board.splice(idx, 1)
              opp.graveyard.unshift(dead.cardId)
              notifyLeaveBattlefield(state, oppIndex, dead.id)
              notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
            }
          } else {
            if (!hasFinalStandImmunity(state, oppIndex)) {
              const old = opp.life
              opp.life = Math.max(0, opp.life - (action.amount ?? 1))
              if (opp.life <= 0 && old > 0) checkAndActivateFinalStand(state, oppIndex, playerIndex)
            }
          }
        }
        break
      }

      const amount = action.amount ?? 0

      // ALL_CREATURES (ambos tableros) no requiere target
      if (action.target === EffectTarget.ALL_CREATURES) {
        const doBoard = (ownerIdx: number) => {
          const owner = state.players[ownerIdx]
          for (const c of owner.board) { c.health -= amount; c.damagedThisTurn = true }
          const kept: typeof owner.board = []
          for (const c of owner.board) {
            if (c.health > 0) kept.push(c)
            else {
              owner.graveyard.unshift(c.cardId)
              notifyLeaveBattlefield(state, ownerIdx, c.id)
              notifyEffectTriggered(state, ownerIdx, c.cardId, 'ON_DEATH')
            }
          }
          owner.board = kept
        }
        doBoard(playerIndex)
        doBoard(oppIndex)
        break
      }

      // RANDOM_CHARACTER no requiere target
      if (action.target === EffectTarget.RANDOM_CHARACTER) {
        const pool: Array<{ type: 'HERO' | 'CREATURE'; pi: number; bi?: number }> = [
          { type: 'HERO', pi: playerIndex }, { type: 'HERO', pi: oppIndex }
        ]
        me.board.forEach((_, i) => pool.push({ type: 'CREATURE', pi: playerIndex, bi: i }))
        opp.board.forEach((_, i) => pool.push({ type: 'CREATURE', pi: oppIndex, bi: i }))
        if (pool.length) {
          const pick = pool[Math.floor(Math.random() * pool.length)]
          if (pick.type === 'HERO') {
            const tgt = state.players[pick.pi]
            if (!hasFinalStandImmunity(state, pick.pi)) {
              const old = tgt.life
              tgt.life = Math.max(0, tgt.life - amount)
              if (tgt.life <= 0 && old > 0) checkAndActivateFinalStand(state, pick.pi, playerIndex)
            }
          } else if (pick.bi != null) {
            const owner = state.players[pick.pi]
            const cr = owner.board[pick.bi]
            if (cr) {
              cr.health -= amount
              cr.damagedThisTurn = true
              if (cr.health <= 0) {
                const [dead] = owner.board.splice(pick.bi, 1)
                owner.graveyard.unshift(dead.cardId)
                notifyLeaveBattlefield(state, pick.pi, dead.id)
                notifyEffectTriggered(state, pick.pi, dead.cardId, 'ON_DEATH')
              }
            }
          }
        }
        break
      }

      // Resto: usa target explícito (HERO / CREATURE / MULTI / RANDOM_ENEMY)
      const t = ensureTarget()
      if (!t) break

      if (t.kind === 'HERO') {
        const tgt = state.players[t.playerIndex]
        if (!hasFinalStandImmunity(state, t.playerIndex)) {
          const old = tgt.life
          tgt.life = Math.max(0, tgt.life - amount)
          if (tgt.life <= 0 && old > 0) {
            checkAndActivateFinalStand(state, t.playerIndex, playerIndex)
          }
        }
      } else if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (!cr) break
        cr.health -= amount
        cr.damagedThisTurn = true
        if (cr.health <= 0) {
          const [dead] = owner.board.splice(t.index, 1)
          owner.graveyard.unshift(dead.cardId)
          notifyLeaveBattlefield(state, t.playerIndex, dead.id)
          notifyEffectTriggered(state, t.playerIndex, dead.cardId, 'ON_DEATH')
        }
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) { c.health -= amount; c.damagedThisTurn = true }
        const ownerIdx = t.scope === 'FRIENDLY' ? playerIndex : oppIndex
        const owner = state.players[ownerIdx]
        const kept: typeof owner.board = []
        for (const c of owner.board) {
          if (c.health > 0) kept.push(c)
          else {
            owner.graveyard.unshift(c.cardId)
            notifyLeaveBattlefield(state, ownerIdx, c.id)
            notifyEffectTriggered(state, ownerIdx, c.cardId, 'ON_DEATH')
          }
        }
        owner.board = kept
      } else if (t.kind === 'RANDOM_ENEMY') {
        if (opp.board.length > 0) {
          const idx = Math.floor(Math.random() * opp.board.length)
          opp.board[idx].health -= amount
          opp.board[idx].damagedThisTurn = true
          if (opp.board[idx].health <= 0) {
            const [dead] = opp.board.splice(idx, 1)
            opp.graveyard.unshift(dead.cardId)
            notifyLeaveBattlefield(state, oppIndex, dead.id)
            notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
          }
        } else {
          if (!hasFinalStandImmunity(state, oppIndex)) {
            const old = opp.life
            opp.life = Math.max(0, opp.life - amount)
            if (opp.life <= 0 && old > 0) {
              checkAndActivateFinalStand(state, oppIndex, playerIndex)
            }
          }
        }
      }
      break
    }

    case EffectActionType.HEAL: {
      const amount = action.amount ?? 0
      const t = ensureTarget()
      if (!t) break

      if (t.kind === 'HERO') {
        const tgt = state.players[t.playerIndex]
        tgt.life = Math.min(tgt.maxLife, tgt.life + amount)
      } else if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr) cr.health += amount
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) c.health += amount
      }
      break
    }

    case EffectActionType.DRAW_CARDS: {
      const amount = action.amount ?? 1
      const t = ensureTarget()
      const pIdx = t?.kind === 'HERO' ? t.playerIndex : playerIndex
      for (let i = 0; i < Math.abs(amount); i++) {
        if (amount >= 0) draw(state, pIdx, 1)
        else state.players[pIdx].hand.shift()
      }
      break
    }

    case EffectActionType.DISCOVER_PAY_LIFE: {
      const baseCost = Number(action.options?.lifeCost ?? 0)
      const p = state.players[playerIndex]
      const available = p.lifeCredit != null ? p.lifeCredit : p.life
    
      const uiChoice = onDiscoverRequest(state, {
        playerIndex,
        options: [
          { id: 'BASE', label: 'Versión base' },
          { id: 'BUFF', label: baseCost > 0 ? `Potenciada (-${baseCost} vida)` : 'Potenciada' },
        ],
      })
    
      // Si hay crédito de vida y hay opción BUFF, fuerza BUFF
      const choice = (available >= baseCost && action.options?.buff) ? 'BUFF' : uiChoice
    
      if (choice === 'BUFF' && baseCost > 0) {
        if (available < baseCost) break
        if (p.lifeCredit != null) p.lifeCredit = Math.max(0, p.lifeCredit - baseCost)
        else p.life -= baseCost
      }
    
      if (choice === 'BUFF' && action.options?.buff) {
        applyAction(state, playerIndex, action.options.buff, targetsHints)
      } else if (action.options?.base) {
        applyAction(state, playerIndex, action.options.base, targetsHints)
      }
      break
    }

    case EffectActionType.DISCARD_CARDS: {
      const amount = action.amount ?? 1
      const t = ensureTarget()
      const pIdx = t?.kind === 'HERO' ? t.playerIndex : playerIndex
      if (amount > 0) {
        state.players[pIdx].hand.splice(0, Math.min(amount, state.players[pIdx].hand.length))
      } else if (amount < 0) {
        draw(state, pIdx, -amount)
      }
      break
    }

    case EffectActionType.SUMMON_CREATURE: {
      if (String(action.value) === 'RANDOM_BY_ENTROPY' && me.classResource?.type === 'ENTROPIA') {
        const ent = me.classResource.amount ?? 0
        const maxCost = ent >= 9 ? Infinity : (ent >= 6 ? 6 : (ent >= 3 ? 3 : 0))
        const tokenVal = maxCost >= 9 ? 'TOKEN_5_5' : maxCost >= 6 ? 'TOKEN_3_3' : maxCost >= 3 ? 'TOKEN_2_2' : 'TOKEN_1_1'
        const token = createTokenFromValue(tokenVal)
        if (token) {
          token.ownerId = me.id
          token.exhausted = true
          me.board.push(token)
          notifyEnterBattlefield(state, playerIndex, token.id)
        }
        break
      }
      const token = createTokenFromValue(String(action.value ?? 'TOKEN_1_1'))
      if (!token) break
      token.ownerId = me.id
      token.exhausted = true
      me.board.push(token)
      notifyEnterBattlefield(state, playerIndex, token.id)
      break
    }

    case EffectActionType.BUFF_ATTACK: {
      const amount = action.amount ?? 0
      const t = ensureTarget()
      if (!t) break
      if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr) cr.attack += amount
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) c.attack += amount
      }
      break
    }

    case EffectActionType.BUFF_HEALTH: {
      const amount = action.amount ?? 0
      const t = ensureTarget()
      if (!t) break
      if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr) cr.health += amount
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) c.health += amount
      }
      break
    }

    case EffectActionType.BUFF_STATS: {
      let addAtk = 0, addHp = 0
      const val = String(action.value ?? '')
      if (val === 'LIFE_DIFFERENTIAL') {
        const x = Math.max(0, (me.maxLife ?? 20) - me.life)
        addAtk = x; addHp = x
      } else {
        const m = val.match(/^\+?(-?\d+)\/\+?(-?\d+)$/)
        addAtk = m ? parseInt(m[1], 10) : 0
        addHp = m ? parseInt(m[2], 10) : 0
      }
      const t = ensureTarget()
      if (!t) break
      if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr) { cr.attack += addAtk; cr.health += addHp }
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) { c.attack += addAtk; c.health += addHp }
      }
      break
    }

    case EffectActionType.GAIN_ABILITY: {
      const abil = action.value as Ability
      const t = ensureTarget()
      if (!t) break
      if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr && !cr.abilities.includes(String(abil))) cr.abilities.push(String(abil))
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) if (!c.abilities.includes(String(abil))) c.abilities.push(String(abil))
      }
      break
    }

    case EffectActionType.LOSE_ABILITY: {
      const abil = action.value as Ability
      const t = ensureTarget()
      if (!t) break
      if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr) cr.abilities = cr.abilities.filter(a => a !== String(abil))
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) c.abilities = c.abilities.filter(a => a !== String(abil))
      }
      break
    }

    case EffectActionType.DISCOVER_PAY_ENTROPY: {
      const p = state.players[playerIndex]
      const baseCost = Number(action.options?.entropyCost ?? 0)
      const have = p.classResource?.type === 'ENTROPIA' ? (p.classResource.amount ?? 0) : 0
      const canPay = have >= baseCost
      console.log('[DISCOVER_PAY_ENTROPY] request', {
        playerIndex,
        entropy: state.players[playerIndex].classResource?.amount,
        base: action.options?.base,
        buff: action.options?.buff,
      })
      
      const choice = onDiscoverRequest(state, {
        playerIndex,
        options: [
          { id: 'BASE', label: 'Versión base' },
          { id: 'BUFF', label: canPay ? `Potenciada (-${baseCost} entropía)` : 'Potenciada (sin entropía suficiente)' },
        ],
      })
      
      console.log('[DISCOVER_PAY_ENTROPY] choice returned by UI:', choice)
      
      if (choice === 'BUFF') {
        if (!canPay || !consumeEntropy(state, playerIndex, baseCost)) {
          console.warn('[DISCOVER_PAY_ENTROPY] cannot pay entropy', { have, need: baseCost })
          break
        }
        console.log('[DISCOVER_PAY_ENTROPY] entropy paid', {
          newEntropy: state.players[playerIndex].classResource?.amount,
          paid: baseCost
        })
        if (action.options?.buff) {
          console.log('[DISCOVER_PAY_ENTROPY] applying BUFF action', action.options.buff)
          applyAction(state, playerIndex, action.options.buff, targetsHints)
        }
      } else {
        if (action.options?.base) {
          console.log('[DISCOVER_PAY_ENTROPY] applying BASE action', action.options.base)
          applyAction(state, playerIndex, action.options.base, targetsHints)
        }
      }
      break
    }

    case EffectActionType.CHANGE_CYCLE_STATE: {
      if (!me.classResource || me.classResource.type !== 'ESTADO') break
      const val = action.value
      if (val === 'PERMANENT_ECLIPSE') {
        me.permanentEclipse = true
        me.classResource.state = 'ECLIPSE'
      } else if (val === 'NEXT_CYCLE_STATE') {
        const cur = me.classResource.state
        me.classResource.state = cur === 'DIA' ? 'NOCHE' : (cur === 'NOCHE' ? 'ECLIPSE' : 'DIA')
      } else if (val === 'CHOOSE_DAY_OR_NIGHT') {
        me.classResource.state = 'DIA'
      } else if (typeof val === 'string') {
        me.classResource.state = val as any
      }
      for (let i = 0; i < me.board.length; i++) applyCycleFormToCreature(state, playerIndex, i)
      break
    }

    case EffectActionType.GAIN_ENTROPY: {
      if (me.classResource?.type === 'ENTROPIA') {
        me.classResource.amount = Math.min(10, (me.classResource.amount ?? 0) + (action.amount ?? 1))
      }
      break
    }

    case EffectActionType.ACTIVATE_ECLIPSE: {
      if (me.classResource?.type === 'ESTADO') {
        me.classResource.state = 'ECLIPSE'
      }
      break
    }

    case EffectActionType.SUMMON_SPECIMEN: {
      const p = state.players[playerIndex]
      if (p.classType !== 'ABOMINACION') break
      if (hasSpecimenOnBoard(p)) break

      const cost = getSpecimenCost(p)
      const hasFSBonus = !!p.freeSpecimenThisTurn
      const freeFlag = p.specimenFreeThisTurn || hasFSBonus
      const free = !!freeFlag

      if (!free) {
        if (p.mana < cost) break
      }

      const beforeMana = p.mana
      const ok = summonSpecimen(state, playerIndex)
      if (!ok) break

      if (free && p.mana < beforeMana) {
        p.mana = beforeMana
      }
      p.specimenFreeThisTurn = false
      break
    }

    case EffectActionType.TRANSFORM: {
      const v = String(action.value || '')
      const playAll = (passes: number) => {
        for (let pass = 0; pass < passes; pass++) {
          const snapshot = [...me.hand]
          for (const cid of snapshot) {
            const idxNow = me.hand.indexOf(cid)
            if (idxNow === -1) continue
            const card = getCardByIdGlobal(cid)
            if (!card) continue
            const targets = getRandomTargetsForCard(state, playerIndex, card)
            playCard(state, playerIndex, idxNow, getCardByIdGlobal, { targets })
          }
        }
      }
      if (v === 'PLAY_ALL_HAND_RANDOM_TARGETS') {
        playAll(1)
      } else if (v === 'PLAY_ALL_HAND_TWICE_RANDOM_TARGETS') {
        playAll(2)
      }
      break
    }

    case EffectActionType.ATTACK_SPELL: {
      const hintAtk = targetsHints?.find(h => h.type === 'CREATURE_SELF') as any
      const hintDef = targetsHints?.find(h => h.type === 'CREATURE_ENEMY') as any
      if (hintAtk && hintDef) {
        declareAttackCreature(state, playerIndex, hintAtk.index, hintDef.index)
      }
      break
    }
    

    default:
      break
  }

  notifyEffectTriggered(state, playerIndex, 'ACTION', 'ON_PLAY')
}

// =======================
// Resolución de targets
// =======================
export function resolveSingleTarget(
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
    case EffectTarget.SELF: {
      // Usa hint CREATURE_SELF si viene de ON_ENTER
      if (hint && hint.type === 'CREATURE_SELF' && me.board[hint.index]) {
        return { kind: 'CREATURE', playerIndex, index: hint.index }
      }
      return { kind: 'SELF' }
    }
    case EffectTarget.TARGET_SPELL:           return { kind: 'STACK_TOP_ENEMY' }
    default:                                  return undefined
  }
}

// =======================
// Entropía
// =======================
export function consumeEntropy(state: GameState, playerIndex: number, amount: number): boolean {
  const p = state.players[playerIndex]
  if (p.classResource?.type !== 'ENTROPIA') return false
  const have = p.classResource.amount ?? 0
  if (have < amount) return false
  p.classResource.amount = have - amount
  return true
}

export function gainEntropyOnPlay(player: PlayerState) {
  if (player.classResource?.type === 'ENTROPIA') {
    player.classResource.amount = Math.min(10, (player.classResource.amount ?? 0) + 1)
  }
}

export function createTokenFromValue(value: string): CreatureOnBoard | undefined {
  // ...lógica de creación de tokens...
  // Example placeholder implementation:
  // Replace this with your actual token creation logic.
  if (value) {
    return {
      id: `token_${value}`,
      cardId: value,
      ownerId: '',
      attack: 1,
      health: 1,
      exhausted: false,
      abilities: [],
      effects: [],
    }
  }
  return undefined;
}

// =======================
// Helper ciclo
// =======================

function applyCycleFormToCreature(state: GameState, ownerIdx: number, boardIndex: number) {
  const p = state.players[ownerIdx]
  const ent = p.board[boardIndex]
  const base = getCardByIdGlobal(ent.cardId)
  if (!base) return
  // Solo cartas ciclo
  if (!(base as any).dayForm) return
  const currentState = p.classResource?.state
  if (!currentState) return
  // Obtén forma actual
  const form = getCurrentForm(base as any, currentState as CycleState)
  // Ajusta ataque
  ent.attack = form.attack ?? 0
  // Ajusta vida manteniendo daño ya recibido (clamp a nuevo máximo si es menor)
  const newMax = form.health ?? ent.health
  if (ent.health > newMax) ent.health = newMax
  // Reemplaza habilidades por las de la forma
  ent.abilities = form.abilities ? form.abilities.map(a => String(a)) : []
}

// =======================
// Helper transform
// =======================


function getRandomTargetsForCard(state: GameState, playerIndex: number, card: Card): TargetRef[] {
  const me = state.players[playerIndex]
  const opp = state.players[1 - playerIndex]
  const hints: TargetRef[] = []

  if (!card.effects) return hints
  // Por cada efecto ON_PLAY que requiera objetivo, generamos un hint
  for (const eff of card.effects) {
    if (eff.timing !== EffectTiming.ON_PLAY) continue
    const tgt = eff.action?.target
    if (tgt === EffectTarget.TARGET_CREATURE) {
      if (opp.board.length > 0) {
        const i = Math.floor(Math.random() * opp.board.length)
        hints.push({ type: 'CREATURE_ENEMY', index: i })
      } else {
        hints.push({ type: 'HERO_ENEMY' })
      }
    } else if (tgt === EffectTarget.FRIENDLY_HERO) {
      hints.push({ type: 'HERO_SELF' })
    } else if (tgt === EffectTarget.ENEMY_HERO) {
      hints.push({ type: 'HERO_ENEMY' })
    } else if (tgt === EffectTarget.TARGET_SPELL) {
      // No hay pila (priority no-op), ignora
    } else if (tgt === EffectTarget.SELF) {
      // Nada que hacer (applyAction maneja SELF)
    } else if (tgt === EffectTarget.ALL_FRIENDLY_CREATURES || tgt === EffectTarget.ALL_ENEMY_CREATURES || tgt === EffectTarget.RANDOM_ENEMY) {
      // No requieren hints específicos
    }
  }
  return hints
}