import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PlayDeckSelector } from './PlayDeckSelector'
import {
  SELECTED_DECK_STORAGE_KEY,
  toPlayDeckConfig,
  type PlayDeckConfig,
  type SavedDeck,
} from '../utils/play-deck'

const API_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl && envUrl.trim()) return envUrl.trim()
  if (typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:3001`
  return 'http://localhost:3001'
})()

type HomeScreenProps = {
  onPlayDeckChange?: (deck: PlayDeckConfig | null) => void
  onStartLocal: (deck: PlayDeckConfig) => void
  onStartOnline: () => void
  onOpenCollection: () => void
  onOpenDecks: () => void
}

type SectionId = 'play' | 'cards' | 'shop' | 'missions' | 'extras'

type MenuSection = {
  id: SectionId
  title: string
  subtitle: string
  description: string
  badge?: string
  accent: 'gold' | 'blue'
}

const sections: MenuSection[] = [
  // {
  //   id: 'extras',
  //   title: 'Extras',
  //   subtitle: 'Modes and social',
  //   description: 'Extra features and side activities are under development.',
  //   accent: 'blue',
  // },
  {
    id: 'cards',
    title: 'Colecction',
    subtitle: 'Collection and decks',
    description: 'Review your collection, tune archetypes, and build new lists.',
    accent: 'blue',
  },
  {
    id: 'play',
    title: 'Play',
    subtitle: 'Ranked and casual battles',
    description: 'Enter the arena and challenge rivals in tactical duels.',
    accent: 'gold',
  },
  // {
  //   id: 'shop',
  //   title: 'Shop',
  //   subtitle: 'Bundles and cosmetics',
  //   description: 'Limited offers and premium customization are coming soon.',
  //   accent: 'blue',
  // },
  // {
  //   id: 'missions',
  //   title: 'Missions',
  //   subtitle: 'Daily progression',
  //   description: 'Track tasks, rewards, and event milestones.',
  //   accent: 'blue',
  // },
]

function MenuPlaceholderIcon({ id, active }: { id: SectionId; active: boolean }) {
  const baseStroke = active ? 'rgba(226,232,240,0.95)' : 'rgba(226,232,240,0.75)'
  const glow = active ? 'drop-shadow(0 0 6px rgba(250,204,21,0.45))' : 'none'

  if (id === 'play') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" style={{ filter: glow }}>
        <circle cx="12" cy="12" r="9" stroke={baseStroke} strokeWidth="1.5" />
        <path d="M10 8.5L16 12L10 15.5V8.5Z" stroke={baseStroke} strokeWidth="1.5" fill="rgba(251,191,36,0.2)" />
      </svg>
    )
  }

  if (id === 'cards') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" style={{ filter: glow }}>
        <rect x="6" y="5" width="11" height="14" rx="2" stroke={baseStroke} strokeWidth="1.5" />
        <rect x="8.5" y="3.5" width="11" height="14" rx="2" stroke={baseStroke} strokeWidth="1.5" opacity="0.75" />
      </svg>
    )
  }

  if (id === 'shop') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" style={{ filter: glow }}>
        <path d="M5 9H19L18 19H6L5 9Z" stroke={baseStroke} strokeWidth="1.5" />
        <path d="M9 9V7.5C9 5.9 10.2 5 12 5C13.8 5 15 5.9 15 7.5V9" stroke={baseStroke} strokeWidth="1.5" />
      </svg>
    )
  }

  if (id === 'missions') {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" style={{ filter: glow }}>
        <rect x="6" y="4" width="12" height="16" rx="2" stroke={baseStroke} strokeWidth="1.5" />
        <path d="M9 9H15M9 13H14M9 17H12" stroke={baseStroke} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" style={{ filter: glow }}>
      <circle cx="12" cy="12" r="6.5" stroke={baseStroke} strokeWidth="1.5" />
      <path d="M12 3.5V6M12 18V20.5M20.5 12H18M6 12H3.5M17.5 6.5L15.8 8.2M8.2 15.8L6.5 17.5M17.5 17.5L15.8 15.8M8.2 8.2L6.5 6.5" stroke={baseStroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function HomeScreen({
  onPlayDeckChange,
  onStartLocal,
  onStartOnline,
  onOpenCollection,
  onOpenDecks,
}: HomeScreenProps) {
  const { user, token, authFetch } = useAuth()
  const [activeSection, setActiveSection] = useState<SectionId>('play')
  const [renderedSection, setRenderedSection] = useState<SectionId>('play')
  const [panelVisible, setPanelVisible] = useState(true)
  const [decks, setDecks] = useState<SavedDeck[]>([])
  const [decksLoading, setDecksLoading] = useState(false)
  const onPlayDeckChangeRef = useRef(onPlayDeckChange)
  onPlayDeckChangeRef.current = onPlayDeckChange
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(SELECTED_DECK_STORAGE_KEY)
  })

  useEffect(() => {
    if (!token) {
      setDecks([])
      setDecksLoading(false)
      return
    }

    let cancelled = false
    setDecksLoading(true)

    ;(async () => {
      try {
        const res = await authFetch(`${API_BASE}/me/decks`)
        if (!res.ok) throw new Error('fetch failed')
        const json = (await res.json()) as SavedDeck[]
        const list = Array.isArray(json) ? json : []
        if (cancelled) return
        setDecks(list)
        setSelectedDeckId((prev) => {
          if (prev && list.some((d) => d.id === prev)) return prev
          return list[0]?.id ?? null
        })
      } catch {
        if (!cancelled) setDecks([])
      } finally {
        if (!cancelled) setDecksLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, authFetch])

  useEffect(() => {
    if (!selectedDeckId) return
    localStorage.setItem(SELECTED_DECK_STORAGE_KEY, selectedDeckId)
  }, [selectedDeckId])

  const selectedPlayDeck = useMemo(() => {
    const row = decks.find((d) => d.id === selectedDeckId) ?? decks[0]
    if (!row) return null
    return toPlayDeckConfig(row)
  }, [decks, selectedDeckId])

  const canStartWithDeck = Boolean(selectedPlayDeck)

  const lastNotifiedDeckIdRef = useRef<string | null>(null)
  useEffect(() => {
    const id = selectedPlayDeck?.id ?? null
    if (lastNotifiedDeckIdRef.current === id) return
    lastNotifiedDeckIdRef.current = id
    onPlayDeckChangeRef.current?.(selectedPlayDeck)
  }, [selectedPlayDeck])

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        key: `particle-${index}`,
        left: `${6 + ((index * 11) % 84)}%`,
        top: `${8 + ((index * 13) % 78)}%`,
        delay: `${(index * 0.55) % 6}s`,
        duration: `${6 + (index % 5)}s`,
        size: `${1 + (index % 3)}px`,
      })),
    [],
  )

  useEffect(() => {
    if (activeSection === renderedSection) return
    setPanelVisible(false)
    const timer = window.setTimeout(() => {
      setRenderedSection(activeSection)
      setPanelVisible(true)
    }, 170)
    return () => window.clearTimeout(timer)
  }, [activeSection, renderedSection])

  useEffect(() => {
    document.body.setAttribute('data-menu-section', activeSection)
    return () => {
      document.body.removeAttribute('data-menu-section')
    }
  }, [activeSection])

  const current = sections.find((section) => section.id === renderedSection) ?? sections[0]

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="menu-fog absolute inset-0 opacity-80" />
      <div className="menu-sweep absolute inset-0" />

      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <span
            key={particle.key}
            className="menu-particle absolute rounded-full bg-sky-200/70"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_52%,rgba(59,130,246,0.19),transparent_45%),radial-gradient(circle_at_82%_28%,rgba(147,51,234,0.22),transparent_46%),linear-gradient(180deg,rgba(2,6,23,0.28),rgba(2,6,23,0.86)_58%,rgba(2,6,23,0.97))]" />

      <div className="relative z-10 flex h-screen flex-col px-6 pb-6 pt-5 md:px-10">
        <header className="mb-5 rounded-2xl bg-slate-950/40 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl tracking-wide text-slate-100 md:text-3xl">Infradeck</h1>

            <div className="flex items-center gap-3 rounded-xl bg-slate-900/55 px-3 py-2 text-slate-200">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900" />
              <div className="text-sm font-semibold text-sky-100">{user?.username ?? 'Guest'}</div>
            </div>
          </div>
        </header>

        <main className="flex h-full flex-1 flex-col gap-6">
          <section className="relative min-h-0 flex-1 overflow-hidden rounded-3xl p-6 md:p-8">
            <div className="absolute -left-10 -top-16 h-44 w-44 rounded-full bg-sky-400/18 blur-3xl" />
            <div className="absolute -bottom-20 right-8 h-56 w-56 rounded-full bg-violet-500/14 blur-3xl" />

            <div
              className={`relative flex h-full flex-col transition-all duration-300 ${
                panelVisible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.26em] text-slate-400">Selected section</div>
                  <h2 className="mt-1 text-4xl text-slate-100">{current.title}</h2>
                </div>
              </div>

              <p className="max-w-2xl text-base text-slate-200/95 md:text-lg">{current.description}</p>

              {current.id === 'play' && (
                <PlayDeckSelector
                  decks={decks}
                  selectedId={selectedDeckId}
                  onSelect={setSelectedDeckId}
                  loading={decksLoading}
                />
              )}

              {current.id === 'play' && (
                <div className="mt-auto flex flex-wrap justify-center gap-3 pb-2 pt-8">
                  <button
                    type="button"
                    disabled={!canStartWithDeck}
                    onClick={() => canStartWithDeck && onStartOnline()}
                    className="min-w-[180px] rounded-xl border border-slate-700/75 bg-slate-900/52 px-7 py-4 text-base font-semibold tracking-[0.08em] text-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.32)] transition-all duration-300 hover:scale-[1.03] hover:border-sky-300/45 hover:bg-slate-800/58 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    Friendly
                  </button>
                  <button
                    type="button"
                    disabled={!canStartWithDeck}
                    onClick={() => canStartWithDeck && onStartOnline()}
                    className="min-w-[200px] rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-300/30 via-amber-100/22 to-yellow-300/34 px-8 py-4 text-base font-semibold tracking-[0.08em] text-amber-50 shadow-[0_0_36px_rgba(251,191,36,0.45)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_44px_rgba(251,191,36,0.55)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    Ranked
                  </button>
                  <button
                    type="button"
                    disabled={!canStartWithDeck}
                    onClick={() => {
                      if (selectedPlayDeck) onStartLocal(selectedPlayDeck)
                    }}
                    className="min-w-[180px] rounded-xl border border-slate-700/75 bg-slate-900/52 px-7 py-4 text-base font-semibold tracking-[0.08em] text-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.32)] transition-all duration-300 hover:scale-[1.03] hover:border-sky-300/45 hover:bg-slate-800/58 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    Bots
                  </button>
                </div>
              )}

              {current.id === 'cards' && (
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={onOpenCollection}
                    className="rounded-xl border border-sky-200/60 bg-sky-300/12 px-6 py-3 text-sm font-semibold tracking-[0.08em] text-sky-100 shadow-[0_8px_26px_rgba(56,189,248,0.26)] transition-all duration-300 hover:scale-[1.03] hover:bg-sky-300/18"
                  >
                    Open Collection
                  </button>
                  <button
                    onClick={onOpenDecks}
                    className="rounded-xl border border-slate-500/70 bg-slate-800/50 px-6 py-3 text-sm font-semibold tracking-[0.08em] text-slate-100 transition-all duration-300 hover:scale-[1.03] hover:border-slate-300/65 hover:bg-slate-700/55"
                  >
                    Manage Decks
                  </button>
                </div>
              )}

              {/* shop / missions / extras — desactivados por ahora
              {(current.id === 'shop' || current.id === 'missions' || current.id === 'extras') && (
                <div className="mt-8">
                  <button
                    type="button"
                    className="cursor-not-allowed rounded-xl border border-slate-500/70 bg-slate-900/65 px-6 py-3 text-sm font-semibold tracking-[0.08em] text-slate-300"
                  >
                    Coming Soon
                  </button>
                </div>
              )}
              */}
            </div>
          </section>

          <section className="mt-auto h-auto rounded-3xl p-3 backdrop-blur-xl md:p-4">
            <div className="grid grid-cols-2 gap-2 md:max-w-md md:mx-auto md:gap-4">
              {sections.map((section) => {
                const selected = section.id === activeSection
                const activeAccent =
                  section.accent === 'gold'
                    ? 'border-amber-300/75 bg-amber-200/15 shadow-[0_0_30px_rgba(251,191,36,0.26)]'
                    : 'border-sky-300/70 bg-sky-300/14 shadow-[0_0_28px_rgba(56,189,248,0.22)]'

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`group relative rounded-2xl border px-3 py-4 text-center transition-all duration-300 ${
                      selected
                        ? `${activeAccent} -translate-y-0.5 scale-[1.02]`
                        : 'border-slate-700/70 bg-slate-900/42 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-sky-300/45 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-center">
                      <MenuPlaceholderIcon id={section.id} active={selected} />
                    </div>
                    <div className="text-sm uppercase tracking-[0.16em] text-slate-100 md:text-base">{section.title}</div>
                    {section.badge && (
                      <span className="mt-2 inline-flex rounded-full border border-amber-300/60 bg-amber-100/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-100">
                        {section.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

