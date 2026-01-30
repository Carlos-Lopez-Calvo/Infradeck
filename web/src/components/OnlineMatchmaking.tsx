import React, { useState } from 'react'
import { useOnlineGame } from '../context/OnlineGameProvider'

export function OnlineMatchmaking() {
  const {
    isConnected,
    isSearching,
    matchFound,
    opponentName,
    gameState,
    connectToServer,
    disconnectFromServer,
    startMatchmaking,
    cancelMatchmaking,
  } = useOnlineGame()

  const [playerName, setPlayerName] = useState('')

  const handleConnect = async () => {
    try {
      await connectToServer()
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleStartMatchmaking = () => {
    if (!playerName.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }
    startMatchmaking(playerName.trim())
  }

  // Si el juego ya empezó, no mostrar el panel
  if (gameState) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 rounded-xl border-2 border-blue-400 p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-blue-300 mb-6">
          🎮 Infradeck Online
        </h2>

        {!isConnected ? (
          // Estado: No conectado
          <div className="space-y-4">
            <p className="text-gray-300 text-center mb-4">
              Conéctate al servidor para jugar online
            </p>
            <button
              onClick={handleConnect}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Conectar al servidor
            </button>
          </div>
        ) : matchFound ? (
          // Estado: Match encontrado
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-green-300 font-semibold text-xl mb-2">
                ¡Match encontrado!
              </p>
              <p className="text-gray-300">
                Oponente: <span className="text-white font-semibold">{opponentName}</span>
              </p>
              <p className="text-gray-400 text-sm mt-4">
                El juego comenzará en unos segundos...
              </p>
            </div>
          </div>
        ) : isSearching ? (
          // Estado: Buscando partida
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🔄</div>
              <p className="text-blue-300 font-semibold text-xl mb-2">
                Buscando oponente...
              </p>
              <p className="text-gray-400 text-sm">
                Esperando que otro jugador se una
              </p>
            </div>
            <button
              onClick={cancelMatchmaking}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Cancelar búsqueda
            </button>
          </div>
        ) : (
          // Estado: Conectado pero sin buscar partida
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-gray-300 font-semibold">
                Tu nombre:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartMatchmaking()}
                placeholder="Ingresa tu nombre"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
                maxLength={20}
              />
            </div>
            <button
              onClick={handleStartMatchmaking}
              disabled={!playerName.trim()}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
            >
              Buscar partida
            </button>
            <button
              onClick={disconnectFromServer}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
