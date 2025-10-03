import React from 'react'

export function Card() {
  return (
    <div className="card w-36 h-48 bg-gray-700 rounded-lg shadow-md flex flex-col items-center justify-center relative">
      {/* Aquí irá la imagen de fondo en el futuro */}
      {/* Contenedor redondo con número en la esquina superior izquierda */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
        <span className="text-black font-bold text-lg flex items-center justify-center w-full h-full">5</span>
      </div>
      {/* Triángulo equilátero en la esquina inferior izquierda */}
      <div className="absolute -bottom-3 -left-3 w-8 h-8 z-10">
        <svg width="32" height="32" viewBox="0 0 32 32">
          <polygon points="0,32 16,4 32,32" fill="#38bdf8" stroke="white" strokeWidth="2" />
          <text x="16" y="24" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold" alignmentBaseline="middle">2</text>
        </svg>
      </div>
      {/* Cuadrado en la esquina inferior derecha */}
      <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-green-500 rounded shadow-lg border-2 border-white flex items-center justify-center z-10">
        <span className="text-white font-bold text-lg flex items-center justify-center w-full h-full">3</span>
      </div>
      <div className='w-full h-2/3'>
        <h1 className='w-full text-lg font-bold text-center'>Card Title</h1>
      </div>
      <div className='w-full h-1/3 bg-gray-500 rounded-lg justify-center items-center flex flex-col'>
        <p className='text-white'>Habilidades</p>
        <p className='text-white'>efectos</p>
        <p className='text-white'>tipo</p>
      </div>
    </div>
  )
}

export function ReversoCard() {
  return (
    <div className="card w-36 h-48 bg-gray-700 rounded-lg shadow-md flex flex-col items-center justify-center relative">
    </div>
  )
}