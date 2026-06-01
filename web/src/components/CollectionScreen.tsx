import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { COLLECTION_CATALOG_CARDS, ClassType } from '@infradeck/shared'
import type { Card } from '@infradeck/shared'
import { useAuth } from '../context/AuthContext'
import { Card as CardPreview, classTypeColors } from './Card'
import { API_BASE } from '../config/api'

type UserCardRow = { cardId: string; owned: number }

type ClassFilterKey = 'BASIC' | ClassType

const CLASS_FILTER_OPTIONS: { key: ClassFilterKey; label: string }[] = [
  { key: 'BASIC', label: 'Básicas' },
  { key: ClassType.ABOMINACION, label: 'Abominación' },
  { key: ClassType.CAOS, label: 'Caos' },
  { key: ClassType.VITALIDAD, label: 'Vitalidad' },
]

const CLASS_SECTION_ORDER: ClassFilterKey[] = [
  'BASIC',
  ClassType.ABOMINACION,
  ClassType.CAOS,
  ClassType.VITALIDAD,
]

const SECTION_LABELS: Record<ClassFilterKey, string> = {
  BASIC: 'Cartas básicas',
  [ClassType.ABOMINACION]: 'Abominación',
  [ClassType.CAOS]: 'Caos',
  [ClassType.VITALIDAD]: 'Vitalidad',
}

const getCardClassKey = (card: Card): ClassFilterKey =>
  card.classType ? (card.classType as ClassType) : 'BASIC'

const sortCards = (cards: Card[]) =>
  [...cards].sort((a, b) => (a.mana ?? 0) - (b.mana ?? 0) || a.name.localeCompare(b.name))

type CollectionScreenProps = {
  onBack: () => void
}

export function CollectionScreen({ onBack }: CollectionScreenProps) {
  const { authFetch } = useAuth()
  const [collection, setCollection] = useState<UserCardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')
  const [activeFilters, setActiveFilters] = useState<Set<ClassFilterKey>>(
    () => new Set(CLASS_FILTER_OPTIONS.map((o) => o.key)),
  )

  const loadCollection = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(`${API_BASE}/me/collection`)
      if (!res.ok) throw new Error('No se pudo cargar la colección')
      const json = (await res.json()) as UserCardRow[]
      setCollection(Array.isArray(json) ? json : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    void loadCollection()
  }, [loadCollection])

  const ownedById = useMemo(() => {
    const m: Record<string, number> = {}
    for (const r of collection) m[r.cardId] = r.owned
    return m
  }, [collection])

  const toggleFilter = (key: ClassFilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size <= 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const groupedSections = useMemo(() => {
    const q = filterText.trim().toLowerCase()
    const filtered = COLLECTION_CATALOG_CARDS.filter((c) => {
      const classKey = getCardClassKey(c)
      if (!activeFilters.has(classKey)) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.classType?.toLowerCase() ?? 'basica').includes(q) ||
        c.rarity.toLowerCase().includes(q)
      )
    })

    const buckets = new Map<ClassFilterKey, Card[]>()
    for (const key of CLASS_SECTION_ORDER) buckets.set(key, [])
    for (const card of filtered) {
      const key = getCardClassKey(card)
      buckets.get(key)?.push(card)
    }

    return CLASS_SECTION_ORDER.filter((key) => activeFilters.has(key))
      .map((key) => ({
        key,
        label: SECTION_LABELS[key],
        cards: sortCards(buckets.get(key) ?? []),
      }))
      .filter((s) => s.cards.length > 0)
  }, [filterText, activeFilters])

  const totalVisible = groupedSections.reduce((n, s) => n + s.cards.length, 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-slate-200">
        Cargando colección…
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-black to-slate-950 text-slate-100">
      <div className="shrink-0 border-b border-slate-800/80 bg-slate-950/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm hover:bg-slate-800"
            >
              ← Menú
            </button>
            <input
              placeholder="Buscar carta…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-xs rounded-lg border border-slate-600 bg-black/50 px-3 py-2 text-sm"
            />
          </div>

          <header>
            <h1 className="text-xl font-bold tracking-wide">Colección</h1>
            <p className="text-sm text-slate-400">{totalVisible} cartas visibles</p>
          </header>

          <div className="flex flex-wrap gap-2">
            {CLASS_FILTER_OPTIONS.map((opt) => {
              const on = activeFilters.has(opt.key)
              const accent =
                opt.key === 'BASIC' ? '#94a3b8' : classTypeColors[opt.key] ?? '#e2e8f0'
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleFilter(opt.key)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition ${
                    on
                      ? 'text-white shadow-md'
                      : 'border-slate-600 bg-slate-900/60 text-slate-500 hover:border-slate-500'
                  }`}
                  style={
                    on
                      ? {
                          borderColor: accent,
                          backgroundColor: `${accent}22`,
                          boxShadow: `0 0 16px ${accent}44`,
                        }
                      : undefined
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="mx-auto mt-3 max-w-7xl rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-7xl space-y-8">
          {groupedSections.length === 0 ? (
            <p className="text-center text-sm text-slate-500">Ninguna carta coincide con los filtros.</p>
          ) : (
            groupedSections.map((section) => {
              const accent =
                section.key === 'BASIC'
                  ? '#94a3b8'
                  : classTypeColors[section.key] ?? '#e2e8f0'
              return (
                <section key={section.key}>
                  <h2
                    className="mb-3 border-b pb-2 text-sm font-bold uppercase tracking-[0.2em]"
                    style={{ borderColor: `${accent}66`, color: accent }}
                  >
                    {section.label}
                    <span className="ml-2 font-normal text-slate-500">({section.cards.length})</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {section.cards.map((card) => {
                      const owned = ownedById[card.id] ?? 0
                      const borderColor = card.classType
                        ? classTypeColors[card.classType] ?? '#e2e8f0'
                        : '#94a3b8'
                      return (
                        <div
                          key={card.id}
                          className="relative flex flex-col items-center rounded-xl p-2 brightness-105 saturate-110"
                          style={{
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.45))',
                          }}
                        >
                          <div
                            className="rounded-xl border-2 transition"
                            style={{
                              borderColor,
                              boxShadow: `0 0 16px ${borderColor}66, 0 0 4px ${borderColor}33`,
                            }}
                          >
                            <CardPreview card={card} />
                          </div>
                          <span
                            className={`mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              owned > 0
                                ? 'border border-emerald-500/70 bg-emerald-950/60 text-emerald-100'
                                : 'border border-slate-500/80 bg-slate-800/90 text-slate-300'
                            }`}
                          >
                            {owned > 0 ? `×${owned}` : 'No posees'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
