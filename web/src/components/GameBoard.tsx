import React, { useState } from 'react'
import { Hand, OpponentHand } from './Hand'
import { ContenidoIzquierda, ContenidoIzquierdaOponente } from './ContenidoIzquierda'
import { ContenidoDerecha, ContenidoDerechaOponente } from './ContenidoDerecha'
import { Card } from './Card'
import { getCardByIdGlobal } from '@infradeck/shared'
import { useGameEngine } from '../context/GameEngineProvider'
import { HAND_CARD_DRAG_MIME } from '../constants/game-drag'


export function GameBoard() {
  const { currentPlayer, opponentPlayer, actions, isMyTurn, gameState, onMyLifeClick } = useGameEngine()
  const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null)
  const canAct = isMyTurn
  const [hoverPreview, setHoverPreview] = useState<any | null>(null)
  const [playDropActive, setPlayDropActive] = useState(false)

  const handlePlayFieldDragOver = (e: React.DragEvent) => {
    if (!canAct) return
    if (!e.dataTransfer.types.includes(HAND_CARD_DRAG_MIME)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setPlayDropActive(true)
  }

  const handlePlayFieldDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setPlayDropActive(false)
    if (!canAct) return
    const raw = e.dataTransfer.getData(HAND_CARD_DRAG_MIME)
    if (raw === '') return
    const handIndex = Number.parseInt(raw, 10)
    if (Number.isNaN(handIndex)) return
    actions.playFromHand(handIndex)
  }
  return (
    <>
    {Boolean(hoverPreview) && (
      <div className="fixed top-4 left-4 z-[999] pointer-events-none">
        <div className="scale-[1.6] origin-top-left drop-shadow-xl">
          <Card card={hoverPreview as any} showMana={false} />
        </div>
      </div>
    )}
    
    <div className="game-board flex flex-col h-screen bg-gray-900 text-white">
      {/* Parte superior */}
      <div className="h-[40%] w-full border-b border-gray-800 flex items-center justify-center">
        {/* 20% - 60% - 20% */}
        <div className="class-left w-1/5 h-full flex items-center justify-center bg-purple-500">
          {/* Contenido izquierdo */}
          <ContenidoDerechaOponente />
          
        </div>
        <div className="w-3/5 h-full flex flex-col">
  {/* Mitad superior */}
  <div
    className="hand h-1/3 w-full flex items-center justify-center bg-black"
    onClick={() => {
      if (selectedAttacker != null && canAct) {
        actions.attackHero(selectedAttacker)
        setSelectedAttacker(null)
      }
    }}
    title="Click para atacar al héroe rival (si tienes un atacante seleccionado)"
  >
            <OpponentHand />
          </div>
          <div className="battlefield h-2/3 w-full flex items-center justify-center bg-black">
            <div className="flex gap-3">
            {opponentPlayer.board.map((c, idx) => {
                // Oponente (battlefield superior)
const base = getCardByIdGlobal(c.cardId)
const preview = base
  ? { ...base, attack: c.attack, health: c.health, abilities: c.abilities }
  : { id: c.cardId, name: 'Token', type: 'CREATURE', rarity: 'BASIC', mana: 0, attack: c.attack, health: c.health, abilities: c.abilities, effects: [], description: '', flavorText: '' }
                return (
                  <button
                    key={c.id ?? `${c.cardId}-${idx}`}
                    className="scale-90"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (selectedAttacker != null && canAct) {
                        actions.attackCreature(selectedAttacker, idx)
                        setSelectedAttacker(null)
                      }
                    }}
                    title="Click para atacar a esta criatura (si tienes un atacante seleccionado)"
                    onMouseEnter={() => {
                      // Tú (battlefield inferior)
const base = getCardByIdGlobal(c.cardId)
const preview = base
  ? { ...base, attack: c.attack, health: c.health, abilities: c.abilities }
  : { id: c.cardId, name: 'Token', type: 'CREATURE', rarity: 'BASIC', mana: 0, attack: c.attack, health: c.health, abilities: c.abilities, effects: [], description: '', flavorText: '' }
                      setHoverPreview(preview as any)
                    }}
                    onMouseLeave={() => setHoverPreview(null)}
                  >
                  
                    <Card card={preview as any} showMana={false} />
                  </button>
                )
              })}
            </div>
          </div>
