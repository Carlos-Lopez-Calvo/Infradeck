import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BASIC_CARDS_BY_ID,
  CLASS_CARDS_BY_ID,
  ClassType,
  GAME_CONSTANTS,
  legalCardIdsForDeckClass,
  maxCopiesForRarity,
  validateDeckPayload,
  type Card,
} from '@infradeck/shared'
import { useAuth } from '../context/AuthContext'
import { Card as CardPreview } from './Card'
import { ClassSelectOverlay } from './ClassSelectOverlay'

const API_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl && envUrl.trim()) return envUrl.trim()
  if (typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:3001`
  return 'http://localhost:3001'
})()

const DRAG_CARD_MIME = 'application/x-infradeck-card-id'

type UserCardRow = { cardId: string; owned: number }

type DeckCardRow = { id: string; cardId: string; count: number }

type DeckRow = {
  id: string
  name: string
  classType: string
  cards: DeckCardRow[]
}

type View = 'list' | 'classOverlay' | 'editor'

type ManaFilterKey = number | '7+'

const MANA_FILTER_BUCKETS: ManaFilterKey[] = [0, 1, 2, 3, 4, 5, 6, '7+']

const manaBucketLabel = (key: ManaFilterKey) => (key === '7+' ? '7+' : String(key))

const cardMana = (card: Card) => Math.max(0, card.mana ?? 0)

const cardManaBucket = (card: Card): ManaFilterKey => {
  const m = cardMana(card)
  return m >= 7 ? '7+' : m
}

function getCard(id: string): Card | undefined {
  return BASIC_CARDS_BY_ID[id] ?? CLASS_CARDS_BY_ID[id]
}

type DeckManagerScreenProps = {
  onBack: () => void
}

export function DeckManagerScreen({ onBack }: DeckManagerScreenProps) {
  const { authFetch } = useAuth()
  const [collection, setCollection] = useState<UserCardRow[]>([])
  const [decks, setDecks] = useState<DeckRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [view, setView] = useState<View>('list')
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null)
  const [deckName, setDeckName] = useState('')
  const [lines, setLines] = useState<Record<string, number>>({})
  const [filterText, setFilterText] = useState('')
  const [activeManaFilters, setActiveManaFilters] = useState<Set<ManaFilterKey>>(
    () => new Set(MANA_FILTER_BUCKETS),
  )
  const [deckDropActive, setDeckDropActive] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cRes, dRes] = await Promise.all([
        authFetch(`${API_BASE}/me/collection`),
        authFetch(`${API_BASE}/me/decks`),
      ])
      if (!cRes.ok) throw new Error('No se pudo cargar la colección')
      if (!dRes.ok) throw new Error('No se pudieron cargar los mazos')
      const cJson = (await cRes.json()) as UserCardRow[]
      const dJson = (await dRes.json()) as DeckRow[]
      setCollection(Array.isArray(cJson) ? cJson : [])
      setDecks(Array.isArray(dJson) ? dJson : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const collectionOwned = useMemo(() => {
    const m: Record<string, number> = {}
    for (const r of collection) m[r.cardId] = r.owned
    return m
  }, [collection])

  const totalInDeck = useMemo(() => Object.values(lines).reduce((a, b) => a + b, 0), [lines])

  const validation = useMemo(() => {
    if (!selectedClass) return { isValid: false, errors: [] as { message: string }[] }
    const cardLines = Object.entries(lines).map(([cardId, count]) => ({ cardId, count }))
    return validateDeckPayload({
      classType: selectedClass,
      lines: cardLines,
      getCard,
      collectionOwned,
    })
  }, [selectedClass, lines, collectionOwned])

  const resetEditor = () => {
    setEditingDeckId(null)
    setSelectedClass(null)
    setDeckName('')
    setLines({})
    setFilterText('')
    setActiveManaFilters(new Set(MANA_FILTER_BUCKETS))
    setView('list')
  }

  const startCreate = () => {
    setEditingDeckId(null)
    setSelectedClass(null)
    setDeckName('Nuevo mazo')
    setLines({})
    setFilterText('')
    setActiveManaFilters(new Set(MANA_FILTER_BUCKETS))
    setView('classOverlay')
  }

  const startEdit = (deck: DeckRow) => {
    setEditingDeckId(deck.id)
    setSelectedClass(deck.classType as ClassType)
    setDeckName(deck.name)
    const next: Record<string, number> = {}
    for (const c of deck.cards) next[c.cardId] = (next[c.cardId] ?? 0) + c.count
    setLines(next)
    setFilterText('')
    setActiveManaFilters(new Set(MANA_FILTER_BUCKETS))
    setView('editor')
  }

  const toggleManaFilter = (key: ManaFilterKey) => {
    setActiveManaFilters((prev) => {
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

  const deleteDeck = async (id: string) => {
    if (!confirm('¿Borrar este mazo?')) return
    const res = await authFetch(`${API_BASE}/me/decks/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setError('No se pudo borrar el mazo')
      return
    }
    await loadData()
  }

  const saveDeck = async () => {
    if (!selectedClass || !deckName.trim()) return
    const cards = Object.entries(lines)
      .filter(([, n]) => n > 0)
      .map(([cardId, count]) => ({ cardId, count }))
    const res = await authFetch(`${API_BASE}/me/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingDeckId ?? undefined,
        name: deckName.trim(),
        classType: selectedClass,
        cards,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const details = (body as { details?: { message: string }[] })?.details
      if (Array.isArray(details) && details.length) {
        setError(details.map((d) => d.message).join(' · '))
      } else {
        setError((body as { error?: string })?.error ?? 'No se pudo guardar')
      }
      return
    }
    setError(null)
    await loadData()
    resetEditor()
  }

  const legalIds = useMemo(
    () => (selectedClass ? legalCardIdsForDeckClass(selectedClass) : new Set<string>()),
    [selectedClass],
  )

  const poolCards = useMemo(() => {
    if (!selectedClass) return []
    const out: Card[] = []
    for (const id of legalIds) {
      const c = getCard(id)
      if (!c) continue
      const owned = collectionOwned[id] ?? 0
      if (owned <= 0) continue
      out.push(c)
    }
    const q = filterText.trim().toLowerCase()
    let filtered = q
      ? out.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      : out
    filtered = filtered.filter((c) => activeManaFilters.has(cardManaBucket(c)))
    return filtered.sort((a, b) => cardMana(a) - cardMana(b) || a.name.localeCompare(b.name))
  }, [selectedClass, legalIds, collectionOwned, filterText, activeManaFilters])

  const canAddCard = (cardId: string) => {
    const card = getCard(cardId)
    if (!card) return false
    const cur = lines[cardId] ?? 0
    const owned = collectionOwned[cardId] ?? 0
    const cap = maxCopiesForRarity(card.rarity)
    return totalInDeck < GAME_CONSTANTS.DECK_SIZE && cur < cap && cur < owned
  }

  const addOne = (cardId: string) => {
    if (!canAddCard(cardId)) return
    setLines((prev) => ({ ...prev, [cardId]: (prev[cardId] ?? 0) + 1 }))
  }

  const removeOne = (cardId: string) => {
    setLines((prev) => {
      const n = (prev[cardId] ?? 0) - 1
      const next = { ...prev }
      if (n <= 0) delete next[cardId]
      else next[cardId] = n
      return next
    })
  }

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (!canAddCard(cardId)) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData(DRAG_CARD_MIME, cardId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDeckDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDeckDropActive(true)
  }

  const handleDeckDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDeckDropActive(false)
    const cardId = e.dataTransfer.getData(DRAG_CARD_MIME)
    if (cardId) addOne(cardId)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-slate-200">
        Cargando mazos…
      </div>
    )
  }

  const isEditor = view === 'editor' && selectedClass

  return (
    <div
      className={`bg-gradient-to-b from-slate-950 via-black to-slate-950 text-slate-100 ${
        isEditor ? 'flex h-screen flex-col overflow-hidden' : 'min-h-screen'
      }`}
    >
      {view === 'classOverlay' && (
        <ClassSelectOverlay
          onSelect={(classType) => {
            setSelectedClass(classType)
            setView('editor')
          }}
          onClose={() => setView('list')}
        />
      )}

      <div
        className={`mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 ${
          isEditor ? 'min-h-0 flex-1 py-4' : 'py-6'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-4">
          <button
            type="button"
            onClick={view === 'editor' ? resetEditor : onBack}
            className="rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm hover:bg-slate-800"
          >
            {view === 'editor' ? '← Mazos' : '← Menú'}
          </button>
          {view === 'list' && (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-lg border border-amber-500/60 bg-amber-950/40 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-900/50"
            >
              Crear mazo
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-100">
            {error}
            <button type="button" className="ml-3 underline" onClick={() => setError(null)}>
              Cerrar
            </button>
          </div>
        )}

        {view === 'list' && (
          <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 p-4">
            <h1 className="mb-4 text-xl font-bold tracking-wide">Mis mazos</h1>
            {decks.length === 0 ? (
              <p className="text-slate-400">No tienes mazos guardados. Crea uno con cartas de tu colección.</p>
            ) : (
              <ul className="space-y-2">
                {decks.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-black/30 px-3 py-2"
                  >
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-xs text-slate-400">
                        {d.classType} · {d.cards.reduce((s, c) => s + c.count, 0)} cartas
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(d)}
                        className="rounded border border-slate-500 px-2 py-1 text-xs hover:bg-slate-800"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteDeck(d.id)}
                        className="rounded border border-red-800/80 px-2 py-1 text-xs text-red-200 hover:bg-red-950/50"
                      >
                        Borrar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isEditor && (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="shrink-0 rounded-xl border border-slate-700/80 bg-slate-900/40 p-4">
              <label className="mb-1 block text-xs uppercase text-slate-400">Nombre del mazo</label>
              <input
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                className="w-full max-w-md rounded border border-slate-600 bg-black/50 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                Clase: <span className="text-amber-200/90">{selectedClass}</span>
              </p>
              {editingDeckId && (
                <p className="mt-1 text-xs text-slate-500">La clase no se puede cambiar al editar.</p>
              )}
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_auto] gap-4 lg:grid-cols-3 lg:grid-rows-1">
              <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/40 p-3 lg:col-span-2">
                <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Cartas disponibles</h3>
                  <input
                    placeholder="Filtrar…"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="max-w-[10rem] rounded border border-slate-600 bg-black/40 px-2 py-1 text-xs"
                  />
                </div>
                <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[10px] uppercase tracking-wide text-slate-500">Maná</span>
                  {MANA_FILTER_BUCKETS.map((bucket) => {
                    const on = activeManaFilters.has(bucket)
                    return (
                      <button
                        key={manaBucketLabel(bucket)}
                        type="button"
                        onClick={() => toggleManaFilter(bucket)}
                        className={`min-w-[2rem] rounded-lg border px-2 py-1 text-xs font-bold tabular-nums transition ${
                          on
                            ? 'border-sky-400/70 bg-sky-500/20 text-sky-100 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                            : 'border-slate-600 bg-slate-900/60 text-slate-500 hover:border-slate-500'
                        }`}
                      >
                        {manaBucketLabel(bucket)}
                      </button>
                    )
                  })}
                </div>
                <p className="mb-2 shrink-0 text-[10px] text-slate-500">
                  Clic o arrastra al mazo (máx. {GAME_CONSTANTS.DECK_SIZE})
                </p>
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  {poolCards.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No hay cartas en tu colección para este pool.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {poolCards.map((c) => {
                        const inDeck = lines[c.id] ?? 0
                        const owned = collectionOwned[c.id] ?? 0
                        const cap = maxCopiesForRarity(c.rarity)
                        const canAdd = canAddCard(c.id)
                        return (
                          <div
                            key={c.id}
                            draggable={canAdd}
                            onDragStart={(e) => handleDragStart(e, c.id)}
                            onClick={() => addOne(c.id)}
                            className={`relative cursor-pointer rounded-lg transition ${
                              canAdd ? 'hover:ring-2 hover:ring-amber-400/50' : 'cursor-not-allowed opacity-50'
                            }`}
                            title={`${c.name} · en mazo ${inDeck}/${Math.min(cap, owned)}`}
                          >
                            <CardPreview card={c} />
                            <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-100">
                              {inDeck}/{Math.min(cap, owned)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`flex h-72 min-h-0 max-h-[40vh] shrink-0 flex-col overflow-hidden rounded-xl border bg-amber-950/10 p-3 transition lg:col-span-1 lg:h-auto lg:max-h-full lg:shrink ${
                  deckDropActive ? 'border-amber-400/80 ring-2 ring-amber-400/30' : 'border-amber-900/40'
                }`}
                onDragOver={handleDeckDragOver}
                onDragLeave={() => setDeckDropActive(false)}
                onDrop={handleDeckDrop}
              >
                <div className="mb-2 flex shrink-0 items-center justify-between">
                  <h3 className="text-sm font-semibold text-amber-100">Mazo</h3>
                  <span
                    className={`text-sm font-bold ${totalInDeck === GAME_CONSTANTS.DECK_SIZE ? 'text-emerald-400' : 'text-amber-200'}`}
                  >
                    {totalInDeck}/{GAME_CONSTANTS.DECK_SIZE}
                  </span>
                </div>
                <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
                  {Object.entries(lines)
                    .filter(([, n]) => n > 0)
                    .sort(([a], [b]) => (getCard(a)?.name ?? a).localeCompare(getCard(b)?.name ?? b))
                    .map(([cardId, count]) => {
                      const c = getCard(cardId)
                      if (!c) return null
                      return (
                        <div
                          key={cardId}
                          className="flex items-center justify-between gap-2 rounded border border-amber-900/30 bg-black/30 px-2 py-1.5 text-xs"
                        >
                          <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                          <span className="shrink-0 text-slate-400">×{count}</span>
                          <button
                            type="button"
                            onClick={() => removeOne(cardId)}
                            className="shrink-0 rounded border border-slate-500 px-1.5 py-0.5 hover:bg-slate-800"
                          >
                            −
                          </button>
                        </div>
                      )
                    })}
                  {totalInDeck === 0 && (
                    <p className="py-8 text-center text-xs text-slate-500">
                      Arrastra cartas aquí o haz clic en el pool
                    </p>
                  )}
                </div>
                {!validation.isValid && validation.errors.length > 0 && (
                  <ul className="mt-2 max-h-20 shrink-0 overflow-y-auto list-inside list-disc text-[10px] text-red-300/90">
                    {validation.errors.map((e, i) => (
                      <li key={i}>{e.message}</li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  disabled={!validation.isValid}
                  onClick={() => void saveDeck()}
                  className="mt-3 w-full shrink-0 rounded-lg border border-emerald-600/80 bg-emerald-900/40 py-2 text-sm font-bold text-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Guardar mazo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
