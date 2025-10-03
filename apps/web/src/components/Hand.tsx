import React, { useState } from 'react'
import { Card, ReversoCard } from './Card'

export function Hand() {
  const [hovered, setHovered] = useState<number | null>(null)
  const [isHandHovered, setIsHandHovered] = useState(false)
  const cards = Array.from({ length: 10 })

  const spread = 20 // apertura total en grados

  return (
    <div
      className="hand absolute -bottom-[10%] left-0 w-full h-48 flex items-center justify-center transition-all duration-300 hover:bottom-[4%]"
      onMouseEnter={() => setIsHandHovered(true)}
      onMouseLeave={() => setIsHandHovered(false)}
    >
      {cards.map((_, i) => {
        const total = cards.length
        const start = -spread / 2
        const angle = isHandHovered ? 0 : start + (spread / (total - 1)) * i
        const offsetX = (i - (total - 1) / 2) * (isHandHovered ? 80 : 60)
        const arcHeight = 80
        const t = (i - (total - 1) / 2) / ((total - 1) / 2)
        const offsetY = isHandHovered ? 0 : -arcHeight * (1 - t * t)

        const isHovered = hovered === i

        return (
          <div
            key={i}
            className={`absolute left-1/2 bottom-0 transition-transform duration-300`}
            style={{
              transform: `translate(-50%, 0%) translateX(${offsetX}px) translateY(${offsetY + (isHovered ? -60 : 0)}px) scale(${isHovered ? 1.25 : 1}) rotate(${angle}deg)`,
              zIndex: isHovered ? 100 : i,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <Card />
          </div>
        )
      })}
    </div>
  )
}

// Listo para el servidor: hoveredIndex como prop
export function OpponentHand({ hoveredIndex = null }) {
  const cards = Array.from({ length: 10 })
  const spread = 20

  return (
    <div className="opponent-hand absolute -top-[15%] left-0 w-full h-48 flex items-center justify-center pointer-events-auto">
      {cards.map((_, i) => {
        const total = cards.length
        const start = -spread / 2
        const angle = start + (spread / (total - 1)) * i
        const offsetX = (i - (total - 1) / 2) * 60
        const arcHeight = 80
        const t = (i - (total - 1) / 2) / ((total - 1) / 2)
        const offsetY = arcHeight * (1 - t * t)

        const isHovered = hoveredIndex === i

        return (
          <div
            key={i}
            className="absolute left-1/2 top-0 transition-transform duration-300"
            style={{
              transform: `translate(-50%, 0%) translateX(${offsetX}px) translateY(${offsetY + (isHovered ? 60 : 0)}px) scale(${isHovered ? 1.25 : 1}) rotate(${-angle}deg)`,
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