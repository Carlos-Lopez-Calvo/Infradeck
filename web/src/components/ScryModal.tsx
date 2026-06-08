import React from 'react'
import { BASIC_CARDS_BY_ID, CLASS_CARDS_BY_ID } from '@infradeck/shared'

interface ScryModalProps {
  isOpen: boolean
  cardIds: string[]
  onDecision: (decision: 'TOP' | 'BOTTOM') => void
  onCancel: () => void
}

export function ScryModal({ isOpen, cardIds, onDecision, onCancel }: ScryModalProps) {
  if (!isOpen) return null

  // Obtener información de las cartas
  const cards = cardIds.map(id => {
    return BASIC_CARDS_BY_ID[id] || CLASS_CARDS_BY_ID[id] || { id, name: id, cost: '?', description: 'Carta desconocida' }
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full border-4 border-cyan-500 shadow-2xl">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2 text-center">
          🔮 Mira tu mazo
        </h2>
        <p className="text-gray-300 text-center mb-6">
          {cardIds.length === 1 ? 'Esta es la siguiente carta de tu mazo:' : 'Estas son las siguientes cartas de tu mazo:'}
        </p>

        <div className="bg-gray-900 rounded-lg p-6 mb-6 space-y-4">
          {cards.map((card, index) => (
            <div 
              key={index}
              className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4 border-2 border-cyan-300"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-bold text-white">{card.name}</span>
                <span className="text-lg font-bold text-blue-400">{card.cost} 🔷</span>
              </div>
              <p className="text-sm text-gray-300">{card.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-yellow-300 mb-4 font-semibold">
          ¿Qué quieres hacer?
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => onDecision('TOP')}
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 
              text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 
              border-2 border-green-400 shadow-lg hover:shadow-xl"
          >
            <div className="text-lg">⬆️ Mantener Arriba</div>
            <div className="text-xs text-green-100 mt-1">Robarás esta carta</div>
          </button>

          <button
            onClick={() => onDecision('BOTTOM')}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 
              text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 
              border-2 border-red-400 shadow-lg hover:shadow-xl"
          >
            <div className="text-lg">⬇️ Enviar al Fondo</div>
            <div className="text-xs text-red-100 mt-1">No robarás esta carta ahora</div>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
