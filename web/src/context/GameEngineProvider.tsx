// apps/web/src/store/GameEngineProvider.tsx
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  GameState, createGame, startGame,
  startTurn as engineStartTurn, endTurn as engineEndTurn,
  setCardResolver, setPriorityWindow, playCard, setDiscoverRequest, setScryRequest, setAdvancedSelectionRequest,
  BASIC_CARDS_BY_ID, CLASS_CARDS_BY_ID, declareAttackHero, declareAttackCreature,
  EffectActionType, EffectTarget, EffectTiming,
  summonSpecimen
} from '@infradeck/shared'

import { Card as UICard } from '../components/Card'
import { UnifiedTargetModal, TargetType, TargetSelection } from '../components/UnifiedTargetModal'

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
    endTurn: () => void
    playFromHand: (handIndex: number) => void
    attackHero: (attackerBoardIndex: number) => void
    attackCreature: (attackerBoardIndex: number, defenderBoardIndex: number) => void
    summonSpecimen: () => void
  }
}

// Estado unificado para selección de objetivos
type UnifiedTargetModalState =
  | null
  | {
      playerIndex: number
      handIndex: number  // -1 para specimen o habilidades
      choice?: 'BASE' | 'BUFF'
      targetType: TargetType
      step?: number
      previousSelection?: any
      onComplete: (selection: TargetSelection) => void
    }

export const GameEngineContext = createContext<Ctx | null>(null)

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
    const p1Class = 'VITALIDAD' as const
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

    const getCardById = (id: string) => {
      return BASIC_CARDS_BY_ID[id] ?? CLASS_CARDS_BY_ID[id]
    }

  const isPlayingRef = useRef(false)
  // dentro de GameEngineProvider, junto a otros refs
const lastPlaySigRef = useRef<{ turn: string; key: string; at: number } | null>(null)
const turnKey = `${gameState.turn.turnNumber}:${gameState.turn.currentPlayerIndex}`


  // Elección de “descubrir” (BASE/BUFF) para el siguiente efecto que la pida
// Elección de “descubrir” (BASE/BUFF) sticky durante la resolución de la carta
const nextDiscoverChoiceRef = useRef<{ choice: 'BASE' | 'BUFF' | null; usesLeft: number }>({ choice: null, usesLeft: 0 })
const lastDiscoverChoiceRef = useRef<'BASE'|'BUFF'|null>(null)
const [discoverModal, setDiscoverModal] = useState<DiscoverModalState>(null)
const [unifiedTargetModal, setUnifiedTargetModal] = useState<UnifiedTargetModalState>(null)
const [discoverMinimized, setDiscoverMinimized] = useState(false)

type ScryModalState = null | { cards: string[]; playerIndex: number }
const [scryModal, setScryModal] = useState<ScryModalState>(null)
const scryDecisionRef = useRef<'TOP' | 'BOTTOM' | null>(null)

