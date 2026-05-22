import React, { useRef, useState } from 'react'
import { Card, ReversoCard } from './Card'
import { useGameEngine } from '../context/GameEngineProvider'
import { getCardByIdGlobal } from '@infradeck/shared'
import { HAND_CARD_DRAG_MIME } from '../constants/game-drag'

export function Hand() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [isHandHovered, setIsHandHovered] = useState(false)
  const { currentPlayer, actions, isMyTurn } = useGameEngine()
  const suppressClickRef = useRef(false)

  const resolveViewCard = (cardId: string) => {
    const base: any = getCardByIdGlobal(cardId)
    if (!base) return null
    return {
      ...base,
      abilities: Array.isArray(base.abilities) ? base.abilities : [],
      effects: Array.isArray(base.effects) ? base.effects : [],
    }
  }

  const handItems = currentPlayer.hand.map((id, idx) => ({ card: resolveViewCard(id), handIndex: idx }))

  const playFromHand = (handIndex: number) => {
    if (!isMyTurn) return
    actions.playFromHand(handIndex)
  }

  return (
    <div
      className="hand absolute -bottom-[10%] left-0 w-full h-48 flex items-center justify-center transition-all duration-300 hover:bottom-[4%]"
      onMouseEnter={() => setIsHandHovered(true)}
      onMouseLeave={() => setIsHandHovered(false)}
    >
      {handItems.map(({ card, handIndex }, i) => {
        const total = handItems.length
        const denom = Math.max(total - 1, 1)
        const invRatio = Math.max(10 / Math.max(total, 1), 1)
        const dirRatio = Math.min(total / 10, 1)

        const baseSpread = 20
        const baseOffset = isHandHovered ? 80 : 60
        const baseArc = 80
        const baseLift = 60
        const baseScaleHover = 1.5

        const isSingle = total === 1
        const spread = isSingle ? 0 : baseSpread * invRatio
        const start = -spread / 2
        const angle = isSingle ? 0 : isHandHovered ? 0 : start + (spread / denom) * i
        const offsetX = isSingle ? 0 : (i - denom / 2) * (baseOffset * invRatio)
        const arcHeight = isSingle ? 0 : baseArc
        const t = (i - denom / 2) / (denom / 2)
        const offsetY = isSingle ? 0 : isHandHovered ? 0 : -arcHeight * (1 - t * t)
        const hoverLift = baseLift * invRatio
        const scaleHovered = 1 + (baseScaleHover - 1) * dirRatio

        const isHovered = hovered === i

        return (
          <div
            key={handIndex}
            role="button"
            tabIndex={isMyTurn ? 0 : -1}
            draggable={isMyTurn}
            className="absolute left-1/2 bottom-0 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
            style={{
              transform: `translate(-50%, 0%) translateX(${offsetX}px) translateY(${offsetY + (isHovered ? -hoverLift : 0)}px) scale(${isHovered ? scaleHovered : 1}) rotate(${angle}deg)`,
              zIndex: isHovered ? 100 : i,
              opacity: isMyTurn ? 1 : 0.6,
              cursor: isMyTurn ? 'grab' : 'not-allowed',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onDragStart={(e) => {
              if (!isMyTurn) {
                e.preventDefault()
                return
              }
              suppressClickRef.current = true
              e.dataTransfer.setData(HAND_CARD_DRAG_MIME, String(handIndex))
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnd={() => {
              window.setTimeout(() => {
                suppressClickRef.current = false
              }, 0)
            }}
            onClick={() => {
              if (suppressClickRef.current) return
              playFromHand(handIndex)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                playFromHand(handIndex)
              }
            }}
          >
            {card ? <Card card={card} /> : <ReversoCard />}
          </div>
        )
      })}
    </div>
  )
}

export function OpponentHand({ hoveredIndex = null }) {
  const { opponentPlayer } = useGameEngine()
  const cards = Array.from({ length: opponentPlayer.hand.length })

  return (
    <div className="opponent-hand absolute -top-[15%] left-0 w-full h-48 flex items-center justify-center pointer-events-auto">
      {cards.map((_, i) => {
        const total = cards.length
        const denom = Math.max(total - 1, 1)
        const invRatio = Math.max(10 / Math.max(total, 1), 1)

        const baseSpread = 20
        const baseOffset = 60
        const baseArc = 80
        const baseHoverLift = 60

        const spread = baseSpread * invRatio
        const start = -spread / 2
        const angle = start + (spread / denom) * i
        const offsetX = (i - denom / 2) * (baseOffset * invRatio)
        const arcHeight = baseArc
        const t = (i - denom / 2) / (denom / 2)
        const offsetY = arcHeight * (1 - t * t)
        const hoverLift = baseHoverLift * invRatio

        const isHovered = hoveredIndex === i

        return (
          <div
            key={i}
            className="absolute left-1/2 top-0 transition-transform duration-300"
            style={{
              transform: `translate(-50%, 0%) translateX(${offsetX}px) translateY(${offsetY + (isHovered ? hoverLift : 0)}px) scale(${isHovered ? 1.25 : 1}) rotate(${-angle}deg)`,
              zIndex: isHovered ? 100 : i,
            }}
          >
            <div style={{ transform: 'rotate(180deg)' }}>
              <ReversoCard />
            </div>
          </div>
        )
      })}
    </div>
  )
}
