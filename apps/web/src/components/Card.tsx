import React, { useState } from 'react'
import type { Card as CardType, Ability } from '@infradeck/shared'
import { EffectTiming } from '@infradeck/shared'
import { useGameEngine } from '../context/GameEngineProvider'

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
  CICLO: '#fbbf24',
  VITALIDAD: '#990606ff',
  // añade más si tienes otras clases
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
  const [hoveredTiming, setHoveredTiming] = useState<number | null>(null)

  // Si no hay classType, usa blanco por defecto
  const classColor = card.classType ? classTypeColors[card.classType] || '#fff' : '#fff'

  // Descuento activo y coste efectivo
  const { currentPlayer } = useGameEngine()
  const red = currentPlayer?.cardCostReduction
  const redActive = !!(red && red.amount > 0 && (red.remaining === 'ALL' || (typeof red.remaining === 'number' && red.remaining > 0)))
  const baseMana = card.mana ?? 0
  const effectiveMana = redActive ? Math.max(0, baseMana - (red?.amount ?? 0)) : baseMana

  return (
    <div
      className="card w-36 h-48 bg-gray-700 rounded-lg shadow-md flex flex-col items-center justify-center border-2 relative"
      style={{
        borderColor: classColor,
        backgroundImage: `url(${card.image || '/imgCards/reverso.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Coste de maná en la esquina superior derecha */}
      <div className='w-full h-[55%] flex flex-col mx-auto p-1'>
        <div
          className='flex w-6 h-6 rounded-full border text-center justify-center items-center'
          style={{
            backgroundImage: `url('/imgCards/mana-texture.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 0 8px 2px #60a5fa inset',
            borderColor: classColor,
          }}
        >
            <span className={`font-bold text-lg ${redActive ? 'text-green-400' : 'text-white'}`}>{effectiveMana}</span>
        </div>
      </div>
      <div
        className='w-full h-[45%] rounded-lg border-t flex flex-col px-1 bg-gray-900/40'
        style={{ borderTopColor: classColor, paddingBottom: '1.5rem' }} // <-- Añade espacio inferior
      >
        <h1
          className='w-full text-xs font-bold text-center rounded-lg border-b'
          style={{ borderBottomColor: classColor }}
        >
          {card.name}
        </h1>
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
        <div className="w-full max-h-16 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
          {card.effects.map((effect, idx) => (
            <p key={idx} className='text-white text-[10px] relative'>
              <span
                className="font-bold cursor-pointer"
                onMouseEnter={() => setHoveredTiming(idx)}
                onMouseLeave={() => setHoveredTiming(null)}
              >
                {timingNames[effect.timing] || effect.timing}:
              </span>{" "}
              {effect.description.replace(/^[^:]+:\s*/i, "")}
            </p>
          ))}
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
        className='w-full flex flex-row justify-between items-center absolute left-0 bottom-0'
      >
           {card.type === 'CREATURE' && card.attack !== undefined && (
          <div
            className='w-1/4 bg-red-600 justify-center items-center flex rounded-bl-lg rounded-tr-lg border'
            style={{
              backgroundImage: `url('/imgCards/ataque.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderColor: classColor,
            }}>
           
              <span className="w-full text-white font-bold text-sm text-center">{card.attack}</span>
           
          </div> )}
          
          <p className='w-full text-[10px] text-center text-white rounded-t-lg mb-0'>
            {card.type}
          </p>
          {card.type === 'CREATURE' && card.health !== undefined && (
          <div
            className='w-1/4 justify-center items-center flex rounded-br-lg rounded-tl-lg border-l border-t border'
            style={{
              backgroundImage: `url('/imgCards/vida.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderLeftColor: classColor,
              borderTopColor: classColor,
              borderColor: classColor,
            }}
          >
            
              <span className="text-white font-bold text-sm">{card.health}</span>
          
          </div>  )}
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




