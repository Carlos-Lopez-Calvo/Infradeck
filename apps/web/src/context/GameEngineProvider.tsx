// apps/web/src/store/GameEngineProvider.tsx
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  GameState, createGame, startGame,
  startTurn as engineStartTurn, endTurn as engineEndTurn,
  beginCombat, endCombat,
  setCardResolver, setPriorityWindow, playCard, setDiscoverRequest,
  BASIC_CARDS_BY_ID, CLASS_CARDS_BY_ID, declareAttackHero, declareAttackCreature,
  EffectActionType, EffectTarget, EffectTiming,
  summonSpecimen
} from '@infradeck/shared'

import { Card as UICard } from '../components/Card'

import { sampleDecks } from '../utils/sample-decks'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
const BOT_ENABLED = true
const processedTurnRefInit = null as string | null

type Ctx = {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
  currentPlayer: GameState['players'][number]
  opponentPlayer: GameState['players'][number]
  isMyTurn: boolean
  actions: {
    startTurn: () => void
    beginCombat: () => void
    endCombat: () => void
    endTurn: () => void
    playFromHand: (handIndex: number) => void
    attackHero: (attackerBoardIndex: number) => void
    attackCreature: (attackerBoardIndex: number, defenderBoardIndex: number) => void
    summonSpecimen: () => void
  }
}

type TargetModalState =
  | null
  | {
      playerIndex: number
      handIndex: number
      choice?: 'BASE' | 'BUFF'
      targetKind: 'CREATURE_ENEMY' | 'CREATURE_SELF'
    }

const GameEngineContext = createContext<Ctx | null>(null)

type DiscoverModalState =
  | null
  | {
      handIndex: number
      playerIndex: number
      title: string
      baseLabel: string
      buffLabel: string
    }

export function GameEngineProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Elige aquí los mazos a probar
    const p1Class = 'ABOMINACION' as const
    const p2Class = 'VITALIDAD' as const
    const state = createGame(
      { id: 'player1', name: 'Player 1', classType: p1Class, deck: [...sampleDecks[p1Class]], programmedSpecimenEffects: [] },
      { id: 'player2', name: 'Player 2', classType: p2Class, deck: [...sampleDecks[p2Class]], programmedSpecimenEffects: [] },
    )
    startGame(state)
    return state
  })

  const localPlayerId = typeof window !== 'undefined'
    ? (localStorage.getItem('playerId') || 'player1')
    : 'player1'

  const getCardById = (id: string) => BASIC_CARDS_BY_ID[id] ?? CLASS_CARDS_BY_ID[id]

  const isPlayingRef = useRef(false)
  // dentro de GameEngineProvider, junto a otros refs
const lastPlaySigRef = useRef<{ turn: string; key: string; at: number } | null>(null)
const turnKey = `${gameState.turn.turnNumber}:${gameState.turn.currentPlayerIndex}`


  // Elección de “descubrir” (BASE/BUFF) para el siguiente efecto que la pida
// Elección de “descubrir” (BASE/BUFF) sticky durante la resolución de la carta
const nextDiscoverChoiceRef = useRef<{ choice: 'BASE' | 'BUFF' | null; usesLeft: number }>({ choice: null, usesLeft: 0 })
const lastDiscoverChoiceRef = useRef<'BASE'|'BUFF'|null>(null)
const [discoverModal, setDiscoverModal] = useState<DiscoverModalState>(null)
const [targetModal, setTargetModal] = useState<TargetModalState>(null)
const [discoverMinimized, setDiscoverMinimized] = useState(false)

useLayoutEffect(() => {
  setCardResolver(getCardById)
  setPriorityWindow(() => setGameState(s => ({ ...s })))

  setDiscoverRequest((state, { playerIndex }) => {
    const entry = nextDiscoverChoiceRef.current
    if (!entry.choice) {
      const p = state.players[playerIndex]
      if ((p.lifeCredit ?? 0) > 0) return 'BUFF'
      return 'BASE'
    }
    if (entry.usesLeft > 0) entry.usesLeft -= 1
    const chosen = entry.choice
    if (entry.usesLeft <= 0) nextDiscoverChoiceRef.current = { choice: null, usesLeft: 0 }
    return chosen
  })
}, [])