type AdvancedSelectionModalState = null | { cards: string[]; playerIndex: number }
const [advancedSelectionModal, setAdvancedSelectionModal] = useState<AdvancedSelectionModalState>(null)

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

  setScryRequest((state, { playerIndex, cards }) => {
    // Mostrar modal y esperar a que el usuario decida
    // La lógica de mover cartas se hará directamente desde el modal
    setScryModal({ cards, playerIndex })
    
    // No hacemos nada aquí - el modal manejará todo
    return 'TOP'
  })

  setAdvancedSelectionRequest((state, { playerIndex, cards }) => {
    // Si es el bot, seleccionar automáticamente una carta aleatoria
    if (playerIndex !== 0) {
      console.log('[ADVANCED_SELECTION BOT] auto-selecting random card', { cards })
      
      // Seleccionar una carta aleatoria
      const randomIndex = Math.floor(Math.random() * cards.length)
      const selectedCardId = cards[randomIndex]
      
      const player = state.players[playerIndex]
      const selectedDeckIndex = player.deck.findIndex(c => c === selectedCardId)
      
      if (selectedDeckIndex !== -1 && selectedDeckIndex < cards.length) {
        // Remover la carta seleccionada y ponerla en la mano
        const [selectedCard] = player.deck.splice(selectedDeckIndex, 1)
        player.hand.push(selectedCard)
        console.log('[ADVANCED_SELECTION BOT] drew card', selectedCard)
        
        // Mover las cartas restantes al fondo
        const remainingTopCards: string[] = []
        for (let i = 0; i < cards.length; i++) {
          if (player.deck.length > 0 && player.deck[0] !== selectedCard) {
            const card = player.deck.shift()
            if (card && card !== selectedCard) {
              remainingTopCards.push(card)
            }
          }
        }
        player.deck.push(...remainingTopCards)
        console.log('[ADVANCED_SELECTION BOT] moved remaining cards to bottom', { remainingCount: remainingTopCards.length })
      }
      
      // Forzar actualización del estado
      setGameState(prev => ({ ...prev }))
      return
    }
    
    // Si es el jugador humano, mostrar modal
    console.log('[ADVANCED_SELECTION] showing modal for human player')
    setAdvancedSelectionModal({ cards, playerIndex })
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
      const targetType: TargetType = act?.target === EffectTarget.TARGET_FRIENDLY_CREATURE ? 'CREATURE_SELF' : 'CREATURE_ENEMY'
      setUnifiedTargetModal({
        playerIndex,
        handIndex,
        choice,
        targetType,
        onComplete: (selection: any) => {
          setUnifiedTargetModal(null)
          const targets: any[] = selection.type === 'HERO' 
            ? [{ type: selection.playerType === 'SELF' ? 'HERO_SELF' : 'HERO_ENEMY' }]
            : [{ type: selection.playerType === 'SELF' ? 'CREATURE_SELF' : 'CREATURE_ENEMY', index: selection.index }]
          
          setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev))
            next.pendingTargets = targets as any
            if (next.turn.currentPlayerIndex !== playerIndex) return next
            const res = playCard(next, playerIndex, handIndex, getCardById, { targets: targets as any })
            if (!res.ok) console.warn('playCard failed:', res)
            return next
          })
        }
      })
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
    endTurn: () => {
      console.log('[UI] endTurn clicked', { isMyTurn, currentPlayerIndex: gameState.turn.currentPlayerIndex })
      if (!isMyTurn) {
        console.log('[UI] endTurn blocked - not my turn')
        return
      }
      setGameState(prev => {
        console.log('[UI] endTurn executing', { 
          prevPlayer: prev.turn.currentPlayerIndex,
          prevTurn: prev.turn.turnNumber 
        })
        const next: GameState = JSON.parse(JSON.stringify(prev))
        // endTurn ya inicia automáticamente el turno del siguiente jugador
        engineEndTurn(next)
        console.log('[UI] endTurn completed', { 
          nextPlayer: next.turn.currentPlayerIndex,
          nextTurn: next.turn.turnNumber 
        })
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
    
      // Detectar ATTACK_SPELL que necesita doble targeting
      const hasAttackSpell = card.effects?.some(e => 
        e.timing === EffectTiming.ON_PLAY && 
        e.action?.type === EffectActionType.ATTACK_SPELL
      )
      if (hasAttackSpell) {
        setUnifiedTargetModal({
          playerIndex: pIdx, 
          handIndex, 
          targetType: 'DUAL_CREATURES',
          step: 1,
          onComplete: (selection: any) => {
            if (selection.type === 'DUAL') {
              setUnifiedTargetModal(null)
              setGameState(prev => {
                const next: GameState = JSON.parse(JSON.stringify(prev))
                const targets: any[] = [
                  { type: 'CREATURE_SELF', index: selection.attacker.index },
                  { type: 'CREATURE_ENEMY', index: selection.defender.index }
                ]
                const res = playCard(next, pIdx, handIndex, getCardById, { targets: targets as any })
                if (!res.ok) console.warn('playCard failed:', res)
                return next
              })
            } else {
              // Pasar al paso 2 (seleccionar defensor)
              setUnifiedTargetModal({
                playerIndex: pIdx,
                handIndex,
                targetType: 'DUAL_CREATURES',
                step: 2,
                previousSelection: selection,
                onComplete: (selection2: any) => {
                  setUnifiedTargetModal(null)
                  setGameState(prev => {
                    const next: GameState = JSON.parse(JSON.stringify(prev))
                    const targets: any[] = [
                      { type: 'CREATURE_SELF', index: selection.attacker?.index ?? selection.index },
                      { type: 'CREATURE_ENEMY', index: selection2.defender?.index ?? selection2.index }
                    ]
                    const res = playCard(next, pIdx, handIndex, getCardById, { targets: targets as any })
                    if (!res.ok) console.warn('playCard failed:', res)
                    return next
                  })
                }
              })
            }
          }
        })
        isPlayingRef.current = false
        return
      }
    
      const needsTarget = card.effects?.some(e => {
        if (e.timing !== EffectTiming.ON_PLAY) return false
        return e.action?.target === EffectTarget.TARGET_CREATURE || e.action?.target === EffectTarget.TARGET_FRIENDLY_CREATURE
      })
   if (needsTarget) {
     const wantsFriendly = card.effects?.some(
       e => e.timing === EffectTiming.ON_PLAY && e.action?.target === EffectTarget.TARGET_FRIENDLY_CREATURE
     )
     const targetType: TargetType = wantsFriendly ? 'CREATURE_SELF' : 'CREATURE_ENEMY'
     setUnifiedTargetModal({
       playerIndex: pIdx,
       handIndex,
       targetType,
       onComplete: (selection: any) => {
         setUnifiedTargetModal(null)
         const targets: any[] = selection.type === 'HERO'
           ? [{ type: selection.playerType === 'SELF' ? 'HERO_SELF' : 'HERO_ENEMY' }]
           : [{ type: selection.playerType === 'SELF' ? 'CREATURE_SELF' : 'CREATURE_ENEMY', index: selection.index }]
         
         setGameState(prev => {
           const next: GameState = JSON.parse(JSON.stringify(prev))
           next.pendingTargets = targets as any
           if (next.turn.currentPlayerIndex !== pIdx) return next
           const res = playCard(next, pIdx, handIndex, getCardById, { targets: targets as any })
           if (!res.ok) console.warn('playCard failed:', res)
           return next
         })
       }
     })
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
    setUnifiedTargetModal({
      playerIndex: pIdx,
      handIndex: -1,
      targetType: 'CREATURE_ENEMY',
      onComplete: (selection: any) => {
        setUnifiedTargetModal(null)
        const targets: any[] = selection.type === 'HERO'
          ? [{ type: 'HERO_ENEMY' }]
          : [{ type: 'CREATURE_ENEMY', index: selection.index }]
        
        setGameState(prev => {
          const next: GameState = JSON.parse(JSON.stringify(prev))
          next.pendingTargets = targets as any
          summonSpecimen(next, pIdx)
          return next
        })
      }
    })
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

  // Bot (estilo Hearthstone - sin fases de combate)
  useLayoutEffect(() => {
    if (!BOT_ENABLED) return
    const isBotTurn = !isMyTurn && (gameState.turn.phase === 'PLAYING')
    if (!isBotTurn) return
    if (processedTurnRef.current === botTurnKey) return
    processedTurnRef.current = botTurnKey
    ;(async () => {
      // Bot juega cartas
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
      
      await delay(200)
      
      // Bot ataca con todas sus criaturas
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
        return next
      })
      
      await delay(200)
      
      // Bot termina su turno
      setGameState(prev => {
        const next: GameState = JSON.parse(JSON.stringify(prev))
        if (next.turn.currentPlayerIndex !== meIndex) {
          engineEndTurn(next)
          // endTurn ya llama a startTurn del siguiente jugador
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

      {/* Modal unificado de selección de objetivos */}
      {unifiedTargetModal && (() => {
        const { playerIndex, targetType, onComplete } = unifiedTargetModal
        const selfPlayer = gameState.players[playerIndex]
        const enemyPlayer = gameState.players[1 - playerIndex]

        return (
          <UnifiedTargetModal
            title="Selecciona objetivo"
            subtitle={targetType === 'DUAL_CREATURES' ? undefined : 'Elige un objetivo válido'}
            targetType={targetType}
            selfPlayer={{
              id: selfPlayer.id,
              name: selfPlayer.name,
              board: selfPlayer.board
            }}
            enemyPlayer={{
              id: enemyPlayer.id,
              name: enemyPlayer.name,
              board: enemyPlayer.board
            }}
            getCardById={getCardById}
            onSelect={onComplete}
            onCancel={() => setUnifiedTargetModal(null)}
            step={unifiedTargetModal.step}
            maxStep={targetType === 'DUAL_CREATURES' ? 2 : 1}
            previousSelection={unifiedTargetModal.previousSelection}
          />
        )
      })()}

      {/* Overlay Scry */}
      {scryModal && (() => {
        const { cards, playerIndex } = scryModal
        const card = getCardById(cards[0])
        
        const onKeepTop = () => {
          console.log('[SCRY UI] player chose to KEEP on top', cards[0])
          // No hacemos nada - la carta se queda donde está
          setScryModal(null)
        }
        
        const onPutBottom = () => {
          console.log('[SCRY UI] player chose to PUT on bottom', cards[0])
          // Mover la carta del tope al fondo
          setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev))
            const player = next.players[playerIndex]
            
            if (player.deck.length > 0) {
              const topCard = player.deck.shift() // Remover del tope
              if (topCard) {
                player.deck.push(topCard) // Agregar al fondo
                console.log('[SCRY UI] moved card to bottom', { topCard, newDeckSize: player.deck.length })
              }
            }
            
            return next
          })
          setScryModal(null)
        }
        
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 text-white">
            <div className="bg-gray-900 rounded-xl border-2 border-blue-400 px-8 py-6 shadow-2xl max-w-md text-center">
              <div className="text-3xl font-bold mb-2 text-blue-300">Scry 1</div>
              <div className="text-lg mb-6 text-gray-300">Siguiente carta del mazo:</div>
              
              {card && (
                <div className="mb-6 flex justify-center">
                  <div className="scale-125">
                    <UICard card={card as any} />
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                <button
                  className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition shadow-lg"
                  onClick={onKeepTop}
                >
                  ✓ Dejar Arriba
                </button>
                <button
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-lg transition shadow-lg"
                  onClick={onPutBottom}
                >
                  ↓ Poner al Fondo
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Overlay Advanced Selection (Explorador Audaz) */}
      {advancedSelectionModal && (() => {
        const { cards, playerIndex } = advancedSelectionModal
        
        const onSelectCard = (selectedCardId: string) => {
          console.log('[ADVANCED_SELECTION UI] player selected', selectedCardId)
          
          setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev))
            const player = next.players[playerIndex]
            
            // Encontrar la posición de la carta seleccionada en el deck
            const selectedIndex = player.deck.findIndex(c => c === selectedCardId)
            
            if (selectedIndex !== -1 && selectedIndex < cards.length) {
              // Remover la carta seleccionada del deck y ponerla en la mano
              const [selectedCard] = player.deck.splice(selectedIndex, 1)
              player.hand.push(selectedCard)
              console.log('[ADVANCED_SELECTION UI] drew selected card', selectedCard)
              
              // Mover las cartas restantes (que estaban en el tope) al fondo
              const remainingTopCards: string[] = []
              for (let i = 0; i < cards.length; i++) {
                if (player.deck.length > 0 && player.deck[0] !== selectedCard) {
                  const card = player.deck.shift()
                  if (card && card !== selectedCard) {
                    remainingTopCards.push(card)
                  }
                }
              }
              
              // Poner las cartas restantes al fondo del mazo
              player.deck.push(...remainingTopCards)
              console.log('[ADVANCED_SELECTION UI] moved remaining cards to bottom', { 
                remainingCount: remainingTopCards.length,
                deckSize: player.deck.length 
              })
            }
            
            return next
          })
          
          setAdvancedSelectionModal(null)
        }
        
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 text-white">
            <div className="bg-gray-900 rounded-xl border-2 border-purple-400 px-8 py-6 shadow-2xl max-w-4xl text-center">
              <div className="text-3xl font-bold mb-2 text-purple-300">Selección Avanzada</div>
              <div className="text-lg mb-6 text-gray-300">
                Elige 1 carta para añadir a tu mano. Las demás irán al fondo del mazo.
              </div>
              
              <div className="flex gap-4 justify-center mb-6">
                {cards.map((cardId, idx) => {
                  const card = getCardById(cardId)
                  if (!card) return null
                  
                  return (
                    <div
                      key={`${cardId}-${idx}`}
                      className="cursor-pointer transform transition hover:scale-110 hover:z-10"
                      onClick={() => onSelectCard(cardId)}
                    >
                      <div className="relative">
                        <UICard card={card as any} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-purple-500/20 rounded-lg transition">
                          <span className="text-4xl opacity-0 hover:opacity-100 transition">✓</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="text-sm text-gray-400">
                Haz clic en una carta para seleccionarla
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