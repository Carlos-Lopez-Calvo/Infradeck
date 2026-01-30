/**
 * EFECTOS DE CICLO 🌓
 * Efectos específicos de la clase Ciclo:
 * - CHANGE_CYCLE_STATE
 * - ACTIVATE_ECLIPSE
 * - TRANSFORM
 */

import { EffectContext } from './core'
import { EffectActionType, CycleState, EffectTiming, getCurrentForm, EffectTarget } from '../../types/cards'
import { getCardByIdGlobal, playCard, GameState } from '../game-state'
import { notifyEnterBattlefield } from '../priority'

// ===== FUNCIONES DE UTILIDAD PARA CICLO =====

export function getNextCycleState(current: CycleState): CycleState {
  switch (current) {
    case CycleState.DIA:
      return CycleState.NOCHE
    case CycleState.NOCHE:
      return CycleState.DIA
    case CycleState.ECLIPSE:
      return CycleState.DIA
    default:
      return CycleState.DIA
  }
}

/**
 * Aplica la forma actual del ciclo a una criatura específica
 */
export function applyCycleFormToCreature(
  state: GameState, 
  playerIndex: number, 
  boardIndex: number
): void {
  const p = state.players[playerIndex]
  const ent = p.board[boardIndex]
  if (!ent) return
  
  const base = getCardByIdGlobal(ent.cardId)
  if (!base) return
  
  // Solo cartas con ciclo
  if (!(base as any).dayForm) return
  
  const currentState = p.classResource?.state as CycleState | undefined
  if (!currentState) return
  
  // Obtener forma actual
  const form = getCurrentForm(base as any, currentState)
  
  // Ajustar stats
  ent.attack = form.attack ?? 0
  
  // Ajustar vida (clamp al nuevo máximo si es menor)
  const newMax = form.health ?? ent.health
  if (ent.health > newMax) ent.health = newMax
  
  // Reemplazar habilidades
  ent.abilities = form.abilities ? form.abilities.map(a => String(a)) : []
  
  console.log('[CYCLE_FORM] applied', { 
    cardId: ent.cardId, 
    state: currentState,
    stats: `${ent.attack}/${ent.health}`,
    abilities: ent.abilities
  })
}

/**
 * Aplica el aura del Guardian del Equilibrio a todas las criaturas aliadas
 * Día: +2 ATQ por Guardian
 * Noche: +2 HP por Guardian
 */
export function applyGuardianAura(state: GameState, playerIndex: number): void {
  const me = state.players[playerIndex]
  
  // Cuenta cuántos Guardian_del_Equilibrio hay en mesa
  const guardiansCount = me.board.filter(
    ent => getCardByIdGlobal(ent.cardId)?.id === 'Guardian_del_Equilibrio'
  ).length
  
  // Obtener aura previa
  const prevAura = me.cycleAuraApplied ?? null
  const prevStacks = me.cycleAuraStacks ?? 0
  
  // Determinar aura actual (solo Día/Noche, Eclipse no tiene aura)
  const currentState = me.classResource?.state
  const newAura: 'DIA' | 'NOCHE' | null = 
    currentState === 'DIA' ? 'DIA' : 
    currentState === 'NOCHE' ? 'NOCHE' : 
    null
  
  // Si no cambió nada, no hacer nada
  if (prevAura === newAura && prevStacks === guardiansCount) {
    return
  }
  
  console.log('[GUARDIAN_AURA] update', { 
    prevAura, 
    prevStacks, 
    newAura, 
    newStacks: guardiansCount 
  })
  
  // Quitar aura previa
  if (prevAura && prevStacks > 0) {
    const [atkOff, hpOff] = prevAura === 'DIA' ? [2 * prevStacks, 0] : [0, 2 * prevStacks]
    for (const c of me.board) {
      c.attack -= atkOff
      c.health -= hpOff
    }
    console.log('[GUARDIAN_AURA] removed previous', { 
      aura: prevAura, 
      stacks: prevStacks,
      modification: `${atkOff ? `-${atkOff} ATQ` : `-${hpOff} HP`}`
    })
  }
  
  // Aplicar nueva aura
  if (newAura && guardiansCount > 0) {
    const [atkOn, hpOn] = newAura === 'DIA' ? [2 * guardiansCount, 0] : [0, 2 * guardiansCount]
    for (const c of me.board) {
      c.attack += atkOn
      c.health += hpOn
    }
    me.cycleAuraApplied = newAura
    me.cycleAuraStacks = guardiansCount
    console.log('[GUARDIAN_AURA] applied new', { 
      aura: newAura, 
      stacks: guardiansCount,
      modification: `${atkOn ? `+${atkOn} ATQ` : `+${hpOn} HP`}`
    })
  } else {
    me.cycleAuraApplied = null
    me.cycleAuraStacks = 0
  }
}

