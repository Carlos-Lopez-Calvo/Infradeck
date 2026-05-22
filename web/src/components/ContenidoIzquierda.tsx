import React from 'react'

export function ContenidoIzquierda({
  life = 20,
  onAttackHero,
  onLifeClick,
  lifeClickable = false,
}: {
  life?: number
  onAttackHero?: () => void
  onLifeClick?: () => void
  lifeClickable?: boolean
}) {
  return (
    <div className="relative w-full h-full">
        <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center bg-black rounded-t-lg py-4"
       style={{
            backgroundImage: `url('/imgCards/vitalidad.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
        {/* Aquí tu contenido */}
        <button
          type="button"
          className={`w-36 h-36 flex flex-col justify-center items-center rounded-full border active:scale-95 transition ${
            lifeClickable ? 'cursor-pointer hover:ring-2 hover:ring-amber-400/50' : ''
          }`}
        style={{
            backgroundImage: `url('/imgCards/vida.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 0 8px 2px #ff0000ff inset'
          }}
          onClick={() => {
            if (onLifeClick) {
              onLifeClick()
              return
            }
            onAttackHero?.()
          }}
        >
          <span className="text-white font-bold pt-3 text-5xl">{life}</span>
          </button>
      </div>
    </div>
  )
}

export function ContenidoIzquierdaOponente({ life = 20, onAttackHero }: { life?: number, onAttackHero?: () => void }) {
  return (
    <div className="relative flex w-full h-full">
      <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center bg-black rounded-t-lg py-4"
       style={{
            backgroundImage: `url('/imgCards/vitalidad.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
      >
        {/* Aquí tu contenido */}
        <button
          className='w-36 h-36 flex flex-col justify-center items-center rounded-full border active:scale-95 transition'
        style={{
            backgroundImage: `url('/imgCards/vida.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 0 8px 2px #ff0000ff inset'
          }}
          onClick={onAttackHero}
        >
          <span className="text-white font-bold pt-3 text-5xl">{life}</span>
          </button>
          
      </div>
    </div>
  )
}