useLayoutEffect(() => {
  if (discoverModal) setDiscoverMinimized(false)
}, [discoverModal])

// Oculta overlay automáticamente cuando se active Final Stand
useLayoutEffect(() => {
  if (typeof gameState.finalStandJustActivated === 'number') {
    const t = setTimeout(() => {
      setGameState(prev => {
        const next = { ...prev }
        next.finalStandJustActivated = null
        return next
      })
    }, 1500)
    return () => clearTimeout(t)
  }
}, [gameState.finalStandJustActivated, setGameState])

  const meIndex = gameState.players[0].id === localPlayerId ? 0 : 1
  const currentPlayer = gameState.players[meIndex]
  const opponentPlayer = gameState.players[1 - meIndex]
  const isMyTurn = gameState.turn.currentPlayerIndex === meIndex
  const processedTurnRef = useRef(processedTurnRefInit)
  const botTurnKey = `${gameState.turn.turnNumber}:${gameState.turn.currentPlayerIndex}`

  // Helpers UI “discover”
  const cardHasDiscover = (cardId: string | undefined) => {
    const countDiscoversInCard = (cardId?: string) => {
      if (!cardId) return 0
      const c = getCardById(cardId)
      if (!c || !Array.isArray(c.effects)) return 0
      return c.effects.filter(e =>
        e?.action?.type === EffectActionType.DISCOVER_PAY_LIFE ||
        e?.action?.type === EffectActionType.DISCOVER_PAY_ENTROPY
      ).length
    }
    if (!cardId) return false
    const c = getCardById(cardId)
    if (!c || !Array.isArray(c.effects)) return false
    return c.effects.some(e =>
      e?.action?.type === EffectActionType.DISCOVER_PAY_LIFE ||
      e?.action?.type === EffectActionType.DISCOVER_PAY_ENTROPY
    )
  }

  const countDiscoversInCard = (cardId?: string) => {
    if (!cardId) return 0
    const c = getCardById(cardId)
    if (!c || !Array.isArray(c.effects)) return 0
    return c.effects.filter(e =>
      e?.action?.type === EffectActionType.DISCOVER_PAY_LIFE ||
      e?.action?.type === EffectActionType.DISCOVER_PAY_ENTROPY
    ).length
  }

  // Aplica efectos simples de preview sobre una copia del card (solo para UI)
  const applyPreviewEffect = (card: any, eff: any) => {
    // below cardHasDiscover
    if (!eff) return card
    // Solo contemplamos SELF y acciones simples para preview
    if (eff.type === EffectActionType.BUFF_STATS && eff.target) {
      const v = String(eff.value ?? '')
      const m = v.match(/^\+?(-?\d+)\/\+?(-?\d+)$/)
      const addAtk = m ? parseInt(m[1], 10) : 0
      const addHp = m ? parseInt(m[2], 10) : 0
      return { ...card, attack: (card.attack ?? 0) + addAtk, health: (card.health ?? 0) + addHp }
    }
    if (eff.type === EffectActionType.GAIN_ABILITY && eff.target) {
      const abil = String(eff.value ?? '')
      const abilities = card.abilities ? Array.from(new Set([...card.abilities, abil])) : [abil]
      return { ...card, abilities }
    }
    // Otros efectos (DAMAGE, SUMMON_CREATURE, etc.) no alteran stats de la carta misma en preview
    return card
  }