// ===== HANDLERS DE EFECTOS DE CICLO =====

/**
 * CHANGE_CYCLE_STATE - Cambiar el estado del ciclo (DIA/NOCHE/ECLIPSE)
 */
export function handleChangeCycleState(ctx: EffectContext): void {
  const { state, playerIndex, me, action } = ctx
  
  if (!me.classResource || me.classResource.type !== 'ESTADO') {
    console.warn('[CHANGE_CYCLE] player has no ESTADO resource')
    return
  }
  
  const val = action.value
  
  console.log('[CHANGE_CYCLE] start', { 
    currentState: me.classResource.state, 
    value: val 
  })
  
  if (val === 'PERMANENT_ECLIPSE') {
    me.permanentEclipse = true
    me.classResource.state = 'ECLIPSE'
    me.manualCycleChangedThisTurn = true
    console.log('[CHANGE_CYCLE] activated permanent eclipse')
  } else if (val === 'NEXT_CYCLE_STATE') {
    const cur = me.classResource.state
    me.classResource.state = getNextCycleState(cur as CycleState)
    me.manualCycleChangedThisTurn = true
    console.log('[CHANGE_CYCLE] advanced to next state', { 
      from: cur, 
      to: me.classResource.state 
    })
  } else if (val === 'CHOOSE_DAY_OR_NIGHT') {
    // Por ahora defaultear a DIA (la UI podría hacer un modal aquí)
    me.classResource.state = 'DIA'
    me.manualCycleChangedThisTurn = true
    console.log('[CHANGE_CYCLE] chose DIA')
  } else if (typeof val === 'string') {
    // Cambio directo a un estado específico
    me.classResource.state = val as CycleState
    me.manualCycleChangedThisTurn = true
    console.log('[CHANGE_CYCLE] set state directly to', val)
  }
  
  // Reaplicar formas de ciclo a todas las criaturas que transformen con ciclo
  for (let i = 0; i < me.board.length; i++) {
    const ent = me.board[i]
    const base: any = getCardByIdGlobal(ent.cardId)
    if (base && base.dayForm && base.transformsWithCycle === true) {
      applyCycleFormToCreature(state, playerIndex, i)
    }
  }
  
  // Actualizar aura del Guardian del Equilibrio
  applyGuardianAura(state, playerIndex)
}

/**
 * ACTIVATE_ECLIPSE - Shortcut para activar Eclipse directamente
 */
export function handleActivateEclipse(ctx: EffectContext): void {
  const { state, playerIndex, me } = ctx
  
  if (!me.classResource || me.classResource.type !== 'ESTADO') {
    console.warn('[ACTIVATE_ECLIPSE] player has no ESTADO resource')
    return
  }
  
  console.log('[ACTIVATE_ECLIPSE] activating eclipse')
  
  me.classResource.state = 'ECLIPSE'
  me.manualCycleChangedThisTurn = true
  
  // Reaplicar formas
  for (let i = 0; i < me.board.length; i++) {
    const ent = me.board[i]
    const base: any = getCardByIdGlobal(ent.cardId)
    if (base && base.dayForm && base.transformsWithCycle === true) {
      applyCycleFormToCreature(state, playerIndex, i)
    }
  }
  
  // Actualizar aura
  applyGuardianAura(state, playerIndex)
}

