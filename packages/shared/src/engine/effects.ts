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
import { hasSpecimenOnBoard, getSpecimenCost, summonSpecimenToken, handleSpecimenOnEnter, summonSpecimen, getUniqueAbilitiesFromGraveyard } from './specimen'
import { checkAndActivateFinalStand, hasFinalStandImmunity } from './final-stand'
import { draw } from './turns' // solo si usas draw aquí
import { declareAttackCreature } from './combat'

import { BASIC_CARDS } from '../cards/basic-cards'
// packages/shared/src/engine/effects.ts
import { CLASS_CARDS } from '../cards/class-cards'

function isCreatureCard(c: any): c is Card {
  return c && c.type === CardType.CREATURE
}
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
 if (c.type === 'GRAVEYARD_COUNT') {
   const n = state.players[playerIndex].graveyard.length
   if (c.comparison === 'EQUAL') return n === (c.value ?? 0)
   if (c.comparison === 'GREATER') return n > (c.value ?? 0)
   if (c.comparison === 'LESS') return n < (c.value ?? 0)
   if (c.comparison === 'GREATER_EQUAL') return n >= (c.value ?? 0)
   if (c.comparison === 'LESS_EQUAL') return n <= (c.value ?? 0)
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
        console.log('[ON_ENTER] applying', { cardId: card.id, effectId: eff.id })
       
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
        console.log('[ON_ENTER] hints', { hints, action: eff.action })
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
        // Suma el ATQ de tus criaturas y lo aplica al héroe indicado
        if (String(action.value) === 'SUM_FRIENDLY_ATTACK') {
          const sum = (state.players[playerIndex].board ?? []).reduce((s, c) => s + Math.max(0, c.attack ?? 0), 0)
          const targetPi = action.target === EffectTarget.ENEMY_HERO ? oppIndex : playerIndex
          if (!hasFinalStandImmunity(state, targetPi)) {
            const tgt = state.players[targetPi]
            const old = tgt.life
            tgt.life = Math.max(0, tgt.life - sum)
            if (tgt.life <= 0 && old > 0) checkAndActivateFinalStand(state, targetPi, playerIndex)
          }
          break
        }
      // RANDOM_BY_ENTROPY: N disparos completamente aleatorios (héroes y criaturas de ambos lados)
      if (String(action.value) === 'RANDOM_BY_ENTROPY' && action.target === EffectTarget.RANDOM_CHARACTER && me.classResource?.type === 'ENTROPIA') {
        let shots = Math.min(10, me.classResource.amount ?? 0)
        while (shots-- > 0 && consumeEntropy(state, playerIndex, 1)) {
          const pool: Array<{ kind: 'HERO' | 'CREATURE'; pi: number; bi?: number }> = [
            { kind: 'HERO', pi: playerIndex },
            { kind: 'HERO', pi: oppIndex }
          ]
          me.board.forEach((_, i) => pool.push({ kind: 'CREATURE', pi: playerIndex, bi: i }))
          opp.board.forEach((_, i) => pool.push({ kind: 'CREATURE', pi: oppIndex, bi: i }))
          if (!pool.length) break
          const pick = pool[Math.floor(Math.random() * pool.length)]
          if (pick.kind === 'HERO') {
            if (!hasFinalStandImmunity(state, pick.pi)) {
              const tgt = state.players[pick.pi]
              const old = tgt.life
              tgt.life = Math.max(0, tgt.life - (action.amount ?? 1))
              if (tgt.life <= 0 && old > 0) checkAndActivateFinalStand(state, pick.pi, playerIndex)
            }
          } else if (pick.kind === 'CREATURE' && pick.bi != null) {
            const owner = state.players[pick.pi]
            const cr = owner.board[pick.bi]
            if (cr) {
              cr.health -= (action.amount ?? 1)
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
        // REPEAT_N:x → repite x impactos de amount contra enemigos aleatorios
              // REPEAT_N:x → repite x impactos de amount contra enemigos aleatorios (héroe o criaturas)
      if (typeof action.value === 'string' && action.value.startsWith('REPEAT_N:') && action.target === EffectTarget.RANDOM_ENEMY) {
        const n = Math.max(0, parseInt(action.value.split(':')[1] ?? '0', 10) || 0)
        const amount = action.amount ?? 0
        for (let k = 0; k < n; k++) {
          // Construye pool con héroe enemigo + criaturas enemigas
          const pool: Array<{ kind: 'HERO' | 'CREATURE'; index?: number }> = [{ kind: 'HERO' }]
          for (let i = 0; i < opp.board.length; i++) pool.push({ kind: 'CREATURE', index: i })
          const pick = pool[Math.floor(Math.random() * pool.length)]

          if (pick.kind === 'CREATURE' && pick.index != null && opp.board[pick.index]) {
            const c = opp.board[pick.index]
            c.health -= amount
            c.damagedThisTurn = true
            if (c.health <= 0) {
              const [dead] = opp.board.splice(pick.index, 1)
              opp.graveyard.unshift(dead.cardId)
              notifyLeaveBattlefield(state, oppIndex, dead.id)
              notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
            }
          } else {
            if (!hasFinalStandImmunity(state, oppIndex)) {
              const old = opp.life
              opp.life = Math.max(0, opp.life - amount)
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

   // Dentro de applyAction(...) - bloque DISCOVER_PAY_LIFE completo
// packages/shared/src/engine/effects.ts (dentro de applyAction → DISCOVER_PAY_LIFE)
case EffectActionType.DISCOVER_PAY_LIFE: {
  const baseCost = Number(action.options?.lifeCost ?? 0)
  const p = state.players[playerIndex]
  const available = p.lifeCredit != null ? p.lifeCredit : p.life
  console.log('[DISCOVER_PAY_LIFE] options:', action.options)
  console.log('[DISCOVER_PAY_LIFE] available life/credit:', { life: p.life, credit: p.lifeCredit })
  let choice = onDiscoverRequest(state, {
    playerIndex,
    options: [
      { id: 'BASE', label: 'Versión base' },
      { id: 'BUFF', label: baseCost > 0 ? `Potenciada (-${baseCost} vida)` : 'Potenciada' },
    ],
  })
  console.log('[DISCOVER_PAY_LIFE] choice:', choice)

  if (choice === 'BUFF' && baseCost > 0) {
    console.log('[DISCOVER_PAY_LIFE] paying life:', baseCost)
    if (available < baseCost) break
    if (p.lifeCredit != null) p.lifeCredit = Math.max(0, p.lifeCredit - baseCost)
    else p.life -= baseCost
  }

  if (choice === 'BUFF' && action.options?.buff) {
    console.log('[DISCOVER_PAY_LIFE] applying BUFF ->', action.options.buff)
    applyAction(state, playerIndex, action.options.buff, targetsHints)
  } else if (action.options?.base) {
    console.log('[DISCOVER_PAY_LIFE] applying BASE ->', action.options.base)
    applyAction(state, playerIndex, action.options.base, targetsHints)
  }
  break
}

    case EffectActionType.REDUCE_CARD_COST: {
      const me = state.players[playerIndex]
      const ent = me.classResource?.type === 'ENTROPIA' ? (me.classResource.amount ?? 0) : 0

      let remaining: number | 'ALL' = 0
      const cfg = (action.options && (action.options as any).thresholds) as Array<{ min: number, uses: number | 'ALL' }> | undefined
      if (cfg && cfg.length) {
        const hit = [...cfg].sort((a,b) => a.min - b.min).filter(t => ent >= t.min).pop()
        remaining = hit ? hit.uses : 0
      } else {
        if (ent >= 8) remaining = 'ALL'
        else if (ent >= 4) remaining = 2
        else if (ent >= 2) remaining = 1
      }
      const amountAbs = Math.abs(action.amount ?? 0) || 0
      if (remaining === 0 || amountAbs === 0) break

      me.cardCostReduction = { amount: amountAbs, remaining }
      me.cardCostReductionSkipOnce = true       // ← no consumir en esta misma carta
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

    // dentro de applyAction(...)
    case EffectActionType.SUMMON_CREATURE: {
      const val = String(action.value ?? '')

      // Soporte: invocación aleatoria por coste exacto → 'RANDOM_COST:X'
      if (val.startsWith('RANDOM_COST:')) {
        const n = Math.max(0, parseInt(val.split(':')[1] ?? '0', 10) || 0)
        const pool = [...BASIC_CARDS, ...CLASS_CARDS]
          .filter(isCreatureCard)
          .filter(c => (c.mana ?? 0) === n)

        if (!pool.length) break
        const ref = pool[Math.floor(Math.random() * pool.length)]
        const entity: CreatureOnBoard = {
          id: `creature-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
          cardId: ref.id,
          ownerId: me.id,
          attack: ref.attack ?? 0,
          health: ref.health ?? 1,
          exhausted: !(ref.abilities?.includes(Ability.PRISA)),
          abilities: ref.abilities ? ref.abilities.map(a => String(a)) : [],
          effects: [],
        }
        me.board.push(entity)
        notifyEnterBattlefield(state, playerIndex, entity.id)
        break
      }

      const ref = getCardByIdGlobal(val)
      if (!ref) {
        console.warn('[SUMMON_CREATURE] cardId not found in catalog:', val)
        break
      }
      const entity: CreatureOnBoard = {
        id: `creature-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
        cardId: ref.id,
        ownerId: me.id,
        attack: ref.attack ?? 0,
        health: ref.health ?? 1,
        exhausted: !(ref.abilities?.includes(Ability.PRISA)),
        abilities: ref.abilities ? ref.abilities.map(a => String(a)) : [],
        effects: [],
      }
      me.board.push(entity)
      notifyEnterBattlefield(state, playerIndex, entity.id)
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
      console.log('[BUFF_STATS] start', { value: val })
      if (val === 'UNIQUE_ABILITIES_IN_GRAVEYARD') {
        const gy = state.players[playerIndex].graveyard
        console.log('[BUFF_STATS][UAG] graveyard ids:', gy)
        const set = new Set<string>()
        for (const cid of gy) {
          const cc = getCardByIdGlobal(cid)
          if (cc && cc.type === CardType.CREATURE && Array.isArray(cc.abilities)) {
            for (const ab of cc.abilities) set.add(String(ab))
          }
        }
        const x = set.size
        console.log('[BUFF_STATS][UAG] uniqueAbilitiesCount:', x, 'abilities:', Array.from(set))
        addAtk = x; addHp = x
      } else if (val === 'LIFE_DIFFERENTIAL') {
        const x = Math.max(0, (me.maxLife ?? 20) - me.life)
        addAtk = x; addHp = x
      } else {
        const m = val.match(/^\+?(-?\d+)\/\+?(-?\d+)$/)
        addAtk = m ? parseInt(m[1], 10) : 0
        addHp = m ? parseInt(m[2], 10) : 0
      }
      const t = ensureTarget()
      console.log('[BUFF_STATS] target resolved:', t, 'add', { atk: addAtk, hp: addHp })
      if (!t) break
      if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr) {
          const before = { atk: cr.attack, hp: cr.health }
          cr.attack += addAtk
          cr.health += addHp
          console.log('[BUFF_STATS] applied to CREATURE', { before, add: { atk: addAtk, hp: addHp }, after: { atk: cr.attack, hp: cr.health } })
        }
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        console.log('[BUFF_STATS] applying to MULTI', { scope: t.scope, count: list.length })
        for (const c of list) { c.attack += addAtk; c.health += addHp }
      }
      break
    }
    case EffectActionType.GAIN_ABILITY: {
      const val = String(action.value ?? '')
      const t = ensureTarget()
      if (!t) break

      // Especial: heredar TODAS las habilidades únicas de TODOS los cementerios (ambos jugadores)
      if (val === 'INHERIT_FROM_GRAVEYARD') {
        const gather = (pi: number) => {
          const set = new Set<string>()
          for (const cid of state.players[pi].graveyard) {
            const card = getCardByIdGlobal(cid)
            if (card && card.type === CardType.CREATURE && card.abilities) {
              for (const ab of card.abilities) set.add(String(ab))
            }
          }
          return Array.from(set)
        }
        const inherited = Array.from(new Set([...gather(0), ...gather(1)]))

        const applyTo = (c: any) => {
          for (const ab of inherited) {
            if (!c.abilities.includes(String(ab))) c.abilities.push(String(ab))
          }
        }

        if (t.kind === 'CREATURE') {
          const owner = state.players[t.playerIndex]
          const cr = owner.board[t.index]
          if (cr) applyTo(cr)
        } else if (t.kind === 'MULTI') {
          const list = t.scope === 'FRIENDLY' ? me.board : opp.board
          for (const c of list) applyTo(c)
        }
        break
      }

      // Comportamiento normal: añadir una habilidad concreta
      const abil = val as Ability
      if (t.kind === 'CREATURE') {
        const owner = state.players[t.playerIndex]
        const cr = owner.board[t.index]
        if (cr && !cr.abilities.includes(String(abil))) {
          cr.abilities.push(String(abil))
          if (abil === Ability.PRISA) cr.exhausted = false
        }
      } else if (t.kind === 'MULTI') {
        const list = t.scope === 'FRIENDLY' ? me.board : opp.board
        for (const c of list) {
          if (!c.abilities.includes(String(abil))) c.abilities.push(String(abil))
          if (abil === Ability.PRISA) c.exhausted = false
        }
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

    // Dentro de applyAction(...) - bloque DISCOVER_PAY_ENTROPY completo
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
  
  let choice = onDiscoverRequest(state, {
    playerIndex,
    options: [
      { id: 'BASE', label: 'Versión base' },
      { id: 'BUFF', label: canPay ? `Potenciada (-${baseCost} entropía)` : 'Potenciada (sin entropía suficiente)' },
    ],
  })

  if (p.forceDiscoverBuff) choice = 'BUFF'

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
    me.manualCycleChangedThisTurn = true
  } else if (val === 'NEXT_CYCLE_STATE') {
    const cur = me.classResource.state
    me.classResource.state = cur === 'DIA' ? 'NOCHE' : (cur === 'NOCHE' ? 'ECLIPSE' : 'DIA')
    me.manualCycleChangedThisTurn = true
  } else if (val === 'CHOOSE_DAY_OR_NIGHT') {
    me.classResource.state = 'DIA'
    me.manualCycleChangedThisTurn = true
  } else if (typeof val === 'string') {
    me.classResource.state = val as any
    me.manualCycleChangedThisTurn = true
  }
  // Reaplicar formas solo si la carta lo pide
  for (let i = 0; i < me.board.length; i++) {
    const ent = me.board[i]
    const base: any = getCardByIdGlobal(ent.cardId)
    if (base && base.dayForm && base.transformsWithCycle === true) {
      applyCycleFormToCreature(state, playerIndex, i)
    }
  }
  applyGuardianAura(state, playerIndex)
  break
}

    case EffectActionType.GAIN_ENTROPY: {
      if (me.classResource?.type === 'ENTROPIA') {
        const before = me.classResource.amount ?? 0
        me.classResource.amount = Math.min(10, before + (action.amount ?? 1))
        console.log('[ENTROPIA] GAIN_ENTROPY', { playerIndex, before, delta: (action.amount ?? 1), after: me.classResource.amount })
      } else {
        console.log('[ENTROPIA] GAIN_ENTROPY ignored (no ENTROPIA)', { playerIndex, classType: me.classType })
      }
      break
    }

    case EffectActionType.ACTIVATE_ECLIPSE: {
      if (me.classResource?.type === 'ESTADO') {
        me.classResource.state = 'ECLIPSE'
        me.manualCycleChangedThisTurn = true
        // Reaplicar formas solo si la carta lo pide
        for (let i = 0; i < me.board.length; i++) {
          const ent = me.board[i]
          const base: any = getCardByIdGlobal(ent.cardId)
          if (base && base.dayForm && base.transformsWithCycle === true) {
            applyCycleFormToCreature(state, playerIndex, i)
          }
        }
        applyGuardianAura(state, playerIndex)
      }
      break
    }
    case EffectActionType.SUMMON_SPECIMEN: {
      const p = state.players[playerIndex]
      if (p.classType !== 'ABOMINACION') break
    
   
    
      // Evolución definitiva
      if (String(action.value) === 'ULTIMATE_EVOLUTION_10_10') {
        const idx = p.board.findIndex(e => e.cardId === 'Especimen_Perfecto')
        if (idx === -1) break
        const [dead] = p.board.splice(idx, 1)
        p.graveyard.unshift(dead.cardId)
        notifyLeaveBattlefield(state, playerIndex, dead.id)
        notifyEffectTriggered(state, playerIndex, dead.cardId, 'ON_DEATH')
    
        const evolved = getCardByIdGlobal('Especimen_Perfecto_Evolucionado')
        if (evolved) {
          const ent = {
            id: `specimen-evolved-${Date.now()}`,
            cardId: evolved.id,
            ownerId: p.id,
            attack: evolved.attack ?? 10,
            health: evolved.health ?? 10,
            exhausted: true,
            abilities: evolved.abilities ? evolved.abilities.map(a => String(a)) : [],
            effects: [],
          }
          p.board.push(ent)
          notifyEnterBattlefield(state, playerIndex, ent.id)
          applyOnEnterEffects(state, ent as any, playerIndex, evolved)
        }
        break
      }
    
      // Caso especial de tu carta: invoca gratis y luego buffea
      if (String(action.value) === 'IMMEDIATE_SUMMON_WITH_SCALING') {
        if (hasSpecimenOnBoard(p)) break
        const prevFree = !!p.specimenFreeThisTurn
        p.specimenFreeThisTurn = true
        const ok = summonSpecimen(state, playerIndex)
        p.specimenFreeThisTurn = prevFree
        if (!ok) break
    
        // Busca el espécimen recién invocado
        let bi = -1
        for (let i = p.board.length - 1; i >= 0; i--) {
          if (p.board[i].cardId === 'Especimen_Perfecto') { bi = i; break }
        }
        if (bi >= 0) {
          // Cuenta habilidades únicas en ambos cementerios y aplica +X/+X
          const gather = (pi: number) => {
            const set = new Set<string>()
            for (const cid of state.players[pi].graveyard) {
              const card = getCardByIdGlobal(cid)
              if (card && card.type === CardType.CREATURE && card.abilities) {
                for (const ab of card.abilities) set.add(String(ab))
              }
            }
            return set
          }
          const set = new Set<string>([
            ...gather(playerIndex),
            ...gather(getOpponentPlayerIndex(state))
          ])
          const x = set.size
          const ent = p.board[bi]
          ent.attack += x
          ent.health += x
        }
        break
      }
    
      // Invocación normal (botón de clase)
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
    case EffectActionType.DISCOVER_SUMMON_FROM_GRAVEYARD: {
      const count = 3

      // Excluir G4BR13L y variantes del pool
      const specimenIds = new Set([
        'Especimen_Perfecto',
        'Especimen_Perfecto_Final_Stand',
        'Especimen_Perfecto_Evolucionado',
        'SPECIMEN_TOKEN',
        'SPECIMEN_EVOLVED_TOKEN'
      ])

      // Pool único de criaturas en ambos cementerios
      const poolSet = new Set<string>()
      for (const pi of [playerIndex, getOpponentPlayerIndex(state)]) {
        for (const cid of state.players[pi].graveyard) {
          const c = getCardByIdGlobal(cid)
          if (c && c.type === 'CREATURE' && !specimenIds.has(c.id)) {
            poolSet.add(c.id)
          }
        }
      }
      const pool = Array.from(poolSet)
      if (!pool.length) break

      // Barajar y tomar hasta 3 únicas
      const shuffled = [...pool]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t
      }
      const picks = shuffled.slice(0, Math.min(count, shuffled.length))

      // Invocar y ejecutar ON_ENTER con hints aleatorios
      for (const cid of picks) {
        const ref = getCardByIdGlobal(cid)
        if (!ref) continue
        const ent = {
          id: `summoned-${cid}-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
          cardId: ref.id,
          ownerId: state.players[playerIndex].id,
          attack: ref.attack ?? 0,
          health: ref.health ?? 1,
          exhausted: !(ref.abilities?.includes(Ability.PRISA)),
          abilities: ref.abilities ? ref.abilities.map(a => String(a)) : [],
          effects: []
        }
        const bi = state.players[playerIndex].board.push(ent) - 1
        notifyEnterBattlefield(state, playerIndex, ent.id)

        if (Array.isArray(ref.effects)) {
          for (const eff of ref.effects) {
            if (eff.timing !== EffectTiming.ON_ENTER || !eff.action) continue
            const hints = getRandomHintsForAction(state, playerIndex, eff.action)
            const fixedHints = hints?.length ? hints : [{ type: 'CREATURE_SELF', index: bi }] as any
            applyAction(state, playerIndex, eff.action, fixedHints)
          }
        }
      }
      break
    }

    case EffectActionType.DAMAGE_AND_SUMMON_SAME_COST_IF_KILL: {
      const amount = action.amount ?? 0
      const t = ensureTarget()
      if (!t) break
    
      if (t.kind === 'CREATURE') {
        const ownerIdx = t.playerIndex
        const owner = state.players[ownerIdx]
        const cr = owner.board[t.index]
        if (!cr) break
    
        const killedCardRef = getCardByIdGlobal(cr.cardId)
        const killedMana = killedCardRef?.mana ?? 0
    
        cr.health -= amount
        cr.damagedThisTurn = true
    
        if (cr.health <= 0) {
          const [dead] = owner.board.splice(t.index, 1)
          owner.graveyard.unshift(dead.cardId)
          notifyLeaveBattlefield(state, ownerIdx, dead.id)
          notifyEffectTriggered(state, ownerIdx, dead.cardId, 'ON_DEATH')
    
          const myClass = state.players[playerIndex].classType
          const oppClass = state.players[getOpponentPlayerIndex(state)].classType
          const allowed = new Set([myClass, oppClass])
    
          const pool = [
            ...BASIC_CARDS,
            ...CLASS_CARDS.filter(c => c.classType && allowed.has(c.classType as any))
          ]
            .filter(isCreatureCard)
            .filter(c => (c.mana ?? 0) === killedMana)
    
          if (pool.length > 0) {
            const ref = pool[Math.floor(Math.random() * pool.length)]
            const entity: CreatureOnBoard = {
              id: `creature-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
              cardId: ref.id,
              ownerId: me.id,
              attack: ref.attack ?? 0,
              health: ref.health ?? 1,
              exhausted: !(ref.abilities?.includes(Ability.PRISA)),
              abilities: ref.abilities ? ref.abilities.map(a => String(a)) : [],
              effects: [],
            }
            me.board.push(entity)
            notifyEnterBattlefield(state, playerIndex, entity.id)

            const bi = me.board.length - 1
            const refEffects = getCardByIdGlobal(ref.id)?.effects
            if (Array.isArray(refEffects)) {
              for (const eff of refEffects) {
                if (eff.timing !== EffectTiming.ON_ENTER || !eff.action) continue
                const hints = getRandomHintsForAction(state, playerIndex, eff.action)
                const fixedHints = hints?.length ? hints : [{ type: 'CREATURE_SELF', index: bi }] as any
                applyAction(state, playerIndex, eff.action, fixedHints)
              }
            }
          }
        }
      }
      break
    }

   // Dentro de applyAction(...) - sección TRANSFORM completa con cartas gratis + BUFF forzado
case EffectActionType.TRANSFORM: {
  const v = String(action.value || '')
  const playAll = (passes: number) => {
    const savedRed = me.cardCostReduction
    const savedSkip = me.cardCostReductionSkipOnce
    const savedForce = me.forceDiscoverBuff

    // Jugar todas las cartas gratis y forzar BUFF en discovers durante esta resolución
    me.cardCostReduction = { amount: 99, remaining: 'ALL' }
    me.cardCostReductionSkipOnce = true
    me.forceDiscoverBuff = true

    try {
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
    } finally {
      me.cardCostReduction = savedRed
      me.cardCostReductionSkipOnce = savedSkip
      me.forceDiscoverBuff = savedForce
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
case EffectActionType.REUSE_RANDOM_PAST_CHAOS_EFFECT: {
  const pool = state.players[playerIndex].playedChaosEffects ?? []
  if (!pool.length) break
  const pick = pool[Math.floor(Math.random() * pool.length)]
  const hints = getRandomHintsForAction(state, playerIndex, pick)
  applyAction(state, playerIndex, pick, hints)
  break
}

// NUEVO: destruye todas las criaturas excepto a sí mismo y absorbe sus stats
// NUEVO: destruye todas las criaturas excepto a sí mismo y absorbe sus stats
case EffectActionType.BOARD_NUKE_AND_ABSORB: {
  // En ON_ENTER el Avatar acaba de ser pusheado al final de la mesa del jugador
  const selfOwnerIdx = playerIndex
  const selfIdx = Math.max(0, state.players[selfOwnerIdx].board.length - 1)

  let totalAtk = 0
  let totalHp = 0

  const processOwner = (ownerIdx: number) => {
    const owner = state.players[ownerIdx]
    const survivors: typeof owner.board = []
    for (let i = 0; i < owner.board.length; i++) {
      const ent = owner.board[i]
      const isSelf = (ownerIdx === selfOwnerIdx && i === selfIdx)
      if (isSelf) {
        survivors.push(ent)
        continue
      }
      totalAtk += Math.max(0, ent.attack ?? 0)
      totalHp += Math.max(0, ent.health ?? 0)
      owner.graveyard.unshift(ent.cardId)
      notifyLeaveBattlefield(state, ownerIdx, ent.id)
      notifyEffectTriggered(state, ownerIdx, ent.cardId, 'ON_DEATH')
    }
    owner.board = survivors
  }

  processOwner(playerIndex)
  processOwner(oppIndex)

  const selfOwner = state.players[selfOwnerIdx]
  const avatar = selfOwner.board[Math.min(selfIdx, selfOwner.board.length - 1)]
  if (avatar) {
    avatar.attack = totalAtk
    avatar.health = Math.max(1, totalHp)
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
      // ← nuevo: permitir targetear al héroe enemigo cuando la UI lo pida
      if (hint.type === 'HERO_ENEMY') {
        return { kind: 'HERO', playerIndex: getOpponentPlayerIndex(state) }
      }
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
    case EffectTarget.TARGET_FRIENDLY_CREATURE: {
      // Requiere un hint que apunte a una criatura aliada
      if (hint && hint.type === 'CREATURE_SELF' && me.board[hint.index]) {
        return { kind: 'CREATURE', playerIndex, index: hint.index }
      }
      if (hint && hint.type === 'ANY_CREATURE' && (hint as any).owner === 'SELF' && me.board[hint.index]) {
        return { kind: 'CREATURE', playerIndex, index: hint.index }
      }
      return undefined
    }
    case EffectTarget.ALL_FRIENDLY_CREATURES: return { kind: 'MULTI', scope: 'FRIENDLY' }
    case EffectTarget.ALL_ENEMY_CREATURES:    return { kind: 'MULTI', scope: 'ENEMY' }
    case EffectTarget.RANDOM_ENEMY:           return { kind: 'RANDOM_ENEMY' }
    case EffectTarget.RANDOM_CREATURE: {
      // Resuelve a una criatura concreta aleatoria entre ambas mesas
      const pool: Array<{ pi: number; bi: number }> = []
      me.board.forEach((_, i) => pool.push({ pi: playerIndex, bi: i }))
      opp.board.forEach((_, i) => pool.push({ pi: getOpponentPlayerIndex(state), bi: i }))
      if (!pool.length) return undefined
      const pick = pool[Math.floor(Math.random() * pool.length)]
      return { kind: 'CREATURE', playerIndex: pick.pi, index: pick.bi }
    }
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
  if (!value) return undefined
  console.log('[createTokenFromValue] value:', value)
  switch (String(value)) {
    case 'TOKEN_2_2_PRISA':
      return {
        id: `token_${value}_${Date.now()}`,
        cardId: value,
        ownerId: '',
        attack: 2,
        health: 2,
        exhausted: false,
        abilities: [String(Ability.PRISA)],
        effects: [],
      }
    case 'TOKEN_4_4_PRISA_LIFESTEAL':
      return {
        id: `token_${value}_${Date.now()}`,
        cardId: value,
        ownerId: '',
        attack: 4,
        health: 4,
        exhausted: false,
        abilities: [String(Ability.PRISA), String(Ability.ROBO_DE_VIDA)],
        effects: [],
      }
    default:
      return {
        id: `token_${value}_${Date.now()}`,
        cardId: value,
        ownerId: '',
        attack: 1,
        health: 1,
        exhausted: false,
        abilities: [],
        effects: [],
      }
  }
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




export function getRandomHintsForAction(state: GameState, playerIndex: number, action: any): TargetRef[] {
  const me = state.players[playerIndex]
  const oppIdx = (playerIndex === 0 ? 1 : 0)
  const opp = state.players[oppIdx]
  const hints: TargetRef[] = []

  switch (action?.target) {
    case EffectTarget.TARGET_CREATURE: {
      if (opp.board.length > 0) {
        const i = Math.floor(Math.random() * opp.board.length)
        hints.push({ type: 'CREATURE_ENEMY', index: i } as any)
      } else {
        hints.push({ type: 'HERO_ENEMY' } as any)
      }
      break
    }
   case EffectTarget.TARGET_FRIENDLY_CREATURE: {
     if (me.board.length > 0) {
       const i = Math.floor(Math.random() * me.board.length)
       hints.push({ type: 'CREATURE_SELF', index: i } as any)
     }
     break
   }
    case EffectTarget.ALL_FRIENDLY_CREATURES:
    case EffectTarget.ALL_ENEMY_CREATURES:
    case EffectTarget.ALL_CREATURES:
    case EffectTarget.RANDOM_ENEMY:
    case EffectTarget.RANDOM_CREATURE:
    case EffectTarget.RANDOM_CHARACTER:
    case EffectTarget.FRIENDLY_HERO:
    case EffectTarget.ENEMY_HERO:
    case EffectTarget.SELF:
    default:
      break
  }
  return hints
}
export function applyGuardianAura(state: GameState, playerIndex: number) {
  const me = state.players[playerIndex]
  // Cuenta cuántos Guardian_del_Equilibrio controlas
  const stacks = me.board.filter(ent => getCardByIdGlobal(ent.cardId)?.id === 'Guardian_del_Equilibrio').length
  // Quita aura previa si existía
  const prev = me.cycleAuraApplied ?? null
  const prevStacks = me.cycleAuraStacks ?? 0
  // Si no cambia nada, no toques stats
  if (prev === (me.classResource?.state === 'DIA' ? 'DIA' : me.classResource?.state === 'NOCHE' ? 'NOCHE' : null)
      && prevStacks === stacks) return
  if (prev && prevStacks > 0) {
    const [atkOff, hpOff] = prev === 'DIA' ? [2 * prevStacks, 0] : [0, 2 * prevStacks]
    for (const c of me.board) {
      c.attack -= atkOff
      c.health -= hpOff
    }
  }
  // Define nueva aura según estado actual (solo Día/Noche)
  const stateNow = me.classResource?.state
  const nextAura: 'DIA' | 'NOCHE' | null = stateNow === 'DIA' ? 'DIA' : (stateNow === 'NOCHE' ? 'NOCHE' : null)

  if (nextAura && stacks > 0) {
    const [atkOn, hpOn] = nextAura === 'DIA' ? [2 * stacks, 0] : [0, 2 * stacks]
    for (const c of me.board) {
      c.attack += atkOn
      c.health += hpOn
    }
    me.cycleAuraApplied = nextAura
    me.cycleAuraStacks = stacks
  } else {
    me.cycleAuraApplied = null
    me.cycleAuraStacks = 0
  }
}
export function triggerTriggeredEffects(state: GameState, playerIndex: number): void {
  const p = state.players[playerIndex]
  for (let i = 0; i < p.board.length; i++) {
    const ent = p.board[i]
    const card = getCardByIdGlobal(ent.cardId)
    if (!card || !card.effects) continue
    for (const eff of card.effects) {
      if (eff.timing !== EffectTiming.TRIGGERED) continue
      if (!effectConditionPasses(state, playerIndex, eff)) continue
      const hints: TargetRef[] | undefined =
        eff.action?.target === EffectTarget.SELF
          ? ([{ type: 'CREATURE_SELF', index: i }] as TargetRef[])
          : undefined
      applyAction(state, playerIndex, eff.action, hints)
      notifyEffectTriggered(state, playerIndex, card.id, 'ON_PLAY')
    }
  }
}