import React from 'react'
import { StackMazo } from './Mazo'
import { useGameEngine } from '../context/GameEngineProvider'
import { getSpecimenCost, hasSpecimenOnBoard } from '@infradeck/shared'

export function ContenidoDerecha() {
    const { gameState, currentPlayer, actions, isMyTurn } = useGameEngine()
   const phase = gameState.turn.phase

    const deckCount = currentPlayer.deck.length
    const graveyardCount = currentPlayer.graveyard.length
    const handCount = currentPlayer.hand.length
    const mana = currentPlayer.mana

    const cr = currentPlayer.classResource
    const isAmalgama = currentPlayer.classType === 'ABOMINACION'
    const specimenCost = isAmalgama ? getSpecimenCost(currentPlayer as any) : undefined
    const specimenOnBoard = isAmalgama ? hasSpecimenOnBoard(currentPlayer as any) : false
  const classResource =
    cr?.type === 'ENTROPIA' || cr?.type === 'CEMENTERIO'
      ? { name: cr.type, value: cr.amount ?? 0 }
      : cr?.type === 'VIDA'
      ? { name: 'VIDA', value: currentPlayer.life }
      : undefined

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full h-1/2 bg-black rounded-lg flex flex-row items-center justify-center">
            <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center">
          {classResource ? (
            <>
              <span className="font-bold text-sm mb-1">{classResource.name}</span>
              {'value' in classResource && classResource.value != null ? (
                <span className="text-white font-bold text-lg">{classResource.value}</span>
              ) : (
                <span className="text-white text-xs">Recurso</span>
              )}
              {isAmalgama && (
                <button
                  className="mt-3 px-3 py-2 rounded-lg border border-white/30 bg-emerald-700 text-white text-sm disabled:opacity-50"
                  disabled={!isMyTurn || specimenOnBoard || (specimenCost ?? 0) > mana}
                  onClick={() => actions.summonSpecimen()}
                  title={
                    specimenOnBoard
                      ? 'Ya tienes un espécimen en el campo'
                      : `Invocar G4BR13L (${specimenCost ?? 0} maná)`
                  }
                >
                  Invocar G4BR13L ({specimenCost ?? 0})
                </button>
              )}
            </>
          ) : (
            <span className="text-white text-xs">Sin recurso especial</span>
          )}
        </div>
                    <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center">
    <button
        className='w-24 h-24 flex flex-col justify-center items-center rounded-full border bg-red-600 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed'
        onClick={() => {
            if (isMyTurn) {
                actions.endTurn() // Termina tu turno y pasa al oponente
            }
        }}
        disabled={!isMyTurn}
        title={isMyTurn ? 'Terminar Turno' : 'Turno del Oponente'}
    >
        <span className="text-white font-bold text-lg">
            {isMyTurn ? 'Terminar' : 'Esperando'}
        </span>
        <span className="text-white text-xs">
            {isMyTurn ? 'Turno' : 'oponente'}
        </span>
    </button>
</div>
            </div>
            <div className="w-full h-1/2 bg-black rounded-lg flex flex-row items-center justify-center">
                <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center">
                    <div
                        className='w-24 h-24 flex flex-col justify-center items-center rounded-full border'
                        style={{
                            backgroundImage: `url('/imgCards/mana-texture.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: '0 0 8px 2px #60a5fa inset'
                        }}
                    >
                        <span className="text-white font-bold pt-4 text-6xl">{mana}</span>
                    </div>
                </div>
                <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center">
                    <StackMazo count={deckCount} handCount={handCount} />
                </div>
            </div>
        </div>
    )
}

export function ContenidoDerechaOponente() {
    const { opponentPlayer } = useGameEngine()

    const deckCount = opponentPlayer.deck.length
    const handCount = opponentPlayer.hand.length
    const mana = opponentPlayer.mana

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full h-1/2 bg-black rounded-lg flex flex-row items-center justify-center">
                
                <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center">
                    <StackMazo count={deckCount} handCount={handCount} />
                </div>
                <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center">
                    <div
                        className='w-24 h-24 flex flex-col justify-center items-center rounded-full border'
                        style={{
                            backgroundImage: `url('/imgCards/mana-texture.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            boxShadow: '0 0 8px 2px #60a5fa inset'
                        }}
                    >
                        <span className="text-white font-bold pt-4 text-6xl">{mana}</span>
                    </div>
                </div>
            </div>
            <div className="w-full h-1/2 bg-black rounded-lg flex flex-row items-center justify-center">
            <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center"></div>

                <div className="w-1/2 h-full bg-black rounded-lg flex flex-col items-center justify-center">
                    <span className="text-white text-xs">Sin recurso especial</span>
                </div>
            </div>
        </div>
    )
}
