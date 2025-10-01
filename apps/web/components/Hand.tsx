import React, { useState } from 'react'
import type { Card } from '@infradeck/shared/types/cards'

type Props = {
  ids: string[]
  onPlay: (i: number) => void
  getCard: (id: string) => Card | undefined
  currentMana?: number
  isPlayable?: (c: Card | undefined) => boolean
}

export function Hand({ ids, onPlay, getCard, currentMana, isPlayable }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const width = 160
  const height = 220

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      paddingBottom: 6
    }}>
      {ids.map((id, i) => {
        const c = getCard(id)
        const cost = c?.mana ?? 0
        const manaOK = currentMana === undefined ? true : cost <= currentMana
        const phaseOK = isPlayable ? isPlayable(c) : true
        const canPlay = manaOK && phaseOK
        const isCreature = c?.type === 'CREATURE'

        return (
          <div
            key={i}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(prev => (prev === i ? null : prev))}
          >
            <button
              onClick={() => (typeof onPlay === 'function' ? onPlay(i) : undefined)}
              title={id}
              disabled={!canPlay}
              style={{
                width,
                height,
                padding: 8,
                borderRadius: 8,
                border: '1px solid #AAB',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                opacity: canPlay ? 1 : 0.6,
                cursor: canPlay ? 'pointer' : 'not-allowed',
                display: 'grid',
                gridTemplateRows: 'auto 1fr auto',
                textAlign: 'left'
              }}
            >
              {/* Header: nombre + coste */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: width - 50 }}>
                  {c?.name ?? id}
                </strong>
                <span style={{
                  fontWeight: 800,
                  background: '#e9f5ff',
                  color: '#147',
                  border: '1px solid #cfe8ff',
                  borderRadius: 6,
                  padding: '2px 6px',
                  marginLeft: 6
                }}>
                  {cost}
                </span>
              </div>

              {/* Área central: ATK/HP si criatura */}
              <div style={{ display: 'grid', alignContent: 'center', color: '#223' }}>
                {isCreature ? (
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    ATK/HP: {(c as any)?.attack ?? 0}/{(c as any)?.health ?? 0}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#556' }}>
                    Hechizo / Instant
                  </div>
                )}
              </div>

              {/* Footer: tipo abajo del todo */}
              <div style={{ fontSize: 12, color: '#556' }}>
                {c?.type ?? '-'}
              </div>
            </button>

            {/* Tooltip (hover) con información completa */}
            {hoverIdx === i && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '100%',
                  marginLeft: 8,
                  width: 280,
                  maxHeight: 360,
                  overflow: 'auto',
                  background: '#fff',
                  color: '#111',
                  border: '1px solid #AAB',
                  borderRadius: 8,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                  zIndex: 20,
                  padding: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{c?.name ?? id}</strong>
                  <span style={{ fontWeight: 800 }}>({cost})</span>
                </div>
                <div style={{ fontSize: 12, color: '#555', margin: '4px 0' }}>
                  {(c?.type ?? '')}{c?.classType ? ` · ${c.classType}` : ''}{c?.rarity ? ` · ${c.rarity}` : ''}
                </div>

                {isCreature && (
                  <div style={{ marginBottom: 6 }}>
                    <b>ATK/HP base:</b> {(c as any)?.attack ?? 0}/{(c as any)?.health ?? 0}
                  </div>
                )}

                {Array.isArray((c as any)?.abilities) && (c as any).abilities.length > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 600 }}>Habilidades:</div>
                    <div style={{ fontSize: 12 }}>{(c as any).abilities.join(', ')}</div>
                  </div>
                )}

                {Array.isArray((c as any)?.effects) && (c as any).effects.length > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 600 }}>Efectos:</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {(c as any).effects.map((e: any, idx: number) => (
                        <li key={idx} style={{ fontSize: 12 }}>
                          <b>{String(e.timing)}:</b> {e.description ?? ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {c?.description && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <b>Texto:</b> {c.description}
                  </div>
                )}
                {c?.flavorText && (
                  <div style={{ fontSize: 12, fontStyle: 'italic', color: '#666', marginTop: 2 }}>
                    “{c.flavorText}”
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}