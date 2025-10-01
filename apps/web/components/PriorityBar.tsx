import React from 'react'
export function PriorityBar({ onPass, onNext }: { onPass: ()=>void, onNext: ()=>void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onPass}>Pasar prioridad</button>
      <button onClick={onNext}>Siguiente turno</button>
    </div>
  )
}