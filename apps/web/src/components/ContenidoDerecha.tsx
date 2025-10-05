import React from 'react'
import { StackMazo } from './Mazo'

export function ContenidoDerecha({
    deckCount = 20,
    graveyardCount = 5,
    mana = 7,
    classResource,
    handCount = 0,
}: {
    deckCount?: number
    graveyardCount?: number
    mana?: number
    classResource?: { name: string; value: number }
    handCount?: number
}) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full h-1/2 bg-purple-800 rounded-lg flex flex-row items-center justify-center">
                <div className="w-1/2 h-full bg-red-800 rounded-lg flex flex-col items-center justify-center">
                    {classResource ? (
                        <>
                            <span className="font-bold text-sm mb-1">{classResource.name}</span>
                            <span className="text-white font-bold text-lg">{classResource.value}</span>
                        </>
                    ) : (
                        <span className="text-white text-xs">Sin recurso especial</span>
                    )}
                </div>
                <div className="w-1/2 h-full bg-blue-800 rounded-lg flex flex-col items-center justify-center">
                    <div className='w-24 h-24 flex flex-col justify-center items-center rounded-full border bg-red-600'>
                        <span className="text-white font-bold pt-4 text-6xl">{mana}</span>
                    </div>
                </div>
            </div>
            <div className="w-full h-1/2 bg-gray-800 rounded-lg flex flex-row items-center justify-center">
                <div className="w-1/2 h-full bg-blue-800 rounded-lg flex flex-col items-center justify-center">
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
                <div className="w-1/2 h-full bg-red-800 rounded-lg flex flex-col items-center justify-center">
                    <StackMazo count={deckCount} handCount={handCount} />
                </div>
            </div>
        </div>
    )
}

export function ContenidoDerechaOponente({
    deckCount = 20,
    graveyardCount = 5,
    mana = 7,
    classResource,
    handCount = 0,
}: {
    deckCount?: number
    graveyardCount?: number
    mana?: number
    classResource?: { name: string; value: number }
    handCount?: number
}) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full h-1/2 bg-gray-800 rounded-lg flex flex-row items-center justify-center">
                <div className="w-1/2 h-full bg-blue-800 rounded-lg flex flex-col items-center justify-center">
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
                <div className="w-1/2 h-full bg-red-800 rounded-lg flex flex-col items-center justify-center">
                    <StackMazo count={deckCount} handCount={handCount} />
                </div>
            </div>
            <div className="w-full h-1/2 bg-purple-800 rounded-lg flex flex-row items-center justify-center">
                <div className="w-1/2 h-full bg-red-800 rounded-lg flex flex-col items-center justify-center">
                    {classResource ? (
                        <>
                            <span className="font-bold text-sm mb-1">{classResource.name}</span>
                            <span className="text-white font-bold text-lg">{classResource.value}</span>
                        </>
                    ) : (
                        <span className="text-white text-xs">Sin recurso especial</span>
                    )}
                </div>
                <div className="w-1/2 h-full bg-blue-800 rounded-lg flex flex-col items-center justify-center"></div>
            </div>
        </div>
    )
}