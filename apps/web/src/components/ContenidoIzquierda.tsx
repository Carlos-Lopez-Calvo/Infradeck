import React from 'react'

export function ContenidoIzquierda() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center bg-purple-700 rounded-t-lg py-4"
       style={{
            backgroundImage: `url('/imgCards/vitalidad.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
        {/* Aquí tu contenido */}
        <div className='w-36 h-36 flex flex-col justify-center items-center rounded-full border'
        style={{
            backgroundImage: `url('/imgCards/vida.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 0 8px 2px #ff0000ff inset'
          }}
        >
          <span className="text-white font-bold pt-3 text-5xl"
          
          >20</span>
          </div>
      </div>
    </div>
  )
}

export function ContenidoIzquierdaOponente() {
  return (
    <div className="relative flex w-full h-full">
      <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center bg-purple-700 rounded-t-lg py-4"
       style={{
            backgroundImage: `url('/imgCards/vitalidad.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
      >
        {/* Aquí tu contenido */}
        <div className='w-36 h-36 flex flex-col justify-center items-center rounded-full border'
        style={{
            backgroundImage: `url('/imgCards/vida.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 0 8px 2px #ff0000ff inset'
          }}
        >
          <span className="text-white font-bold pt-3 text-5xl"
          
          >20</span>
          </div>
          
      </div>
    </div>
  )
}