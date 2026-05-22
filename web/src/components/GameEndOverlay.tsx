import React from 'react'
import { motion } from 'framer-motion'

const VICTORY_PHRASE = 'TRIUMPHAS'
const VICTORY_SUB = 'Gloria y luz te acompañan'
const DEFEAT_PHRASE = 'CECIDISTI'
const DEFEAT_SUB = 'In tenebris peris'

type GameEndOverlayProps = {
  isVictory: boolean
  onExitToMenu?: () => void
}

export function GameEndOverlay({ isVictory, onExitToMenu }: GameEndOverlayProps) {
  const phrase = isVictory ? VICTORY_PHRASE : DEFEAT_PHRASE
  const sub = isVictory ? VICTORY_SUB : DEFEAT_SUB

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[20000] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: isVictory
          ? 'radial-gradient(ellipse at center, rgba(251,191,36,0.12) 0%, rgba(0,0,0,0.97) 55%)'
          : 'radial-gradient(ellipse at center, rgba(30,10,40,0.5) 0%, rgba(0,0,0,0.98) 60%)',
      }}
    >
      <div className="pointer-events-none relative flex flex-col items-center px-6">
        <motion.p
          className={`text-center font-serif text-4xl font-bold tracking-[0.35em] sm:text-5xl ${
            isVictory ? 'text-amber-200' : 'text-violet-300/90'
          }`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVictory ? 1.2 : 1.6, duration: 0.8 }}
        >
          {phrase}
        </motion.p>
        <motion.p
          className={`mt-3 text-center text-sm tracking-[0.2em] uppercase ${
            isVictory ? 'text-amber-100/60' : 'text-violet-400/50'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: isVictory ? 1.6 : 2, duration: 0.7 }}
        >
          {sub}
        </motion.p>
        <motion.p
          className="mt-6 text-center text-base text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: isVictory ? 1.9 : 2.3, duration: 0.5 }}
        >
          {isVictory ? 'Has ganado la partida' : 'Has perdido la partida'}
        </motion.p>
        {onExitToMenu && (
          <motion.button
            type="button"
            onClick={onExitToMenu}
            className="pointer-events-auto mt-10 rounded-lg border border-slate-600 bg-slate-900/90 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isVictory ? 2.2 : 2.6, duration: 0.4 }}
          >
            Volver al menú
          </motion.button>
        )}
      </div>
    </div>
  )
}
