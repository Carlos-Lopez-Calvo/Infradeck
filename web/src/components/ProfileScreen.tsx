import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../config/api'
import { WinLossDonut } from './WinLossDonut'

type MatchRow = {
  id: string
  result: 'win' | 'loss'
  opponentName: string
  finishedAt: string
}

type ProfileScreenProps = {
  onBack: () => void
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user, authFetch, logout, updateUser } = useAuth()
  const [usernameDraft, setUsernameDraft] = useState(user?.username ?? '')
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [matchesLoading, setMatchesLoading] = useState(true)
  const [matchesError, setMatchesError] = useState<string | null>(null)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [matches, setMatches] = useState<MatchRow[]>([])

  useEffect(() => {
    setUsernameDraft(user?.username ?? '')
  }, [user?.username])

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true)
    setMatchesError(null)
    try {
      const res = await authFetch(`${API_BASE}/me/matches`)
      if (!res.ok) throw new Error('fetch_failed')
      const body = (await res.json()) as {
        summary: { wins: number; losses: number }
        matches: MatchRow[]
      }
      setWins(body.summary.wins)
      setLosses(body.summary.losses)
      setMatches(body.matches)
    } catch {
      setMatchesError('No se pudo cargar el historial')
    } finally {
      setMatchesLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    void loadMatches()
  }, [loadMatches])

  const saveUsername = async () => {
    const trimmed = usernameDraft.trim()
    if (!trimmed || trimmed === user?.username) return
    setSavingUsername(true)
    setUsernameError(null)
    try {
      const res = await authFetch(`${API_BASE}/me/username`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        if (body.error === 'username_taken') {
          setUsernameError('Ese nombre ya está en uso')
        } else if (body.error === 'invalid_username_length') {
          setUsernameError('Entre 3 y 24 caracteres')
        } else {
          setUsernameError('No se pudo guardar')
        }
        return
      }
      const body = (await res.json()) as { user: NonNullable<typeof user> }
      if (body.user) {
        updateUser(body.user)
        setUsernameDraft(body.user.username)
      }
    } catch {
      setUsernameError('Error de conexión')
    } finally {
      setSavingUsername(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            ← Menú
          </button>
          <h1 className="text-xl font-semibold tracking-wide text-slate-100">Perfil</h1>
          <div className="w-20" />
        </div>

        <section className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-400">Cuenta</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-slate-500">Email</div>
              <div className="font-medium text-slate-200">{user.email}</div>
            </div>
            {user.createdAt && (
              <div>
                <div className="text-slate-500">Registro</div>
                <div className="font-medium text-slate-200">{formatDate(user.createdAt)}</div>
              </div>
            )}
          </div>
        </section>

        {/* Oro y gemas — descomentar para mostrar
        <section className="mb-6 rounded-2xl border border-amber-700/40 bg-slate-900/50 p-5">
          <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Monedas</h2>
          <div className="flex gap-6 text-sm">
            <div><span className="text-amber-400">{user.gold}</span> oro</div>
            <div><span className="text-violet-400">{user.gems}</span> gemas</div>
          </div>
        </section>
        */}

        {/* Nivel y XP — descomentar para mostrar
        <section className="mb-6 rounded-2xl border border-sky-700/40 bg-slate-900/50 p-5">
          <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Progreso</h2>
          <div className="text-sm">
            Nivel <span className="font-semibold text-sky-300">{user.level}</span>
            {' · '}
            <span className="text-slate-400">{user.xp} XP</span>
          </div>
        </section>
        */}

        <section className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-900/50 p-5">
          <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Nombre de usuario</h2>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={usernameDraft}
              onChange={(e) => setUsernameDraft(e.target.value)}
              maxLength={24}
              className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
            />
            <button
              type="button"
              disabled={savingUsername || usernameDraft.trim() === user.username}
              onClick={() => void saveUsername()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-40"
            >
              {savingUsername ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
          {usernameError && <p className="mt-2 text-sm text-red-400">{usernameError}</p>}
        </section>

        <section className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-900/50 p-5">
          <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-400">Partidas online</h2>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <WinLossDonut wins={wins} losses={losses} />
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold text-emerald-400">{wins}</span>
                <span className="text-slate-400"> victorias</span>
              </div>
              <div>
                <span className="font-semibold text-red-400">{losses}</span>
                <span className="text-slate-400"> derrotas</span>
              </div>
            </div>
          </div>

          <div className="mt-5 max-h-64 space-y-2 overflow-y-auto">
            {matchesLoading && <p className="text-sm text-slate-500">Cargando historial…</p>}
            {matchesError && <p className="text-sm text-red-400">{matchesError}</p>}
            {!matchesLoading && !matchesError && matches.length === 0 && (
              <p className="text-sm text-slate-500">Aún no hay partidas online registradas.</p>
            )}
            {matches.map((m) => {
              const won = m.result === 'win'
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    won
                      ? 'border-emerald-600/50 bg-emerald-950/30 text-emerald-100'
                      : 'border-red-600/50 bg-red-950/30 text-red-100'
                  }`}
                >
                  <div>
                    <span className="font-medium">{won ? 'Victoria' : 'Derrota'}</span>
                    <span className="text-slate-400"> vs </span>
                    <span>{m.opponentName}</span>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(m.finishedAt)}</span>
                </div>
              )
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={() => {
            logout()
            onBack()
          }}
          className="w-full rounded-xl border border-slate-600 py-3 text-sm text-slate-300 hover:bg-slate-900"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
