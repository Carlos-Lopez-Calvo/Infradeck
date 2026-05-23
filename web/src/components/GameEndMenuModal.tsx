import React from 'react'
import { motion } from 'framer-motion'

type GameEndMenuModalProps = {
  onSurrender: () => void
  onResumeGame: () => void
}

export function GameEndMenuModal({ onSurrender, onResumeGame }: GameEndMenuModalProps) {
  return (
    <div className="fixed inset-0 z-[21000] flex items-center justify-center bg-black/60 px-6">
      <motion.div
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-slate-700/80 bg-zinc-950/95 p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <button
          type="button"
          onClick={onSurrender}
          className="rounded-xl border-2 border-red-600/80 bg-red-950/60 px-6 py-4 text-center text-lg font-bold tracking-wide text-red-300 transition hover:bg-red-900/70 hover:text-red-100"
        >
          Rendirse
        </button>
        <button
          type="button"
          onClick={onResumeGame}
          className="rounded-xl border-2 border-emerald-600/80 bg-emerald-950/50 px-6 py-4 text-center text-lg font-bold tracking-wide text-emerald-300 transition hover:bg-emerald-900/60 hover:text-emerald-100"
        >
          Volver a la partida
        </button>
      </motion.div>
    </div>
  )
}