/**
 * TRANSFORM - Juega todas las cartas de la mano con objetivos aleatorios
 * Variantes:
 * - PLAY_ALL_HAND_RANDOM_TARGETS: juega 1 vez
 * - PLAY_ALL_HAND_TWICE_RANDOM_TARGETS: juega 2 veces
 */
export function handleTransform(ctx: EffectContext): void {
  const { state, playerIndex, me, action } = ctx
  
  const val = String(action.value || '')
  const passes = val === 'PLAY_ALL_HAND_TWICE_RANDOM_TARGETS' ? 2 : 1
  
  console.log('[TRANSFORM] start', { value: val, passes, handSize: me.hand.length })
  
  // Guardar estado de reducción de coste y discover
  const savedRed = me.cardCostReduction
  const savedSkip = me.cardCostReductionSkipOnce
  const savedForce = me.forceDiscoverBuff
  
  // Configurar: jugar TODO gratis y forzar elección BUFF en discovers
  me.cardCostReduction = { amount: 99, remaining: 'ALL' }
  me.cardCostReductionSkipOnce = true
  me.forceDiscoverBuff = true
  
  try {
    for (let pass = 0; pass < passes; pass++) {
      console.log('[TRANSFORM] pass', pass + 1, 'of', passes)
      
      // Snapshot de la mano (porque playCard modifica el array)
      const snapshot = [...me.hand]
      
      for (const cid of snapshot) {
        const idxNow = me.hand.indexOf(cid)
        if (idxNow === -1) continue // Ya se jugó
        
        const card = getCardByIdGlobal(cid)
        if (!card) continue
        
        console.log('[TRANSFORM] playing', card.name, `(${card.id})`)
        
        // Generar objetivos aleatorios para esta carta
        const targets = getRandomTargetsForCard(state, playerIndex, card)
        
        playCard(state, playerIndex, idxNow, getCardByIdGlobal, { targets })
      }
    }
  } finally {
    // Restaurar estado original
    me.cardCostReduction = savedRed
    me.cardCostReductionSkipOnce = savedSkip
    me.forceDiscoverBuff = savedForce
  }
  
  console.log('[TRANSFORM] done', { 
    remainingHand: me.hand.length,
    boardSize: me.board.length 
  })
}

/**
 * Genera objetivos aleatorios para una carta específica
 */
function getRandomTargetsForCard(state: GameState, playerIndex: number, card: any): any[] {
  const me = state.players[playerIndex]
  const opp = state.players[1 - playerIndex]
  const hints: any[] = []
  
  if (!card.effects) return hints
  
  // Por cada efecto ON_PLAY que requiera objetivo, generamos un hint
  for (const eff of card.effects) {
    if (eff.timing !== EffectTiming.ON_PLAY) continue
    
    const tgt = eff.action?.target
    
    if (tgt === EffectTarget.TARGET_CREATURE) {
      // Preferir criatura enemiga si existe, sino héroe enemigo
      if (opp.board.length > 0) {
        const i = Math.floor(Math.random() * opp.board.length)
        hints.push({ type: 'CREATURE_ENEMY', index: i })
      } else {
        hints.push({ type: 'HERO_ENEMY' })
      }
    } else if (tgt === EffectTarget.TARGET_FRIENDLY_CREATURE) {
      // Criatura aliada aleatoria
      if (me.board.length > 0) {
        const i = Math.floor(Math.random() * me.board.length)
        hints.push({ type: 'CREATURE_SELF', index: i })
      }
    } else if (tgt === EffectTarget.FRIENDLY_HERO) {
      hints.push({ type: 'HERO_SELF' })
    } else if (tgt === EffectTarget.ENEMY_HERO) {
      hints.push({ type: 'HERO_ENEMY' })
    }
    // Los demás targets (ALL_CREATURES, RANDOM, etc) no requieren hints
  }
  
  return hints
}
