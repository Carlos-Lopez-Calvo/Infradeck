import React, { useState } from 'react'
import { ReversoCard } from './Card'

export function StackMazo({
  count = 20,
  handCount = 5,
}: {
  count?: number
  handCount?: number
}) {
  const [hovered, setHovered] = useState(false)
  const visible = Math.min(count, 5)

  return (
    <div
      className="relative w-36 h-48 flex items-end justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {[...Array(visible)].map((_, i) => (
        <div
          key={i}
          className="absolute left-0 bottom-0"
          style={{
            zIndex: i,
            transform: `translateY(-${i * 6}px) scale(${1 - i * 0.04}) rotate(${i * 2 - visible}px)`,
            opacity: 1 - i * 0.12,
          }}
        >
          <ReversoCard />
        </div>
      ))}
      {hovered && (
        <span className="absolute left-0 -translate-x-1/2 bottom-[-2.5rem] bg-black/80 text-white text-sm font-bold rounded px-3 py-1 z-20 whitespace-nowrap shadow-lg">
          {`Cartas en mano: ${handCount} | Cartas en mazo: ${count}`}
        </span>
      )}
    </div>
  )
}