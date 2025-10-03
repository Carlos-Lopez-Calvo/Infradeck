import React from 'react'
import { Hand, OpponentHand } from './Hand'

export function GameBoard() {
  return (
    <div className="game-board flex flex-col h-screen bg-gray-900 text-white">
      {/* Parte superior */}
      <div className="h-[40%] w-full border-b border-gray-800 flex items-center justify-center">
        {/* 20% - 60% - 20% */}
        <div className="class-left w-1/5 h-full flex items-center justify-center bg-purple-500">
          {/* Contenido izquierdo */}
        </div>
        <div className="w-3/5 h-full flex flex-col">
  {/* Mitad superior */}
  <div className="hand h-1/3 w-full flex items-center justify-center bg-blue-500">
    <OpponentHand />
  </div>
  {/* Mitad inferior */}
  <div className="battlefield h-2/3 w-full flex items-center justify-center bg-blue-400">
    {/* Contenido central inferior */}
  </div>
</div>
        <div className="class-right w-1/5 h-full flex items-center justify-center">
          {/* Contenido derecho */}
        </div>
      </div>
      {/* Div intermedio */}
      {/* Parte inferior */}
      <div className="h-[60%] w-full flex items-center justify-center">
        {/* Contenido de la parte inferior */}
          {/* 20% - 60% - 20% */}
        <div className="class-left w-1/5 h-full flex items-center justify-center bg-gray-500">
          {/* Contenido izquierdo */}
        </div>
        <div className="w-3/5 h-full flex flex-col">
  {/* Mitad superior */}
  <div className="battlefield h-3/5 w-full flex items-center justify-center bg-blue-400">
    {/* Contenido central superior */}
  </div>
  {/* Mitad inferior */}
  <div className="hand h-2/5 w-full flex items-center justify-center bg-blue-500">
    <Hand />
  </div>
</div>
        <div className="class-right w-1/5 h-full flex items-center justify-center bg-gray-500">
          {/* Contenido derecho */}
        </div>
      </div>
    </div>
  )
}