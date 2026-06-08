import React, { useState } from 'react'
import type { Card as CardType, Ability } from '@infradeck/shared'
import { EffectTiming } from '@infradeck/shared'
import { useGameEngine } from '../context/GameEngineProvider'
import { useGameEngineOptional } from '../context/GameEngineProvider'

const timingTooltips: Record<string, string> = {
  ON_PLAY: "Se activa al jugar la carta desde tu mano.",
  ON_ENTER: "Se activa al entrar al tablero.",
  ON_DEATH: "Se activa cuando la carta muere.",
  ON_ATTACK: "Se activa cuando esta carta ataca.",
  START_OF_TURN: "Se activa al inicio de tu turno.",
  END_OF_TURN: "Se activa al final de tu turno.",
  INSTANT: "Se activa inmediatamente al jugarse.",
  TRIGGERED: "Se activa cuando se cumple una condición.",
  PASSIVE: "Efecto permanente mientras la carta está en juego.",
}

export const classTypeColors: Record<string, string> = {
  CAOS: '#fbbf24',
  ABOMINACION: '#b11ec2ff',
  VITALIDAD: '#990606ff',
  // añade más si tienes otras clases
}

const cardTypeNames: Record<string, string> = {
  CREATURE: 'Criatura',
  SPELL: 'Hechizo',
}

const timingNames: Record<string, string> = {
  ON_PLAY: "Jugar",
  ON_ENTER: "Entrar",
  ON_DEATH: "Morir",
  ON_ATTACK: "Atacar",
  START_OF_TURN: "Inicio de turno",
  END_OF_TURN: "Final de turno",
  INSTANT: "Instantáneo",
  TRIGGERED: "Condicional",
  PASSIVE: "Pasivo",
}

// Descripciones para el tooltip
const abilityDescriptions: Record<Ability, string> = {
  PRISA: 'Puede atacar el turno que entra.',
  IMPACIENTE: 'Puede atacar el turno que entra, pero ese turno solo puede atacar criaturas.',
  ROBO_DE_VIDA: 'Recupera vida igual al daño que hace.',
  VENENO: 'Destruye cualquier criatura que dañe.',
  TAUNT: 'Debe ser atacada primero.',
  SIGILO: 'No puede ser objetivo hasta que ataque.',
  ESCUDO: 'Ignora el primer daño recibido.',
  REGENERACION: 'Recupera vida al inicio de cada turno.',
  VUELO: 'Solo puede ser bloqueada por criaturas con vuelo.',
  DOBLE_GOLPE: 'Ataca dos veces por turno.',
}


export function Card({ card, showMana = true }: { card: CardType; showMana?: boolean }) {
  const [hoveredAbility, setHoveredAbility] = useState<Ability | null>(null)
  const [hoveredTiming, setHoveredTiming] = useState<number | null>(null)

  // Si no hay classType, usa blanco por defecto
  const classColor = card.classType ? classTypeColors[card.classType] || '#fff' : '#fff'

  // Descuento activo y coste efectivo
  const ge = useGameEngineOptional()
const red = ge?.currentPlayer?.cardCostReduction
const redActive = !!(red && red.amount > 0 && (red.remaining === 'ALL' || (typeof red.remaining === 'number' && red.remaining > 0)))
const baseMana = card.mana ?? 0
const effectiveMana = redActive ? Math.max(0, baseMana - (red?.amount ?? 0)) : baseMana

return (
  <div
    className="card w-28 md:w-32 lg:w-36 xl:w-40 aspect-[3/4] h-auto bg-gray-700 rounded-lg shadow-md flex flex-col items-center justify-center border-2 relative"
    style={{
      borderColor: classColor,
      backgroundImage: `url(${card.image || '/imgCards/reverso.png'})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
      {/* Coste de maná en la esquina superior derecha */}
      
  <div className='w-full h-[55%] flex flex-col mx-auto p-1'>
  {showMana && (
    <div
      className='flex w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded-full border text-center justify-center items-center'
      style={{
        backgroundImage: `url('/imgCards/mana-texture.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 0 8px 2px #60a5fa inset',
        borderColor: classColor,
      }}
    >
      <span className={`font-bold text-base md:text-lg lg:text-xl ${redActive ? 'text-green-400' : 'text-white'}`}>{effectiveMana}</span>
    </div>
    )}
  </div>

      <div
        className='w-full h-[45%] min-h-0 rounded-lg border-t flex flex-col px-1 bg-gray-900/40 overflow-hidden'
        style={{ borderTopColor: classColor, paddingBottom: '1.5rem' }}
      >
                <h1
          className='w-full text-[10px] md:text-xs font-bold text-white text-center rounded-lg border-b'
          style={{ borderBottomColor: classColor }}
        >
          {card.name}
        </h1>
        <div className="w-full min-h-0 flex-1 overflow-y-auto scrollbar-none text-start flex flex-col gap-0.5 overscroll-contain">
        {/* Habilidades */}
        <div className="flex flex-row flex-wrap items-center gap-1 shrink-0">
  {card.abilities.map((ability) => (
    <div
      key={ability}
      className="font-bold flex flex-row gap-2 text-[8px] md:text-[9px] lg:text-[10px] rounded cursor-pointer text-start text-white pt-0.5"
      onMouseEnter={() => setHoveredAbility(ability)}
      onMouseLeave={() => setHoveredAbility(null)}
    >
      {ability}
      {hoveredAbility === ability && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-black/80 text-white text-[10px] md:text-xs rounded px-2 py-1 z-20 whitespace-nowrap shadow-lg">
          {abilityDescriptions[ability]}
        </span>
      )}
    </div>
  ))}
