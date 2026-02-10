import React from 'react'

interface DiscoverOption {
  id: string
  label: string
  preview?: any
}

interface DiscoverModalProps {
  isOpen: boolean
  options: DiscoverOption[]
  onSelect: (choiceId: string) => void
  onCancel: () => void
}

export function DiscoverModal({ isOpen, options, onSelect, onCancel }: DiscoverModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full border-4 border-yellow-500 shadow-2xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">
          ¡Elige una opción!
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Selecciona cómo quieres jugar esta carta
        </p>

        <div className="grid grid-cols-1 gap-4 mb-6">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 
                text-white font-bold py-6 px-8 rounded-lg transition-all transform hover:scale-105 
                border-2 border-purple-400 shadow-lg hover:shadow-xl"
            >
              <div className="text-xl">{option.label}</div>
              {option.preview && (
                <div className="text-sm text-gray-200 mt-2">
                  {JSON.stringify(option.preview)}
                </div>
              )}
            </button>
          ))}
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