</div>
        <div className="class-right w-1/5 h-full flex items-center justify-center">
          {/* Contenido derecho */}
          <ContenidoIzquierdaOponente
            life={opponentPlayer.life}
            onAttackHero={() => {
              if (selectedAttacker != null && canAct) {
                actions.attackHero(selectedAttacker)
                setSelectedAttacker(null)
              }
            }}
          />
         
        </div>
      </div>
      {/* Div intermedio */}
      {/* Parte inferior */}
      <div className="h-[60%] w-full flex items-center justify-center">
        {/* Contenido de la parte inferior */}
          {/* 20% - 60% - 20% */}
        <div className="class-left w-1/5 h-full flex items-center justify-center bg-black">
          {/* Contenido izquierdo */}
          <ContenidoIzquierda
              life={currentPlayer.life}
              lifeClickable={Boolean(onMyLifeClick)}
              onLifeClick={onMyLifeClick}
              onAttackHero={() => {
                // No hace nada: atacar a tu propio héroe no procede
              }}
            />
        </div>
        <div className="w-3/5 h-full flex flex-col">
  {/* Mitad superior */}
  <div
            className={`battlefield relative h-3/5 w-full flex items-center justify-center bg-black transition ${
              playDropActive ? 'bg-emerald-950/30 ring-2 ring-inset ring-emerald-400/60' : ''
            }`}
            onDragOver={handlePlayFieldDragOver}
            onDragLeave={() => setPlayDropActive(false)}
            onDrop={handlePlayFieldDrop}
          >
            {playDropActive && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold tracking-wide text-emerald-300/90">
                Suelta para jugar la carta
              </span>
            )}
            <div className="flex gap-3">
            {currentPlayer.board.map((c, idx) => {
                const base = getCardByIdGlobal(c.cardId)
                if (!base) return null
                const isSelected = selectedAttacker === idx
                const canSelect = canAct && !c.exhausted && (c.attack ?? 0) > 0 && c.health > 0
                const preview = base
  ? { ...base, attack: c.attack, health: c.health, abilities: c.abilities }
  : { id: c.cardId, name: 'Token', type: 'CREATURE', rarity: 'BASIC', mana: 0, attack: c.attack, health: c.health, abilities: c.abilities, effects: [], description: '', flavorText: '' }
                return (
                  <button
                    key={c.id ?? `${c.cardId}-${idx}`}
                    className="scale-100"
                    style={{ outline: isSelected ? '2px solid #22c55e' : 'none', opacity: canSelect ? 1 : 0.6, cursor: canSelect ? 'pointer' : 'not-allowed' }}
                    onClick={() => {
                      if (!canSelect) return
                      setSelectedAttacker(isSelected ? null : idx)
                    }}
                    title={canSelect ? (isSelected ? 'Atacante seleccionado' : 'Seleccionar atacante') : 'No puede atacar'}
                    onMouseEnter={() => {
                      const base = getCardByIdGlobal(c.cardId)
                      const preview = base
                        ? { ...base, attack: c.attack, health: c.health, abilities: c.abilities }
                        : { id: c.cardId, name: 'Token', type: 'CREATURE', rarity: 'BASIC', mana: 0, attack: c.attack, health: c.health, abilities: c.abilities, effects: [], description: '', flavorText: '' }
                      setHoverPreview(preview as any)
                    }}
                    onMouseLeave={() => setHoverPreview(null)}
                  >
                    <Card card={preview as any} showMana={false} />
                  </button>
                )
              })}
            </div>
          </div>
  {/* Mitad inferior */}
  <div className="hand h-2/5 w-full flex items-center justify-center bg-black">
    <Hand />
  </div>
</div>
        <div className="class-right w-1/5 h-full flex items-center justify-center bg-black">
          <ContenidoDerecha />
        </div>
      </div>
    </div>
    </>
  )
}
