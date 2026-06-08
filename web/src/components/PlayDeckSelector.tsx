import React from 'react'
import { classLabel, type SavedDeck } from '../utils/play-deck'

type PlayDeckSelectorProps = {
  decks: SavedDeck[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
}

export function PlayDeckSelector({ decks, selectedId, onSelect, loading }: PlayDeckSelectorProps) {
  if (loading) {
    return (
      <p className="mt-6 text-sm text-slate-400">Cargando mazos…</p>
    )
  }

  if (decks.length === 0) {
    return (
      <p className="mt-6 max-w-xl text-sm text-amber-200/80">
        No tienes mazos guardados. Crea uno en Colección → Gestionar mazos.
      </p>
    )
  }

  const selected = decks.find((d) => d.id === selectedId) ?? decks[0]

  return (
    <div className="mt-6 w-full max-w-md">
      <label htmlFor="play-deck-select" className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
        Mazo para la partida
      </label>
      <select
        id="play-deck-select"
        value={selectedId ?? selected.id}
        onChange={(e) => onSelect(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-600/80 bg-slate-950/80 px-4 py-3 text-sm font-medium text-slate-100 shadow-inner outline-none transition focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/30"
      >
        {decks.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} — {classLabel(d.classType)}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-slate-400">
        Clase: <span className="font-semibold text-slate-200">{classLabel(selected.classType)}</span>
        {' · '}
        {selected.cards.reduce((n, c) => n + c.count, 0)} cartas
      </p>
    </div>
  )
}
