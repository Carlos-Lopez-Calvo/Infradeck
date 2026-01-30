/**
 * EFECTOS DE ABOMINACIÓN 🧬
 * Efectos específicos de la clase Abominación:
 * - SUMMON_SPECIMEN
 * - DISCOVER_SUMMON_FROM_GRAVEYARD
 * - DAMAGE_AND_SUMMON_SAME_COST_IF_KILL
 */

import { EffectContext } from './core'
import { EffectActionType, CardType, EffectTiming, Ability } from '../../types/cards'
import { getCardByIdGlobal, CreatureOnBoard } from '../game-state'
import { 
  hasSpecimenOnBoard, 
  getSpecimenCost, 
  summonSpecimen, 
  getUniqueAbilitiesFromGraveyard 
} from '../specimen'
import { notifyEnterBattlefield, notifyLeaveBattlefield, notifyEffectTriggered } from '../priority'
import { applyOnEnterEffects, getRandomHintsForAction } from './board-effects'
import { applyAction as dispatchAction } from './dispatcher'
import { resolveSingleTarget } from './global-effects'
import { BASIC_CARDS } from '../../cards/basic-cards'
import { CLASS_CARDS } from '../../cards/class-cards'

// ===== HELPERS =====

function isCreatureCard(c: any): boolean {
  return c && c.type === CardType.CREATURE
}

// ===== HANDLERS DE EFECTOS DE ABOMINACIÓN =====

/**
 * SUMMON_SPECIMEN - Invocar el Espécimen Perfecto
 * Variantes:
 * - Normal: invocación estándar con coste escalado
 * - IMMEDIATE_SUMMON_WITH_SCALING: invoca gratis y buffea con habilidades únicas
 * - ULTIMATE_EVOLUTION_10_10: evoluciona el espécimen base a 10/10
 */
export function handleSummonSpecimen(ctx: EffectContext): void {
  const { state, playerIndex, me, action } = ctx
  
  if (me.classType !== 'ABOMINACION') {
    console.warn('[SUMMON_SPECIMEN] player is not ABOMINACION')
    return
  }
  
  const val = String(action.value ?? '')
  
  console.log('[SUMMON_SPECIMEN] start', { value: val })
  
  // CASO 1: Evolución definitiva 10/10
  if (val === 'ULTIMATE_EVOLUTION_10_10') {
    const idx = me.board.findIndex(e => e.cardId === 'Especimen_Perfecto')
    if (idx === -1) {
      console.log('[SUMMON_SPECIMEN] no Especimen_Perfecto to evolve')
      return
    }
    
    // Sacrificar el espécimen base
    const [dead] = me.board.splice(idx, 1)
    me.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, playerIndex, dead.id)
    notifyEffectTriggered(state, playerIndex, dead.cardId, 'ON_DEATH')
    
    console.log('[SUMMON_SPECIMEN] sacrificed Especimen_Perfecto')
    
    // Invocar versión evolucionada
    const evolved = getCardByIdGlobal('Especimen_Perfecto_Evolucionado')
    if (evolved) {
      const ent: CreatureOnBoard = {
        id: `specimen-evolved-${Date.now()}`,
        cardId: evolved.id,
        ownerId: me.id,
        attack: evolved.attack ?? 10,
        health: evolved.health ?? 10,
        exhausted: true,
        abilities: evolved.abilities ? evolved.abilities.map(a => String(a)) : [],
        effects: [],
      }
      me.board.push(ent)
      notifyEnterBattlefield(state, playerIndex, ent.id)
      applyOnEnterEffects(state, ent, playerIndex, evolved)
      
      console.log('[SUMMON_SPECIMEN] summoned Especimen_Perfecto_Evolucionado (10/10)')
    }
    return
  }
  
  // CASO 2: Invocación gratis con buffeo inmediato
  if (val === 'IMMEDIATE_SUMMON_WITH_SCALING') {
    if (hasSpecimenOnBoard(me)) {
      console.log('[SUMMON_SPECIMEN] specimen already on board')
      return
    }
    
    // Invocar gratis
    const prevFree = !!me.specimenFreeThisTurn
    me.specimenFreeThisTurn = true
    const ok = summonSpecimen(state, playerIndex)
    me.specimenFreeThisTurn = prevFree
    
    if (!ok) {
      console.log('[SUMMON_SPECIMEN] failed to summon')
      return
    }
    
    // Buscar el espécimen recién invocado
    let specimenIdx = -1
    for (let i = me.board.length - 1; i >= 0; i--) {
      if (me.board[i].cardId === 'Especimen_Perfecto') {
        specimenIdx = i
        break
      }
    }
    
    if (specimenIdx >= 0) {
      // Contar habilidades únicas en ambos cementerios
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
        ...gather(ctx.oppIndex)
      ])
      const x = set.size
      
      const ent = me.board[specimenIdx]
      ent.attack += x
      ent.health += x
      
      console.log('[SUMMON_SPECIMEN] buffed specimen', {
        uniqueAbilities: x,
        finalStats: `${ent.attack}/${ent.health}`
      })
    }
    return
  }
  
  // CASO 3: Invocación normal (desde botón de clase o carta)
  if (hasSpecimenOnBoard(me)) {
    console.log('[SUMMON_SPECIMEN] specimen already on board')
    return
  }
  
  const cost = getSpecimenCost(me)
  const hasFSBonus = !!me.freeSpecimenThisTurn
  const isFree = me.specimenFreeThisTurn || hasFSBonus
  
  if (!isFree && me.mana < cost) {
    console.log('[SUMMON_SPECIMEN] insufficient mana', { have: me.mana, need: cost })
    return
  }
  
  const beforeMana = me.mana
  const ok = summonSpecimen(state, playerIndex)
  
  if (!ok) {
    console.log('[SUMMON_SPECIMEN] failed to summon')
    return
  }
  
  // Si fue gratis, restaurar maná
  if (isFree && me.mana < beforeMana) {
    me.mana = beforeMana
  }
  
  me.specimenFreeThisTurn = false
  
  console.log('[SUMMON_SPECIMEN] summoned successfully', { 
    cost: isFree ? 'FREE' : cost,
    mana: me.mana
  })
}

