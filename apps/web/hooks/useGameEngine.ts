 import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import {
    createGame, startGame, nextTurn, playCard, setCardResolver, setPriorityWindow,
    type GameState, declareAttackHero, declareAttackCreature, passPriority, getStack
} from '@infradeck/shared'
import * as Basic from '@infradeck/shared/cards/basic-cards'
import * as Class from '@infradeck/shared/cards/class-cards'
import type { Card } from '@infradeck/shared/types/cards'

const REGISTRY: Record<string, Card> = {}
Object.values({ ...Basic, ...Class }).forEach((v: any) => {
  if (v && typeof v === 'object' && v.id && v.type) REGISTRY[v.id] = v as Card
})
// bajo imports
function needsTarget(c?: Card) {
    if (!c) return false
    const needs = new Set(['TARGET_CREATURE','ANY_CREATURE','TARGET_SPELL'])
    return (c.effects ?? []).some(e => e.timing === 'ON_PLAY' && needs.has(String((e as any).action?.target)))
  }
const getCardById = (id: string) => REGISTRY[id]
setCardResolver(getCardById)

type TargetRef = { type: 'CREATURE_SELF'|'CREATURE_ENEMY'; index: number }

export function useGameEngine() {
    const [state, setState] = useState<GameState>(() => {
        const s = createGame(
          { id: 'P1', name: 'P1', classType: 'NEUTRAL' as any, deck: Object.keys(REGISTRY).slice(0, 20) },
          { id: 'P2', name: 'P2', classType: 'NEUTRAL' as any, deck: Object.keys(REGISTRY).slice(20, 40) }
        )
        startGame(s)
        return s
      })
      const refresh = useCallback((s: GameState) => setState({ ...s, players: [...s.players] as any }), [])

  // estados locales
const [targetMode, setTargetMode] = useState<{active:boolean; handIndex:number|null; targets: TargetRef[]}>({ active:false, handIndex:null, targets: [] })
const [prioritySeconds, setPrioritySeconds] = useState<number>(0)
const [logs, setLogs] = useState<string[]>([])
const [hasPriority, setHasPriority] = useState<boolean>(true)
const discoverChooserRef = useRef<null | ((choices: string[]) => Promise<string>)>(null)
const setDiscoverChooser = useCallback((fn: (choices: string[]) => Promise<string>) => {
  discoverChooserRef.current = fn
}, [])
  const addLog = useCallback((msg: string) => setLogs(prev => [msg, ...prev].slice(0, 10)), [])

  // helper: ¿requiere objetivo?
function needsTarget(c?: Card) {
    if (!c) return false
    const needs = new Set(['TARGET_CREATURE','ANY_CREATURE','TARGET_SPELL'])
    return (c.effects ?? []).some(e => e.timing === 'ON_PLAY' && needs.has(String((e as any).action?.target)))
  }
  const selectStackTop = useCallback(() => {
    if (!targetMode.active) return
    // Selecciona el hechizo superior del oponente
    const t = { kind: 'STACK_TOP_ENEMY' } as any

    const me = state.turn.currentPlayerIndex
    const idx = targetMode.handIndex ?? -1
    if (idx < 0) return
    const opts = { targets: [t] }
    const r = playCard(state, me, idx, getCardById, opts)
    refresh(state)
    setTargetMode({ active:false, handIndex:null, targets: [] })
    return r
  }, [state, targetMode, refresh])
  
  
  const actions = useMemo(() => ({
    play: (handIndex: number) => {
      const r = playCard(state, state.turn.currentPlayerIndex, handIndex, getCardById)
      addLog(`P${state.turn.currentPlayerIndex + 1} jugó ${state.players[state.turn.currentPlayerIndex].hand[handIndex] ?? 'carta'}`)
      if (!r.ok) alert(r.error)
      refresh(state)
      return r
    },
    // dentro de useMemo(actions)
playSmart: (handIndex: number) => {
    const meIdx = state.turn.currentPlayerIndex
    const id = state.players[meIdx].hand[handIndex]
    const c = getCardById(id)
    if (needsTarget(c)) {
      setTargetMode({ active:true, handIndex, targets: [] })
      return { ok: true as const }
    }
    const r = playCard(state, meIdx, handIndex, getCardById)
    if (!r.ok) alert(r.error)
    refresh(state)
    return r
  },
    pass: () => { addLog(`P${state.turn.currentPlayerIndex + 1} pasa prioridad`); passPriority(state, state.turn.currentPlayerIndex); refresh(state) },
    next: () => { addLog(`P${state.turn.currentPlayerIndex + 1} termina turno`); nextTurn(state); refresh(state) },

    startTargetPlay: (handIndex: number) => setTargetMode({ active:true, handIndex, targets: [] }),
    startTargetRespond: (handIndex: number) => setTargetMode({ active:true, handIndex, targets: [] }),
    cancelTarget: () => setTargetMode({ active:false, handIndex:null, targets: [] }),
    

    selectCreature: (owner: 'ME'|'OPP', index: number) => {
      if (!targetMode.active || targetMode.handIndex == null) return
      const ref: TargetRef = owner === 'ME' ? { type:'CREATURE_SELF', index } : { type:'CREATURE_ENEMY', index }
      const nextTargets = [...targetMode.targets, ref]
      setTargetMode({ ...targetMode, targets: nextTargets })
      const opts = { targets: nextTargets as any }
      const me = state.turn.currentPlayerIndex
      const r = playCard(state, me, targetMode.handIndex, getCardById, opts)
      addLog(`Objetivo: ${owner}#${index}`)
      if (!r.ok) alert(r.error)
      refresh(state)
      setTargetMode({ active:false, handIndex:null, targets: [] })
      return r
    },

    attackCreature: (attackerBoardIndex: number, defenderBoardIndex: number) => {
        const me = state.turn.currentPlayerIndex
        const res = declareAttackCreature(state, me, attackerBoardIndex, defenderBoardIndex)
        if (!res.ok) alert(res.error)
        refresh(state)
        return res
      },

    attackHero: (index: number) => {
        const me = state.turn.currentPlayerIndex
        const res = declareAttackHero(state, me, index)
        addLog(`P${me + 1} ataca al héroe con criatura #${index}`)
        if (!res.ok) alert(res.error)
        refresh(state)
        return res
      },
      resolveAllStack: () => {
        let guard = 0
        while ((state.stack?.length ?? 0) > 0 && guard++ < 100) {
          passPriority(state, state.turn.currentPlayerIndex)
          passPriority(state, 1 - state.turn.currentPlayerIndex)
        }
        refresh(state)
      },

    selectHero: (owner: 'ME'|'OPP') => {
      if (!targetMode.active || targetMode.handIndex == null) return
      const hint = owner === 'ME' ? ({ type:'HERO_SELF' } as any) : ({ type:'HERO_ENEMY' } as any)
      const opts = { targets: [hint] }
      const me = state.turn.currentPlayerIndex
      const r = playCard(state, me, targetMode.handIndex, getCardById, opts)
      addLog(`Objetivo: Héroe ${owner}`)
      if (!r.ok) alert(r.error)
      refresh(state)
      setTargetMode({ active:false, handIndex:null, targets: [] })
      return r
    },

    toCombat: () => { addLog(`No hay fase COMBAT en este motor`) },
  }), [state, refresh, targetMode, addLog])

  const view = useMemo(() => ({
    me: state.players[state.turn.currentPlayerIndex],
    opp: state.players[1 - state.turn.currentPlayerIndex],
    stack: getStack(state),
    phase: state.turn.phase,
    activePlayerIndex: state.turn.currentPlayerIndex
  }), [state])

  // Auto-pass y cuenta atrás de 30s en prioridad
  // en apps/web/hooks/useGameEngine.ts
useEffect(() => {
    let timeoutId: any
    let intervalId: any
  
    setPriorityWindow((s, info) => {
      // badge: tienes prioridad si eres el jugador activo de la ventana
      setHasPriority(info.activePlayer === s.turn.currentPlayerIndex)
  
      // cuenta atrás 30s + auto-pass
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
  
      setPrioritySeconds(30)
      const deadline = Date.now() + 30000
  
      intervalId = setInterval(() => {
        const secs = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
        setPrioritySeconds(secs)
      }, 250)
  
      timeoutId = setTimeout(() => {
        try {
          passPriority(s, info.activePlayer)
          refresh(s)
        } catch {}
      }, 30000)
    })
  
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
      setPriorityWindow(() => {})
    }
  }, [refresh])

  return { state, ...view, ...actions, targetMode, getCardById, prioritySeconds, logs, hasPriority, selectStackTop, setDiscoverChooser }
}