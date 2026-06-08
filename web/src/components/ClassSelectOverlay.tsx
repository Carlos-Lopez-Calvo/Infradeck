import React from 'react'
import { ClassType } from '@infradeck/shared'

const CLASS_OPTIONS: {
  value: ClassType
  label: string
  image: string
  accent: string
}[] = [
  {
    value: ClassType.ABOMINACION,
    label: 'Abominación',
    image: '/imgCards/pj-amalgama.png',
    accent: '#b11ec2',
  },
  {
    value: ClassType.CAOS,
    label: 'Caos',
    image: '/imgCards/pj-caos.png',
    accent: '#fbbf24',
  },
  {
    value: ClassType.VITALIDAD,
    label: 'Vitalidad',
    image: '/imgCards/vitalidad.png',
    accent: '#990606',
  },
]

type ClassSelectOverlayProps = {
  onSelect: (classType: ClassType) => void
  onClose: () => void
}

function ClassPortrait({
  label,
  image,
  accent,
  onClick,
}: {
  label: string
  image: string
  accent: string
  onClick: () => void
}) {
  const [imgFailed, setImgFailed] = React.useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl border-2 border-slate-600/80 bg-slate-950 shadow-lg transition hover:scale-[1.03] hover:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
      style={{ boxShadow: `0 0 24px ${accent}33` }}
    >
      {!imgFailed ? (
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover object-top transition group-hover:brightness-110"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-800 to-slate-950"
          style={{ borderColor: accent }}
        >
          <span className="text-4xl opacity-40">?</span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <span className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full px-3 py-2 text-center text-sm font-bold tracking-wide text-amber-100 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}

export function ClassSelectOverlay({ onSelect, onClose }: ClassSelectOverlayProps) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-600/80 bg-slate-950/95 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
        >
          Cancelar
        </button>
        <h2 className="mb-2 text-center text-xl font-bold text-slate-100">Elige la clase del mazo</h2>
        <p className="mb-8 text-center text-sm text-slate-400">
          Pasa el cursor sobre el personaje para ver la clase
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
          {CLASS_OPTIONS.map((o) => (
            <ClassPortrait
              key={o.value}
              label={o.label}
              image={o.image}
              accent={o.accent}
              onClick={() => onSelect(o.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