</div>
        {/* Descripciones de efectos */}
          {card.effects.length > 0 ? card.effects.map((effect, idx) => (
            <p key={idx} className='text-white text-[10px] relative leading-tight shrink-0'>
              <span
                className="font-bold cursor-pointer"
                onMouseEnter={() => setHoveredTiming(idx)}
                onMouseLeave={() => setHoveredTiming(null)}
              >
                {timingNames[effect.timing] || effect.timing}:
              </span>{" "}
              {effect.description.replace(/^[^:]+:\s*/i, "")}
            </p>
          )) : (
            <p className='text-white text-[10px] leading-tight shrink-0'>
              {card.description || 'Sin texto de efecto.'}
            </p>
          )}
        </div>
        {/* Tooltips debajo de la carta: solo para efectos/timing, no para habilidades */}
        {hoveredTiming !== null && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-[-2.2rem] bg-black/80 text-white text-xs rounded px-2 py-1 z-50 whitespace-nowrap shadow-lg">
           {timingTooltips[card.effects[hoveredTiming].timing]}
          </span>
        )}
      </div>
      {/* Tipo de carta y stats */}
      <div
        className='w-full flex flex-row justify-between items-center absolute left-0 bottom-0 m-0 p-0'
      >
           {card.type === 'CREATURE' && card.attack !== undefined && (
          <div
            className='w-1/4 bg-red-600 justify-center items-center flex rounded-bl-md rounded-tr-lg border-t border-r'
            style={{
              backgroundImage: `url('/imgCards/ataque.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderColor: classColor,
            }}>
           
              <span className="w-full text-white font-bold text-xs md:text-sm text-center">{card.attack}</span>
           
          </div> )}
          
          <p className='w-full text-[9px] md:text-[10px] text-center text-white rounded-t-lg mb-0'>
            {cardTypeNames[card.type] ?? card.type}
          </p>
          {card.type === 'CREATURE' && card.health !== undefined && (
          <div
            className='w-1/4 justify-center items-center flex rounded-br-md rounded-tl-lg border-l border-t m-0 p-0'
            style={{
              backgroundImage: `url('/imgCards/vida.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderLeftColor: classColor,
              borderTopColor: classColor,
              borderColor: classColor,
            }}
          >
            
            <span className="text-white font-bold text-xs md:text-sm">{card.health}</span>
          
          </div>  )}
        </div>
      </div>
  )
}

export function ReversoCard() {
  return (
    <div
      className="card w-36 h-48 rounded-lg shadow-md flex flex-col items-center justify-center relative border border-black/40"
      style={{
        backgroundImage: `url('/imgCards/photo-wood-texture-pattern.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
    </div>
  )
}