/**
 * DISCOVER_SUMMON_FROM_GRAVEYARD - Invocar 3 criaturas únicas aleatorias de ambos cementerios
 * Excluye especímenes
 */
export function handleDiscoverSummonFromGraveyard(ctx: EffectContext): void {
  const { state, playerIndex, me, oppIndex } = ctx
  
  const count = 3
  
  console.log('[DISCOVER_SUMMON_GY] start')
  
  // IDs de especímenes a excluir
  const specimenIds = new Set([
    'Especimen_Perfecto',
    'Especimen_Perfecto_Final_Stand',
    'Especimen_Perfecto_Evolucionado',
    'SPECIMEN_TOKEN',
    'SPECIMEN_EVOLVED_TOKEN'
  ])
  
  // Pool único de criaturas de ambos cementerios (sin duplicados)
  const poolSet = new Set<string>()
  for (const pi of [playerIndex, oppIndex]) {
    for (const cid of state.players[pi].graveyard) {
      const c = getCardByIdGlobal(cid)
      if (c && c.type === CardType.CREATURE && !specimenIds.has(c.id)) {
        poolSet.add(c.id)
      }
    }
  }
  
  const pool = Array.from(poolSet)
  
  console.log('[DISCOVER_SUMMON_GY] pool', { size: pool.length, cards: pool })
  
  if (!pool.length) {
    console.log('[DISCOVER_SUMMON_GY] no creatures in graveyards')
    return
  }
  
  // Barajar y tomar hasta 3
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = t
  }
  const picks = shuffled.slice(0, Math.min(count, shuffled.length))
  
  console.log('[DISCOVER_SUMMON_GY] summoning', picks)
  
  // Invocar cada criatura y ejecutar sus ON_ENTER
  for (const cid of picks) {
    const ref = getCardByIdGlobal(cid)
    if (!ref) continue
    
    const ent: CreatureOnBoard = {
      id: `summoned-${cid}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      cardId: ref.id,
      ownerId: me.id,
      attack: ref.attack ?? 0,
      health: ref.health ?? 1,
      exhausted: !(ref.abilities?.includes(Ability.PRISA)),
      abilities: ref.abilities ? ref.abilities.map(a => String(a)) : [],
      effects: []
    }
    
    const bi = me.board.push(ent) - 1
    notifyEnterBattlefield(state, playerIndex, ent.id)
    
    // Ejecutar efectos ON_ENTER con hints aleatorios
    if (Array.isArray(ref.effects)) {
      for (const eff of ref.effects) {
        if (eff.timing !== EffectTiming.ON_ENTER || !eff.action) continue
        
        const hints = getRandomHintsForAction(state, playerIndex, eff.action)
        const fixedHints = hints?.length ? hints : [{ type: 'CREATURE_SELF', index: bi }] as any
        
        dispatchAction(state, playerIndex, eff.action, fixedHints)
      }
    }
    
    console.log('[DISCOVER_SUMMON_GY] summoned', { cardId: ref.id, boardIndex: bi })
  }
  
  console.log('[DISCOVER_SUMMON_GY] done', { summoned: picks.length })
}

/**
 * DAMAGE_AND_SUMMON_SAME_COST_IF_KILL - Hace daño a una criatura,
 * si la mata invoca una criatura aleatoria del mismo coste de maná
 */
export function handleDamageAndSummonSameCost(ctx: EffectContext): void {
  const { state, playerIndex, oppIndex, me, action, targetHints } = ctx
  
  const damage = action.amount ?? 0
  
  console.log('[DAMAGE_SUMMON_SAME_COST] start', { damage })
  
  // Resolver target
  const t = resolveSingleTarget(state, playerIndex, action.target, targetHints?.[0])
  
  if (!t || t.kind !== 'CREATURE') {
    console.log('[DAMAGE_SUMMON_SAME_COST] no valid creature target')
    return
  }
  
  const owner = state.players[t.playerIndex]
  const cr = owner.board[t.index]
  if (!cr) return
  
  const killedCardRef = getCardByIdGlobal(cr.cardId)
  const killedMana = killedCardRef?.mana ?? 0
  
  console.log('[DAMAGE_SUMMON_SAME_COST] target', { 
    cardId: cr.cardId, 
    mana: killedMana,
    health: cr.health 
  })
  
  // Aplicar daño
  cr.health -= damage
  cr.damagedThisTurn = true
  
  // Si murió, invocar criatura del mismo coste
  if (cr.health <= 0) {
    const [dead] = owner.board.splice(t.index, 1)
    owner.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, t.playerIndex, dead.id)
    notifyEffectTriggered(state, t.playerIndex, dead.cardId, 'ON_DEATH')
    
    console.log('[DAMAGE_SUMMON_SAME_COST] target killed, summoning replacement')
    
    // Pool: cartas de tu clase y clase enemiga con el mismo coste
    const myClass = me.classType
    const oppClass = state.players[oppIndex].classType
    const allowed = new Set([myClass, oppClass])
    
    const pool = [
      ...BASIC_CARDS,
      ...CLASS_CARDS.filter(c => c.classType && allowed.has(c.classType as any))
    ]
      .filter(isCreatureCard)
      .filter(c => (c.mana ?? 0) === killedMana)
    
    console.log('[DAMAGE_SUMMON_SAME_COST] pool', { 
      mana: killedMana, 
      count: pool.length 
    })
    
    if (pool.length > 0) {
      const ref = pool[Math.floor(Math.random() * pool.length)]
      const refCard = getCardByIdGlobal(ref.id)
      
      const entity: CreatureOnBoard = {
        id: `creature-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        cardId: ref.id,
        ownerId: me.id,
        attack: refCard?.attack ?? 0,
        health: refCard?.health ?? 1,
        exhausted: !(refCard?.abilities?.includes(Ability.PRISA)),
        abilities: refCard?.abilities ? refCard.abilities.map(a => String(a)) : [],
        effects: [],
      }
      me.board.push(entity)
      notifyEnterBattlefield(state, playerIndex, entity.id)
      
      // Ejecutar ON_ENTER con hints aleatorios
      const bi = me.board.length - 1
      const refEffects = refCard?.effects
      if (Array.isArray(refEffects)) {
        for (const eff of refEffects) {
          if (eff.timing !== EffectTiming.ON_ENTER || !eff.action) continue
          
          const hints = getRandomHintsForAction(state, playerIndex, eff.action)
          const fixedHints = hints?.length ? hints : [{ type: 'CREATURE_SELF', index: bi }] as any
          
          dispatchAction(state, playerIndex, eff.action, fixedHints)
        }
      }
      
      console.log('[DAMAGE_SUMMON_SAME_COST] summoned', { cardId: ref.id })
    }
  } else {
    console.log('[DAMAGE_SUMMON_SAME_COST] target survived, no summon')
  }
}
