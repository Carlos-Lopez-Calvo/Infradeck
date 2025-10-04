import React, { useState } from 'react'
import type { Card as CardType, Ability } from '@infradeck/shared'
import { EffectTiming } from '@infradeck/shared'

const jugarTooltip = "Los efectos 'Jugar:' se activan cuando lanzas la carta desde tu mano al campo.";



// Descripciones para el tooltip
const abilityDescriptions: Record<Ability, string> = {
  PRISA: 'Puede atacar el turno que entra.',
  IMPACIENTE: 'Ataca antes que otras criaturas.',
  ROBO_DE_VIDA: 'Recupera vida igual al daño que hace.',
  VENENO: 'Destruye cualquier criatura que dañe.',
  TAUNT: 'Debe ser atacada primero.',
  SIGILO: 'No puede ser objetivo hasta que ataque.',
  ESCUDO: 'Ignora el primer daño recibido.',
  REGENERACION: 'Recupera vida al inicio de cada turno.',
  VUELO: 'Solo puede ser bloqueada por criaturas con vuelo.',
  DOBLE_GOLPE: 'Ataca dos veces por turno.',
}

export function Card({ card }: { card: CardType }) {
  const [hoveredAbility, setHoveredAbility] = useState<Ability | null>(null)
  const [hoveredJugar, setHoveredJugar] = useState<number | null>(null);

  return (
    <div className="card w-36 h-48 bg-gray-700 rounded-lg shadow-md flex flex-col items-center justify-center border-2 border-white relative"
      style={{ backgroundImage: `url(${card.image || '/imgCards/reverso.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Coste de maná en la esquina superior derecha */}
      <div className='w-full h-[55%] flex flex-col mx-auto p-1'>
        <div
  className='flex w-6 h-6 rounded-full border text-center justify-center items-center'
  style={{
    backgroundImage: `url('/imgCards/mana-texture.jpg')`, // Guarda la imagen como gema-blue.jpg en /public/imgCards/
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: '0 0 8px 2px #60a5fa inset',
  }}
>
  <span className="text-white font-bold text-lg">{card.mana}</span>
</div>
      </div>
      <div className='w-full h-[45%] rounded-lg border-t border-white flex flex-col px-1 bg-gray-900/40'>
      <h1 className='w-full text-xs font-bold text-center rounded-lg border-b border-white'>{card.name}</h1>
       {/* Habilidades */}
       {card.abilities.map((ability) => (
  <div
    key={ability}
    className={`font-bold text-[9px] rounded cursor-pointer text-white pt-0.5`}
    onMouseEnter={() => setHoveredAbility(ability)}
    onMouseLeave={() => setHoveredAbility(null)}>
    {ability}
    {hoveredAbility === ability && (
      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-black/80 text-white text-xs rounded px-2 py-1 z-20 whitespace-nowrap shadow-lg">
        {abilityDescriptions[ability]}
      </span>
    )}
  </div>
))}
        {/* Descripciones de efectos */}
        {card.effects.map((effect, idx) => (
          <p key={idx} className='text-white text-[10px] relative'>
            {effect.timing === EffectTiming.ON_PLAY ? (
              <>
                <span
                  className="font-bold"
                  onMouseEnter={() => setHoveredJugar(idx)}
                  onMouseLeave={() => setHoveredJugar(null)}
                  style={{ position: 'relative' }}
                >
                  Jugar:
                  {hoveredJugar === idx && (
                    <span className="fixed left-1/2 -translate-x-1/2 top-full mt-1 bg-black/80 text-white text-[10px] rounded px-2 py-1 z-20 whitespace-nowrap shadow-lg">
                      {jugarTooltip}
                    </span>
                  )}
                </span>{" "}
                {effect.description.replace(/^Jugar:\s*/i, "")}
              </>
            ) : (
              effect.description
            )}
          </p>
        ))}
        {/* Tipo de carta */}
        

<div
  className='w-full flex flex-row justify-between items-center absolute left-0 bottom-0'
>
  <div className='w-1/4 bg-red-600 justify-center items-center flex  rounded-bl-lg rounded-tr-lg border border-white'
  style={{
    backgroundImage: `url('/imgCards/ataque.jpg')`, // Guarda la imagen como vida-texture.jpg en /public/imgCards/
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}>
    {card.attack !== undefined && (
      <span className="w-full text-white font-bold text-sm text-center">{card.attack}</span>
    )}
  </div>
  <p className='w-2/4 text-[10px] text-center text-white rounded-t-lg mb-0'>
    {card.type}
  </p>
  <div className='w-1/4 justify-center items-center flex rounded-br-lg rounded-tl-lg  border-l border-t border-white'
  style={{
    backgroundImage: `url('/imgCards/vida.jpg')`, // Guarda la imagen como vida-texture.jpg en /public/imgCards/
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {card.health !== undefined && (
    <span className="text-white font-bold text-sm">{card.health}</span>
  )}
</div>
</div>
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




