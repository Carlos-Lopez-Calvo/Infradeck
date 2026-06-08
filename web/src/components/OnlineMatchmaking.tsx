import React, { useEffect, useState } from 'react'
import { useOnlineGame } from '../context/OnlineGameProvider'
import { useAuth } from '../context/AuthContext'

type OnlineMatchmakingProps = {
  onLeave?: () => void
}

export function OnlineMatchmaking({ onLeave }: OnlineMatchmakingProps) {
  const { user } = useAuth()
  const {
    isSearching,
    matchFound,
    opponentName,
    gameState,
    beginOnlineMatch,
    cancelMatchmaking,
  } = useOnlineGame()

  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (gameState) return

    const playerName = user?.username?.trim()
    if (!playerName) {
      setError('Tu cuenta no tiene nombre de usuario')
      return
    }

    let cancelled = false

    ;(async () => {
      setConnecting(true)
      setError(null)
      try {
        await beginOnlineMatch()
      } catch {
        if (!cancelled) setError('No se pudo conectar al servidor')
      } finally {
        if (!cancelled) setConnecting(false)
      }
    })()

    return () => {
      cancelled = true
      cancelMatchmaking()
    }
  }, [gameState, user?.username, retryKey, beginOnlineMatch, cancelMatchmaking])

  if (gameState) {
    return null
  }

  const displayName = user?.username?.trim() ?? ''

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 rounded-xl border-2 border-blue-400 p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-blue-300 mb-6">
          🎮 Buscando partida
        </h2>

        {error ? (
          <div className="space-y-4 text-center">
            <p className="text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Reintentar
            </button>
          </div>
        ) : matchFound ? (
          <div className="space-y-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-green-300 font-semibold text-xl mb-2">
              ¡Partida encontrada!
            </p>
            <p className="text-gray-300">
              Oponente: <span className="text-white font-semibold">{opponentName}</span>
            </p>
            <p className="text-gray-400 text-sm mt-4">
              El juego comenzará en unos segundos...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🔄</div>
              <p className="text-blue-300 font-semibold text-xl mb-2">
                {connecting ? 'Conectando...' : 'Buscando oponente...'}
              </p>
              {displayName && (
                <p className="text-gray-400 text-sm">
                  Jugando como <span className="text-white font-semibold">{displayName}</span>
                </p>
              )}
              {isSearching && !connecting && (
                <p className="text-gray-500 text-sm mt-2">
                  Esperando que otro jugador se una
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                cancelMatchmaking()
                onLeave?.()
              }}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Cancelar búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