// helper to narrow options to discover types
function asDiscoverOptions(o: any): { base?: any; buff?: any } | undefined {
  return o && (('base' in o) || ('buff' in o)) ? o : undefined
}
  const buildDiscoverPreviews = (playerIndex: number, handIndex: number) => {
    const p = gameState.players[playerIndex]
    const cardId = p.hand[handIndex]
    const card = getCardById(cardId)
    if (!card) return null
    const discover = card.effects?.find(e =>
      e?.action?.type === EffectActionType.DISCOVER_PAY_LIFE ||
      e?.action?.type === EffectActionType.DISCOVER_PAY_ENTROPY
    )
    if (!discover) return null
    const opts = asDiscoverOptions(discover.action?.options)
    const baseEff = opts?.base
    const buffEff = opts?.buff

    const baseCard = applyPreviewEffect({ ...card }, baseEff)
    const buffCard = applyPreviewEffect({ ...card }, buffEff)

    return { baseCard, buffCard }
  }

  const openDiscoverForCard = (playerIndex: number, handIndex: number) => {
    const p = gameState.players[playerIndex]
    const cardId = p.hand[handIndex]
    const card = getCardById(cardId)
    if (!card) return false
    // Etiquetas simples; el motor aplicará la lógica exacta
    setDiscoverModal({
      handIndex,
      playerIndex,
      title: 'Elige una opción',
      baseLabel: 'Versión base',
      buffLabel: 'Versión potenciada',
    })
    return true
  }

  const confirmDiscover = (choice: 'BASE' | 'BUFF') => {
    if (!discoverModal || isPlayingRef.current) return
    isPlayingRef.current = true
    console.log('[UI] confirmDiscover click', { choice })
    const { handIndex, playerIndex } = discoverModal
  
    const cardId = gameState.players[playerIndex].hand[handIndex]
// guard anti-duplicados
const sig = { turn: turnKey, key: `${cardId}:${handIndex}`, at: Date.now() }
const last = lastPlaySigRef.current
if (last && last.turn === sig.turn && last.key === sig.key && (sig.at - last.at) < 300) {
  isPlayingRef.current = false
  return
}
lastPlaySigRef.current = sig
  
    const card = getCardById(cardId)
    const discover = card?.effects?.find(e =>
      e?.action?.type === EffectActionType.DISCOVER_PAY_LIFE ||
      e?.action?.type === EffectActionType.DISCOVER_PAY_ENTROPY
    )
    const opts = asDiscoverOptions(discover?.action?.options)
    const act = choice === 'BUFF' ? opts?.buff : opts?.base
  
    if (act?.target === EffectTarget.TARGET_CREATURE || act?.target === EffectTarget.TARGET_FRIENDLY_CREATURE) {
      setDiscoverModal(null)
      setTargetModal({ playerIndex, handIndex, choice, targetKind: act?.target === EffectTarget.TARGET_FRIENDLY_CREATURE ? 'CREATURE_SELF' : 'CREATURE_ENEMY' })
      isPlayingRef.current = false
      return
    }
  
    const uses = Math.max(1, countDiscoversInCard(cardId))
    lastDiscoverChoiceRef.current = choice
    nextDiscoverChoiceRef.current = { choice, usesLeft: uses }
    setDiscoverModal(null)
 const next: GameState = JSON.parse(JSON.stringify(gameState))
 const res = playCard(next, playerIndex, handIndex, getCardById)
 if (!res.ok) console.warn('playCard failed:', res)
 setGameState(next)
   
    setTimeout(() => { isPlayingRef.current = false }, 0)
  }

  const actions = useMemo(() => ({
    startTurn: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        engineStartTurn(next)
        return next
      })
    },
    beginCombat: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        beginCombat(next)
        return next
      })
    },
    endCombat: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        endCombat(next)
        return next
      })
    },
    endTurn: () => {
      if (!isMyTurn) return
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        engineEndTurn(next)
        engineStartTurn(next)
        {
          const i = next.turn.currentPlayerIndex
          next.players[i].board.forEach(c => { c.exhausted = false; c.damagedThisTurn = false })
        }
        return next
      })
    },

      
    playFromHand: (handIndex: number) => {
      if (!isMyTurn || isPlayingRef.current) return
      isPlayingRef.current = true
      const pIdx = gameState.turn.currentPlayerIndex
      const cardId = gameState.players[pIdx].hand[handIndex]
// guard anti-duplicados
      const sig = { turn: turnKey, key: `${cardId}:${handIndex}`, at: Date.now() }
      const last = lastPlaySigRef.current
      if (last && last.turn === sig.turn && last.key === sig.key && (sig.at - last.at) < 300) {
        isPlayingRef.current = false
        return
      }
      lastPlaySigRef.current = sig
    
      const card = getCardById(cardId)
      if (!card) { isPlayingRef.current = false; return }
    
      if (card.effects?.some(e =>
            e.action?.type === EffectActionType.DISCOVER_PAY_LIFE ||
            e.action?.type === EffectActionType.DISCOVER_PAY_ENTROPY)) {
        openDiscoverForCard(pIdx, handIndex)
        isPlayingRef.current = false
        return
      }
    
      const needsTarget = card.effects?.some(
        e => e.timing === EffectTiming.ON_PLAY && (
          e.action?.target === EffectTarget.TARGET_CREATURE ||
          e.action?.target === EffectTarget.TARGET_FRIENDLY_CREATURE
        )
      )
   if (needsTarget) {
     const wantsFriendly = card.effects?.some(
       e => e.timing === EffectTiming.ON_PLAY && e.action?.target === EffectTarget.TARGET_FRIENDLY_CREATURE
     )
     setTargetModal({ playerIndex: pIdx, handIndex, targetKind: wantsFriendly ? 'CREATURE_SELF' : 'CREATURE_ENEMY' })
     isPlayingRef.current = false
     return
   }
    
      const next: GameState = JSON.parse(JSON.stringify(gameState))
 const res = playCard(next, next.turn.currentPlayerIndex, handIndex, getCardById)
 if (!res.ok) console.warn('playCard failed:', res)
 setGameState(next)
 setTimeout(() => { isPlayingRef.current = false }, 0)
},
// apps/web/src/context/GameEngineProvider.tsx
attackHero: (attackerBoardIndex: number) => {
  if (!isMyTurn) return
  setGameState(prev => {
    console.log('[ACTIONS] attackHero start', {
      phase: prev.turn.phase,
      attackerBoardIndex,
    })
    const next: GameState = JSON.parse(JSON.stringify(prev))
    if (next.turn.phase !== 'COMBAT') beginCombat(next)
    const res = declareAttackHero(next, next.turn.currentPlayerIndex, attackerBoardIndex)
    console.log('[ACTIONS] attackHero result', { ok: res.ok, phaseAfter: next.turn.phase })
    if (!res.ok) console.warn('attackHero failed:', res.error)
    
    return next
  })
},
attackCreature: (attackerBoardIndex: number, defenderBoardIndex: number) => {
  if (!isMyTurn) return
  setGameState(prev => {
    console.log('[ACTIONS] attackCreature start', {
      phase: prev.turn.phase,
      attackerBoardIndex,
      defenderBoardIndex
    })
    const next: GameState = JSON.parse(JSON.stringify(prev))
    if (next.turn.phase !== 'COMBAT') beginCombat(next)
    const res = declareAttackCreature(next, next.turn.currentPlayerIndex, attackerBoardIndex, defenderBoardIndex)
    console.log('[ACTIONS] attackCreature result', { ok: res.ok, phaseAfter: next.turn.phase })
    if (!res.ok) console.warn('attackCreature failed:', res.error)
    return next
  })
},
summonSpecimen: () => {
  if (!isMyTurn || isPlayingRef.current) return
  isPlayingRef.current = true
  const pIdx = gameState.turn.currentPlayerIndex
  const p = gameState.players[pIdx]
  const needsTarget = (p.programmedSpecimenEffects ?? []).includes('DAMAGE_3_ON_ENTER')

  if (needsTarget) {
    setTargetModal({ playerIndex: pIdx, handIndex: -1, targetKind: 'CREATURE_ENEMY' } as any)
    setTimeout(() => { isPlayingRef.current = false }, 0)
    return
  }

  setGameState(prev => {
    const next: GameState = JSON.parse(JSON.stringify(prev))
    const ok = summonSpecimen(next, next.turn.currentPlayerIndex)
    if (!ok) console.warn('summonSpecimen failed')
    return next
  })
  setTimeout(() => { isPlayingRef.current = false }, 0)
},
}), [isMyTurn, gameState.turn.currentPlayerIndex, gameState.players, setGameState])

  // Bot
  useLayoutEffect(() => {
    if (!BOT_ENABLED) return
    const isBotTurn = !isMyTurn && (gameState.turn.phase === 'MAIN')
    if (!isBotTurn) return
    if (processedTurnRef.current === botTurnKey) return
    processedTurnRef.current = botTurnKey
    ;(async () => {
      for (let plays = 0; plays < 2; plays++) {
        let played = false
        setGameState(prev => {
          const next: GameState = JSON.parse(JSON.stringify(prev))
          const botIdx = next.turn.currentPlayerIndex
          if (botIdx === meIndex) return next
          const bot = next.players[botIdx]
          const handIdx = bot.hand.findIndex(id => {
            const card = getCardById(id)
            return card && bot.mana >= (card.mana ?? 0)
          })
          if (handIdx >= 0) {
            // El bot no abre overlay; el motor usará la elección por defecto (BASE)
            const res = playCard(next, botIdx, handIdx, getCardById)
            if (res.ok) played = true
          }
          return next
        })
        if (!played) break
        await delay(300)
      }
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        if (next.turn.currentPlayerIndex === meIndex) return next
        beginCombat(next)
        return next
      })
      await delay(200)
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        const botIdx = next.turn.currentPlayerIndex
        if (botIdx === meIndex) return next
        const bot = next.players[botIdx]
        for (let i = 0; i < bot.board.length; i++) {
          if (!bot.board[i].exhausted && bot.board[i].attack > 0 && bot.board[i].health > 0) {
            declareAttackHero(next, botIdx, i)
          }
        }
        endCombat(next)
        return next
      })
      await delay(200)
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        if (next.turn.currentPlayerIndex !== meIndex) {
          engineEndTurn(next)
          engineStartTurn(next)
          const i = next.turn.currentPlayerIndex
          next.players[i].board.forEach(c => { c.exhausted = false; c.damagedThisTurn = false })
        }
        return next
      })
    })()
  }, [isMyTurn, gameState.turn.phase, botTurnKey])

  const chosenActionNeedsTarget = (playerIndex: number, handIndex: number, choice: 'BASE'|'BUFF') => {
    const p = gameState.players[playerIndex]
    const cardId = p.hand[handIndex]
    const card = getCardById(cardId)
    if (!card) return false
    const discover = card.effects?.find(e =>
      e?.action?.type === EffectActionType.DISCOVER_PAY_LIFE ||
      e?.action?.type === EffectActionType.DISCOVER_PAY_ENTROPY
    )
    const opts = asDiscoverOptions(discover?.action?.options)
    const act = choice === 'BUFF' ? opts?.buff : opts?.base
    return act?.target === EffectTarget.TARGET_CREATURE || act?.target === EffectTarget.TARGET_FRIENDLY_CREATURE
  }

  const value: Ctx = { gameState, setGameState, currentPlayer, opponentPlayer, isMyTurn, actions }
  return (
    <>
      <GameEngineContext.Provider value={value}>{children}</GameEngineContext.Provider>

      {/* Botón flotante para restaurar overlay si está minimizado */}
{discoverModal && discoverMinimized && (
  <button
    className="fixed right-4 bottom-4 z-[9999] px-4 py-2 rounded-lg bg-gray-800/90 text-white border border-white/20 shadow"
    onClick={() => setDiscoverMinimized(false)}
  >
    Mostrar opciones
  </button>
)}

      {/* Overlay Final Stand */}
      {typeof gameState.finalStandJustActivated === 'number' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 text-white">
          <div className="text-center animate-pulse">
            <div className="text-4xl font-extrabold mb-3">FINAL STAND</div>
            <div className="text-xl">
              Jugador {gameState.finalStandJustActivated + 1} activó Final Stand
            </div>
          </div>
        </div>
      )}

          {/* Overlay Discover (BASE/BUFF) */}
{discoverModal && !discoverMinimized && (() => {
  const { playerIndex, handIndex } = discoverModal
  const previews = buildDiscoverPreviews(playerIndex, handIndex)
  const onHide = () => setDiscoverMinimized(true)
  const onCancel = () => setDiscoverModal(null)

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 text-white">
      <div className="rounded-xl px-6 py-5 shadow-2xl w-full h-auto text-center">
        <div className="flex flex-col items-center justify-center mb-24">
          <div className="text-6xl font-bold">Elige una opción</div>
          <div className="flex gap-3">
            <button
              className="px-3 py-1 rounded border border-white/30 hover:bg-white/10 text-2xl"
              onClick={onHide}
            >
              Ocultar
            </button>
            <button
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-500/30 text-2xl"
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-40">
          <button
            className="rounded-2xl p-4 border border-white/30 hover:bg-white/5 scale-[1.5] transition"
            onClick={() => confirmDiscover('BASE')}
          >
            <div className="transform origin-top">
              {previews?.baseCard && <UICard card={previews.baseCard as any} />}
            </div>
          </button>

          <button
            className="relative rounded-2xl p-4 border border-amber-400 scale-[1.5] shadow-[0_0_24px_rgba(251,191,36,0.65)] hover:shadow-[0_0_32px_rgba(251,191,36,0.9)] hover:bg-amber-500/10 transition"
            onClick={() => confirmDiscover('BUFF')}
          >
            <div className="rounded-xl overflow-hidden ring-2 ring-amber-400">
              <div className="transform origin-top">
                {previews?.buffCard && <UICard card={previews.buffCard as any} />}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
})()}

                        {/* Overlay selección de objetivo */}
        {targetModal && (() => {
        const { playerIndex, handIndex, choice, targetKind } = targetModal
        const self = gameState.players[playerIndex]
        const enemyIndex = 1 - playerIndex
        const enemy = gameState.players[enemyIndex]

        const commitWithTargets = (targets: any[]) => {
          setTargetModal(null)
          setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev))
            next.pendingTargets = targets
            if (handIndex === -1) {
              summonSpecimen(next, playerIndex)
              return next
            }
            if (next.turn.currentPlayerIndex !== playerIndex) return next
            const res = playCard(next, playerIndex, handIndex, getCardById, { targets })
            if (!res.ok) console.warn('playCard failed:', res)
            return next
          })
        }

        const onPickHeroEnemy = () => commitWithTargets([{ type: 'HERO_ENEMY' } as any])
        const onPickEnemy = (defenderIndex: number) =>
          commitWithTargets([{ type: 'CREATURE_ENEMY', index: defenderIndex } as any])

        const onPickSelf = (allyIndex: number) =>
          commitWithTargets([{ type: 'CREATURE_SELF', index: allyIndex } as any])

        return (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 text-white">
            <div className="bg-gray-900 rounded-xl border border-white/20 px-6 py-5 shadow-2xl w-[95%] max-w-4xl text-center">
              <div className="text-2xl font-bold mb-4">Selecciona objetivo</div>

              {/* Si el objetivo es enemigo, permite héroe enemigo */}
              {targetKind === 'CREATURE_ENEMY' && (
                <div className="mb-4 flex justify-center">
                  <button
                    className="rounded-lg border border-red-400 hover:bg-red-500/10 px-4 py-2 text-red-300 font-semibold"
                    onClick={onPickHeroEnemy}
                  >
                    Héroe enemigo
                  </button>
                </div>
              )}

              {/* Lista de criaturas según el targetKind */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 justify-center">
                {(targetKind === 'CREATURE_ENEMY' ? enemy.board : self.board).map((crea, idx) => {
                  const base = getCardById(crea.cardId)
                  const preview = base ? { ...base, attack: crea.attack, health: crea.health, abilities: crea.abilities } : null
                  const onClick = targetKind === 'CREATURE_ENEMY'
                    ? () => onPickEnemy(idx)
                    : () => onPickSelf(idx)
                  return (
                    <button key={crea.id} className="rounded-lg border border-white/20 hover:bg-white/5 p-2" onClick={onClick}>
                      {preview && <UICard card={preview as any} />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}

export function useGameEngineOptional() {
  return useContext(GameEngineContext)
}

export function useGameEngine() {
  const ctx = useContext(GameEngineContext)
  if (!ctx) throw new Error('useGameEngine must be used within GameEngineProvider')
  return ctx
}