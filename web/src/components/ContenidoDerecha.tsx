import React from 'react'
import { StackMazo } from './Mazo'
import { useGameEngine } from '../context/GameEngineProvider'
import { getSpecimenCost, getCardByIdGlobal, getCurrentForm } from '@infradeck/shared'

export function ContenidoDerecha() {
    const { gameState, currentPlayer, actions, isMyTurn, setGameState } = useGameEngine()
   const phase = gameState.turn.phase

    const deckCount = currentPlayer.deck.length
    const graveyardCount = currentPlayer.graveyard.length
    const handCount = currentPlayer.hand.length
    const mana = currentPlayer.mana

    const cr = currentPlayer.classResource
    const isAmalgama = currentPlayer.classType === 'ABOMINACION'
    const specimenCost = isAmalgama ? getSpecimenCost(currentPlayer as any) : undefined
  const classResource =
    cr?.type === 'ESTADO'
      ? { name: cr.state ?? 'DIA', value: undefined }
      : cr?.type === 'ENTROPIA' || cr?.type === 'CEMENTERIO'
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
              {cr?.type === 'ESTADO' ? (
                <div className="flex flex-col items-center">
                  {(() => {
                    const state = cr?.state ?? 'DIA'
                    const cfg =
                      state === 'DIA'
                        ? { label: 'Día', icon: '☀️', ring: 'ring-yellow-400', text: 'text-yellow-300', glow: 'shadow-[0_0_12px_rgba(250,204,21,0.4)]' }
                        : state === 'NOCHE'
                        ? { label: 'Noche', icon: '🌙', ring: 'ring-blue-400', text: 'text-blue-300', glow: 'shadow-[0_0_12px_rgba(96,165,250,0.4)]' }
                        : { label: 'Eclipse', icon: '🌓', ring: 'ring-purple-400', text: 'text-purple-300', glow: 'shadow-[0_0_12px_rgba(192,132,252,0.4)]' }
                    return (
                      <>
                        <div className={`w-16 h-16 rounded-full ring-4 ${cfg.ring} ${cfg.glow} grid place-items-center`} title="Estado de Ciclo">
                          <span className="text-2xl">{cfg.icon}</span>
                        </div>
                        <span className={`mt-2 font-bold ${cfg.text}`}>{cfg.label}</span>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <>
                  <span className="font-bold text-sm mb-1">{classResource.name}</span>
                  {'value' in classResource && classResource.value != null ? (
                    <span className="text-white font-bold text-lg">{classResource.value}</span>
                  ) : (
                    <span className="text-white text-xs">Estado</span>
                  )}
                </>
              )}
              {isAmalgama && (
                <button
                  className="mt-3 px-3 py-2 rounded-lg border border-white/30 bg-emerald-700 text-white text-sm disabled:opacity-50"
                  disabled={!isMyTurn || (specimenCost ?? 0) > mana}
                  onClick={() => actions.summonSpecimen()}
                  title={`Invocar G4BR13L (${specimenCost ?? 0} maná)`}
                >
                  Invocar G4BR13L ({specimenCost ?? 0})
                </button>
              )}
              {cr?.type === 'ESTADO' && (
                <button
                  className="mt-2 px-3 py-2 rounded-lg border border-white/30 bg-purple-700 text-white text-sm disabled:opacity-50"
                  disabled={!isMyTurn}
                  title="Forzar Eclipse (solo pruebas)"
                  onClick={() => {
                    setGameState(prev => {
                      const next = JSON.parse(JSON.stringify(prev)) as typeof prev
                      const meIdx = next.players[0].id === currentPlayer.id ? 0 : 1
                      const me = next.players[meIdx]
                      if (me.classResource?.type === 'ESTADO') {
                        me.classResource.state = 'ECLIPSE'
                        // Reaplicar forma de ciclo a mis criaturas en mesa
                        for (let i = 0; i < me.board.length; i++) {
                          const ent = me.board[i]
                          const base = getCardByIdGlobal(ent.cardId) as any
                          if (base && base.dayForm && base.transformsWithCycle === true) {
                            const form = getCurrentForm(base, 'ECLIPSE' as any) || {}
                            ent.attack = form.attack ?? ent.attack
                            // Mantener daño actual si baja el máximo
                            const newMax = form.health ?? ent.health
                            ent.health = Math.min(ent.health, newMax)
                            ent.abilities = Array.isArray(form.abilities)
                              ? form.abilities.map(a => String(a))
                              : (ent.abilities ?? [])
                          }
                        }
                      }
                      return next
                    })
                  }}
                >
                  Forzar Eclipse (test)
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