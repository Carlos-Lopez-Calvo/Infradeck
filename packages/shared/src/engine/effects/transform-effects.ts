import { EffectTiming, EffectTarget } from '../../types/cards'
import { EffectContext } from './core'
import { GameState, getCardByIdGlobal, playCard } from '../game-state'

/**
 * TRANSFORM - Juega todas las cartas de la mano con objetivos aleatorios
 * Variantes:
 * - PLAY_ALL_HAND_RANDOM_TARGETS: juega 1 vez
 * - PLAY_ALL_HAND_TWICE_RANDOM_TARGETS: juega 2 veces
 * - PLAY_ALL_HAND_BY_ENTROPY: Realidad Fracturada (8+ → 1 pasada, 10+ → 2)
 */
export function handleTransform(ctx: EffectContext): void {
  const { state, playerIndex, me, action } = ctx

  const val = String(action.value || '')
  let passes = 0

  if (val === 'PLAY_ALL_HAND_BY_ENTROPY') {
    const entropy =
      me.classResource?.type === 'ENTROPIA' ? (me.classResource.amount ?? 0) : 0
    if (entropy >= 10) passes = 2
    else if (entropy >= 8) passes = 1
    else {
      console.log('[TRANSFORM] PLAY_ALL_HAND_BY_ENTROPY skipped', { entropy })
      return
    }
  } else if (val === 'PLAY_ALL_HAND_TWICE_RANDOM_TARGETS') {
    passes = 2
  } else if (val === 'PLAY_ALL_HAND_RANDOM_TARGETS') {
    passes = 1
  } else {
    console.warn('[TRANSFORM] unknown value', val)
    return
  }

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
        if (idxNow === -1) continue

        const card = getCardByIdGlobal(cid)
        if (!card) continue

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
}

function getRandomTargetsForCard(state: GameState, playerIndex: number, card: any): any[] {
  const me = state.players[playerIndex]
  const opp = state.players[1 - playerIndex]
  const hints: any[] = []

  if (!card.effects) return hints

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
    } else if (tgt === EffectTarget.TARGET_FRIENDLY_CREATURE) {
      if (me.board.length > 0) {
        const i = Math.floor(Math.random() * me.board.length)
        hints.push({ type: 'CREATURE_SELF', index: i })
      }
    } else if (tgt === EffectTarget.FRIENDLY_HERO) {
      hints.push({ type: 'HERO_SELF' })
    } else if (tgt === EffectTarget.ENEMY_HERO) {
      hints.push({ type: 'HERO_ENEMY' })
    }
  }

  return hints
}
