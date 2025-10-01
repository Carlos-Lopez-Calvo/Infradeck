import React, { useEffect, useRef, useState } from 'react'

type CardView = {
  uid: string
  cardId: string
  attack: number
  health: number
  exhausted?: boolean
  abilities?: string[]
}

const ABILITY_COLORS: Record<string, string> = {
  PRISA: '#ff6b6b',
  IMPACIENTE: '#ffa94d',
  ROBO_DE_VIDA: '#51cf66',
  VENENO: '#94d82d',
  TAUNT: '#4dabf7',
  SIGILO: '#868e96',
  ESCUDO: '#fab005',
  REGENERACION: '#22b8cf',
  VUELO: '#845ef7',
  DOBLE_GOLPE: '#e64980',
}

function AbilityChips({ list }: { list?: string[] }) {
  if (!list || list.length === 0) return null
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
      {list.map((a, i) => {
        const key = String(a).toUpperCase()
        const bg = ABILITY_COLORS[key] ?? '#adb5bd'
        return (
          <span
            key={i}
            style={{
              background: bg,
              color:'#fff',
              fontSize:11,
              padding:'2px 6px',
              borderRadius: 10,
              lineHeight: 1,
              letterSpacing: 0.2
            }}
            title={key}
          >
            {key.replace('_',' ')}
          </span>
        )
      })}
    </div>
  )
}

function useStatFlash(entity: CardView) {
  const prev = useRef<{atk:number; hp:number} | null>(null)
  const [flash, setFlash] = useState<{type:'dmg'|'heal'|'buffA'|'buffH'|null; amount?:number}>({ type: null })

  useEffect(() => {
    const p = prev.current
    if (p) {
      if (entity.health < p.hp) setFlash({ type:'dmg', amount: p.hp - entity.health })
      else if (entity.health > p.hp) setFlash({ type:'heal', amount: entity.health - p.hp })
      else if (entity.attack !== p.atk) setFlash({ type:'buffA', amount: Math.abs(entity.attack - p.atk) })
      if (entity.attack !== p.atk || entity.health !== p.hp) {
        const t = setTimeout(() => setFlash({ type: null }), 550)
        return () => clearTimeout(t)
      }
    }
    prev.current = { atk: entity.attack, hp: entity.health }
  }, [entity.uid, entity.attack, entity.health])

  useEffect(() => { prev.current = { atk: entity.attack, hp: entity.health } }, [entity.uid])

  return flash
}

function BoardCard({
  owner, c, i, selectable, targetable, canAttackHero,
  onSelectCreature, onAttackHero, onHover
}: {
  owner: 'ME'|'OPP'
  c: CardView
  i: number
  selectable: boolean
  targetable: boolean
  canAttackHero: boolean
  onSelectCreature?: (owner:'ME'|'OPP', index:number)=>void
  onAttackHero?: (index:number)=>void
  onHover?: (hover: { owner:'ME'|'OPP', index:number } | null) => void
}) {
  const flash = useStatFlash(c)
  const borderColor =
    flash.type === 'dmg' ? '#e03131' :
    flash.type === 'heal' ? '#2f9e44' :
    targetable ? '#2ecc71' : '#999'
  return (
    <div
      onMouseEnter={() => onHover?.({ owner, index: i })}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => selectable && targetable && onSelectCreature?.(owner, i)}
      style={{
        border: `2px solid ${borderColor}`,
        background: targetable ? 'rgba(46, 204, 113, 0.12)' : 'transparent',
        padding: 8, cursor: targetable ? 'pointer' : (selectable ? 'not-allowed' : 'default'),
        minWidth: 170, position:'relative', transition:'border-color 180ms ease, background 180ms ease'
      }}
      title={c.cardId}
    >
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <strong>{c.cardId}</strong>
        <span>{c.attack}/{c.health}</span>
      </div>
      {c.exhausted ? <div style={{ color:'#c00' }}>Exhausted</div> : <div style={{ color:'#2c3e50' }}>Ready</div>}
      <AbilityChips list={c.abilities} />
      {flash.type && flash.amount! > 0 && (
        <div style={{
          position:'absolute', top: -10, right: 6,
          background: flash.type==='dmg' ? '#e03131' : (flash.type==='heal' ? '#2f9e44' : '#228be6'),
          color:'#fff', borderRadius: 12, padding:'2px 6px', fontSize:11, boxShadow:'0 2px 6px rgba(0,0,0,0.2)'
        }}>
          {flash.type==='dmg' ? '-' : '+'}{flash.amount}
        </div>
      )}
      {canAttackHero && (
        <div style={{ marginTop: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); onAttackHero?.(i) }}>
            Atacar héroe
          </button>
        </div>
      )}
    </div>
  )
}

