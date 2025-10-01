import React from 'react'

type StackItem = {
  id: string
  playerIndex: number
  sourceId?: string
  cardData?: { id: string }
  action?: { type?: string; target?: string }
  targets?: any[]
}

export function StackView({
  items = [],
  getCard,
  selectableTop = false,
  onSelectTop
}: {
  items: StackItem[],
  getCard?: (id?: string) => any,
  selectableTop?: boolean,
  onSelectTop?: () => void
}) {
  if (!items || items.length === 0) return <div style={{ color:'#fff', opacity:0.8 }}>Vacío</div>

  const topIndex = items.length - 1

  const nameOf = (id?: string) => {
    if (!id) return '-'
    const c = getCard?.(id)
    return c?.name ?? id
  }

  const targetLabel = (t: any): string => {
    if (!t) return ''
    if (Array.isArray(t)) return t.map(targetLabel).filter(Boolean).join(', ')
    if (t.kind) {
      if (t.kind === 'HERO') return 'Héroe'
      if (t.kind === 'CREATURE') return `Criatura p${t.playerIndex}#${t.index}`
      if (t.kind === 'MULTI') return `Multi(${t.scope})`
      if (t.kind === 'RANDOM_ENEMY') return 'Enemigo aleatorio'
      if (t.kind === 'SELF') return 'Self'
      if (t.kind === 'STACK_TOP_ENEMY') return 'Hechizo enemigo (top)'
    }
    return ''
  }

  return (
    <div style={{ display:'grid', gap:8 }}>
      {items.map((it, i) => {
        const isTop = i === topIndex
        const src = it.cardData?.id ?? it.sourceId

        const clickable = isTop && selectableTop
        const onClick = clickable ? onSelectTop : undefined

        return (
          <div
            key={it.id || i}
            onClick={onClick}
            style={{
              background: isTop ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              border: isTop ? (clickable ? '3px solid #2ecc71' : '2px solid #2ecc71') : '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              padding: 8,
              color:'#fff',
              cursor: clickable ? 'pointer' : 'default'
            }}
            title={clickable ? 'Seleccionar hechizo superior de la pila' : undefined}
          >
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <strong>P{(it.playerIndex ?? 0) + 1}</strong>
              {isTop && <span style={{ fontSize:12, background:'#2ecc71', color:'#0b2', padding:'0 6px', borderRadius:4 }}>TOP</span>}
            </div>
            <div style={{ fontSize:13 }}>
              <div><b>Fuente:</b> {nameOf(src)}</div>
              <div><b>Acción:</b> {String(it.action?.type ?? '-')}</div>
              <div><b>Objetivo:</b> {targetLabel(it.targets)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}