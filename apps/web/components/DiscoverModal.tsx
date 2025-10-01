import React, { useEffect } from 'react'
import type { Card } from '@infradeck/shared/types/cards'

export function DiscoverModal({
  open, choices, onPick, onCancel, getCard
}: {
  open: boolean
  choices: string[]
  onPick: (id: string) => void
  onCancel: () => void
  getCard: (id: string) => Card | undefined
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onCancel])

  if (!open) return null
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.55)',
      display:'grid', placeItems:'center', zIndex:1000
    }}>
      <div style={{
        background:'#0b1220', color:'#fff', padding:16, borderRadius:10, minWidth:520,
        boxShadow:'0 12px 32px rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.12)'
      }}>
        <div style={{ fontWeight:800, marginBottom:12, fontSize:16 }}>Elige 1 carta del cementerio</div>
        <div style={{ display:'flex', gap:12 }}>
          {choices.map(id => {
            const c = getCard(id)
            return (
              <button key={id}
                onClick={() => onPick(id)}
                title={c?.name ?? id}
                style={{
                  flex:1, border:'1px solid #335', padding:12, borderRadius:8, cursor:'pointer',
                  background:'linear-gradient(180deg,#162036,#0f172a)', color:'#e5e7eb', textAlign:'left'
                }}>
                <div style={{ fontWeight:800, marginBottom:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {c?.name ?? id}
                </div>
                <div style={{ fontSize:12, opacity:0.85, marginBottom:8 }}>
                  {c?.type}{c?.classType ? ` · ${c.classType}` : ''}{c?.mana != null ? ` · ${c.mana}` : ''}
                </div>
                {c?.type === 'CREATURE' && (
                  <div style={{ fontSize:12, opacity:0.95 }}>
                    ATK/HP: {(c as any).attack ?? 0}/{(c as any).health ?? 0}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div style={{ marginTop:12, textAlign:'right' }}>
          <button onClick={onCancel}
            style={{ padding:'6px 10px', borderRadius:6, background:'#1f2937', color:'#e5e7eb', border:'1px solid #334155' }}>
            Cancelar (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}