export function Board({
  rows, canSelect, onSelectCreature, onAttackHero, getCard, isTargetable, showAttackHero,
}: {
  rows: { owner: 'ME' | 'OPP'; cards: CardView[] }[]
  canSelect?: boolean
  onSelectCreature?: (owner: 'ME'|'OPP', index: number) => void
  onAttackHero?: (index: number) => void
  getCard?: (id: string) => any
  isTargetable?: (owner: 'ME'|'OPP', index: number) => boolean
  showAttackHero?: (owner: 'ME'|'OPP', index: number) => boolean
}) {
  const [hover, setHover] = useState<{owner:'ME'|'OPP', index:number}|null>(null)
  const hoverCard = hover ? getCard?.(rows.find(r=>r.owner===hover.owner)?.cards[hover.index]?.cardId ?? '') : undefined

  return (
    <div style={{ display: 'grid', gap: 8, position:'relative' }}>
      {rows.map((row, rIdx) => (
        <div key={rIdx} style={{ display:'flex', gap:8 }}>
          {row.cards.map((c, i) => {
            const selectable = !!canSelect
            const targetable = selectable ? (isTargetable ? isTargetable(row.owner, i) : true) : false
            const canAttackHero = !!showAttackHero?.(row.owner, i)
            return (
              <BoardCard
                key={c.uid}
                owner={row.owner}
                c={c}
                i={i}
                selectable={selectable}
                targetable={targetable}
                canAttackHero={canAttackHero}
                onSelectCreature={onSelectCreature}
                onAttackHero={onAttackHero}
                onHover={setHover}
              />
            )
          })}
        </div>
      ))}

      {hover && hoverCard && (
        <div style={{
          position:'absolute', top:0, right:-8, transform:'translateX(100%)',
          background:'#fff', border:'1px solid #aaa', borderRadius:6, padding:8, width:260, zIndex:5
        }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <strong>{hoverCard.name ?? hoverCard.id}</strong>
            <span>({hoverCard.mana ?? 0})</span>
          </div>
          <div style={{ fontSize:12, color:'#555', margin:'4px 0' }}>
            {hoverCard.type}{hoverCard.classType ? ` · ${hoverCard.classType}` : ''}{hoverCard.rarity ? ` · ${hoverCard.rarity}` : ''}
          </div>
          {hoverCard.type === 'CREATURE' && (
            <div style={{ marginBottom:4 }}>ATK/HP base: {hoverCard.attack ?? 0}/{hoverCard.health ?? 0}</div>
          )}
          {Array.isArray(hoverCard.abilities) && hoverCard.abilities.length > 0 && (
            <div style={{ marginBottom:4 }}>
              <div style={{ fontWeight:600 }}>Habilidades:</div>
              <div style={{ fontSize:12 }}>{hoverCard.abilities.join(', ')}</div>
            </div>
          )}
          {Array.isArray(hoverCard.effects) && hoverCard.effects.length > 0 && (
            <div>
              <div style={{ fontWeight:600 }}>Efectos:</div>
              <ul style={{ margin:0, paddingLeft:16 }}>
                {hoverCard.effects.map((e:any, idx:number) => (
                    <li key={idx} style={{ fontSize:12 }}>
                      <b>{String(e.timing)}:</b> {e.description ?? ''}
                    </li>
                ))}
              </ul>
            </div>
          )}
          {hoverCard.description && <div style={{ fontSize:12, marginTop:4 }}>{hoverCard.description}</div>}
          {hoverCard.flavorText && <div style={{ fontSize:12, fontStyle:'italic', color:'#666', marginTop:2 }}>“{hoverCard.flavorText}”</div>}
        </div>
      )}
    </div>
  )
}