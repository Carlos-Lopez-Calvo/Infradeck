import React from 'react'

type LandingProps = {
  onPrimaryAction: () => void
}

export function Landing({ onPrimaryAction }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-black to-slate-950 text-white flex items-center justify-center">
      <div className="max-w-4xl w-full px-6 py-12 text-center space-y-8">
        <div className="space-y-3">
          <div className="text-sm tracking-[0.35em] uppercase text-slate-300">
            Deckbuilder • Roguelike • PvP Online
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            INFRADECK
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Construye mazos imposibles, rompe las reglas del tiempo y desafía a otros jugadores
            en un campo de batalla por turnos inspirado en TCG clásicos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onPrimaryAction}
            className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg shadow-lg shadow-emerald-500/40"
          >
            Jugar ahora
          </button>
          <button
            onClick={onPrimaryAction}
            className="px-8 py-3 rounded-full border border-slate-500/80 text-slate-100 hover:bg-white/5 text-sm"
          >
            Iniciar sesión / Registrarse
          </button>
        </div>

        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Para jugar es necesario tener una cuenta, igual que en Hearthstone o Magic Arena.
          Podrás gestionar tu colección, guardar mazos y jugar partidas tanto locales como online.
        </p>
      </div>
    </div>
  )
}

