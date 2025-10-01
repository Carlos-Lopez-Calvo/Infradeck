import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useGameEngine } from '../hooks/useGameEngine'
import { Hand } from '../components/Hand'
import { Board } from '../components/Board'
import { StackView } from '../components/StackView'
import { PriorityBar } from '../components/PriorityBar'
import { DiscoverModal } from '../components/DiscoverModal'

export default function App() {
  const {
    state, me, opp, stack, phase,
    pass, next, getCardById, targetMode, cancelTarget,
    selectCreature, attackHero, activePlayerIndex, toCombat,
    prioritySeconds, logs, selectHero, playSmart, attackCreature, resolveAllStack, hasPriority, selectStackTop, setDiscoverChooser
  } = useGameEngine()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancelTarget() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cancelTarget])
  const [discoverOpen, setDiscoverOpen] = useState(false)
const [discoverChoices, setDiscoverChoices] = useState<string[]>([])
const discoverResolveRef = useRef<(id: string) => void>()

useEffect(() => {
  setDiscoverChooser(async (choices: string[]) => {
    // abre modal y espera a que el usuario elija
    setDiscoverChoices(choices)
    setDiscoverOpen(true)
    return new Promise<string>((resolve) => {
      discoverResolveRef.current = (id: string) => resolve(id)
    })
  })
}, [setDiscoverChooser])

  

  const Box = ({ label, value, bg, color='#000' }: { label: string, value?: string|number, bg: string, color?: string }) => (
    <div style={{ background:bg, color, padding:8, borderRadius:4, textAlign:'center', fontWeight:600 }}>
      <div style={{ fontSize:12, opacity:0.9 }}>{label}</div>
      {value !== undefined && <div style={{ fontSize:14 }}>{value}</div>}
    </div>
  )

  // Target actual de la carta seleccionada (si lo hay)
  // debajo de los hooks y antes del JSX:
const enemyHasStackItem = stack?.some((it: any) => it.playerIndex === (1 - activePlayerIndex))

// deducimos el target actual desde targetMode + carta seleccionada
const currentTarget = (() => {
  if (!targetMode.active || targetMode.handIndex == null) return null
  const id = me.hand[targetMode.handIndex]
  const card = getCardById(id)
  const eff = (card?.effects ?? []).find(e => String(e?.timing) === 'ON_PLAY' && e?.action?.target)
  return eff?.action?.target ? String(eff.action.target) : null
})()

const isStackTargetable = currentTarget === 'TARGET_SPELL' && enemyHasStackItem
  

  // Resaltado de objetivos de hechizo a criatura (UI)
  const isSpellTargetable = (owner: 'ME'|'OPP', index: number) => {
    if (!targetMode.active || targetMode.handIndex == null || !currentTarget) return false
    if (currentTarget === 'TARGET_CREATURE' || currentTarget === 'ANY_CREATURE') {
      if (owner === 'OPP') {
        const cr = opp.board[index] as any
        const hasStealth = !!cr?.abilities?.some((a: any) => String(a) === 'SIGILO')
        if (hasStealth) return false
      }
      return true
    }
    return false
  }

  // Selección de atacante y objetivos legales (COMBAT)
  const [attackerIdx, setAttackerIdx] = useState<number|null>(null)
  const enemyHasTaunt = opp.board.some((c:any) => (c?.abilities||[]).includes('TAUNT'))

  const canBeAttacker = (i: number) => {
    const c:any = me.board[i]
    if (!c || c.exhausted) return false
    return phase === 'COMBAT'
  }

  const isCombatTargetable = (owner:'ME'|'OPP', j:number) => {
    if (phase !== 'COMBAT' || attackerIdx == null) return false
    if (owner !== 'OPP') return false
    const atk:any = me.board[attackerIdx]
    const def:any = opp.board[j]
    if (!atk || !def) return false
    // Sigilo: no target de combate
    if ((def.abilities||[]).includes('SIGILO')) return false
    if (enemyHasTaunt && !(def.abilities||[]).includes('TAUNT')) return false
    if ((def.abilities||[]).includes('VUELO') && !(atk.abilities||[]).includes('VUELO')) return false
    return true
  }

  const canAttackHeroNow = () => {
    if (phase !== 'COMBAT' || attackerIdx == null) return false
    const atk:any = me.board[attackerIdx]
    if (!atk || atk.exhausted) return false
    if ((atk.abilities||[]).includes('IMPACIENTE')) return false
    if (enemyHasTaunt) return false
    return true
  }

  const crText = (p: typeof me) => {
    const cr = p.classResource
    if (!cr) return '-'
    if (cr.type === 'ENTROPIA' || cr.type === 'CEMENTERIO') return `${cr.type}: ${cr.amount ?? 0}`
    if (cr.type === 'ESTADO') return `Ciclo: ${cr.state}`
    if (cr.type === 'VIDA') return 'Vida'
    return String(cr.type)
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      padding: 12,
      display: 'grid',
      gridTemplateColumns: '140px 1fr 260px',
      gridTemplateRows: 'auto auto auto auto 1fr',
      gap: 12,
      alignItems: 'start',
      boxSizing: 'border-box'
    }}>
      {/* Columna izquierda (OPP) */}
      <div style={{ gridColumn: '1 / 2', display:'grid', gap:8 }}>
        <Box label="vida OPP" value={`${opp.life}/${opp.maxLife}`} bg="#111" color="#fff" />
        <Box label="deck OPP" value={opp.deck.length} bg="#f1e40f" />
        <Box label="mana OPP" value={`${opp.mana}/${opp.maxMana}`} bg="#34d1e0" />
        <Box label="recurso" value={crText(opp)} bg="#355c3a" color="#fff" />
      </div>

      {/* Cabecera central */}
      <div style={{ gridColumn: '2 / 3', overflow: 'auto', minHeight: 0 }}>
        <div style={{ marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ margin:0 }}>Infradeck</h2>
          <div style={{ fontWeight:600 }}>Fase: {phase} · Turno de: {activePlayerIndex === 0 ? 'P1' : 'P2'}</div>
        </div>
        <div>
          <div style={{ fontWeight:600, marginBottom:6 }}>Hand OPP</div>
          <div style={{ display:'flex', gap:8 }}>
            {(new Array(opp.hand.length).fill(0)).map((_, i) => (
              <div key={i} style={{ border:'1px solid #999', padding:6, minWidth:90, textAlign:'center' }}>[Carta]</div>
            ))}
          </div>
        </div>
      </div>

      {/* Columna derecha top: grave OPP */}
      <div style={{ gridColumn: '3 / 4', display:'grid', gap:8 }}>
        <Box label="grave OPP" value={opp.graveyard.length} bg="#000" color="#fff" />
      </div>

      {/* Aviso target mode */}
      <div style={{ gridColumn: '2 / 3' }}>
        {targetMode.active && (
          <div style={{ padding: 8, background:'#fff3cd', border:'1px solid #ffecb5', display:'flex', gap:8, alignItems:'center', borderRadius:4 }}>
            Selecciona objetivo
            <button onClick={cancelTarget}>Cancelar</button>
          </div>
        )}
      </div>

      {/* Board OPP */}
      <div style={{ gridColumn: '2 / 3' }}>
        <div style={{ fontWeight:600, marginBottom:6 }}>Board OPP</div>
        <div style={{ display:'flex', gap:8, alignItems:'center', position:'relative', zIndex:6 }}>
          <Board
            rows={[
                { owner: 'OPP', cards: opp.board.map(c => ({
                    uid: c.id, cardId: c.cardId, attack: c.attack, health: c.health,
                    exhausted: c.exhausted, abilities: c.abilities
                  })) }
            ]}
            canSelect={targetMode.active || (phase==='COMBAT' && attackerIdx!=null)}
            onSelectCreature={(owner, index) => {
              if (targetMode.active) return selectCreature(owner, index)
              // Combate: atacar criatura si hay atacante seleccionado
              if (owner==='OPP' && attackerIdx!=null) {
                const res = attackCreature(attackerIdx, index)
                setAttackerIdx(null)
              }
            }}
            getCard={getCardById}
            isTargetable={(owner, index) => targetMode.active ? isSpellTargetable(owner, index) : isCombatTargetable(owner, index)}
          />
        </div>
      </div>

      {/* Columna derecha: Stack vertical fijo (resaltable si TARGET_SPELL) */}
      <div style={{
        gridColumn: '3 / 4', gridRow: '2 / 6',
        background:'#cf27b8', borderRadius: isStackTargetable ? 10 : 8, padding:8,
        overflow:'auto', minHeight:0, position:'relative', zIndex:6,
        border: isStackTargetable ? '3px solid #2ecc71' : 'none'
      }}>
        <div style={{ fontWeight:700, color:'#fff', marginBottom:8 }}>Stack</div>
        <StackView
  items={stack}
  getCard={(id) => getCardById(id ?? '')}
  selectableTop={isStackTargetable}
  onSelectTop={selectStackTop}
/>
      </div>

      {/* Barra de fases / prioridad */}
      <div style={{ gridColumn: '2 / 3', background:'#c7f9c4', borderRadius:6, padding:8 }}>
      <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
  <PriorityBar onPass={pass} onNext={next}/>
  {hasPriority && (
    <span style={{ fontSize:12, padding:'2px 8px', borderRadius:10, background:'#1e293b', color:'#fff' }}>
      Tienes prioridad
    </span>
  )}
  <button onClick={resolveAllStack}>Resolver todo</button>
  {phase === 'MAIN' && <button onClick={toCombat}>Ir a combate</button>}
  <button onClick={next}>Terminar turno</button>
</div>
      </div>

      {/* Board ME */}
      <div style={{ gridColumn: '2 / 3' }}>
        <div style={{ fontWeight:600, marginBottom:6 }}>Board ME</div>
        <div style={{ display:'flex', gap:8, alignItems:'center', position:'relative', zIndex:6 }}>
          <Board
            rows={[
                { owner: 'ME', cards: me.board.map(c => ({
                    uid: c.id, cardId: c.cardId, attack: c.attack, health: c.health,
                    exhausted: c.exhausted, abilities: c.abilities
                  })) }
            ]}
            canSelect={targetMode.active || (phase==='COMBAT')}
            onSelectCreature={(owner, index) => {
              if (targetMode.active) return selectCreature(owner, index)
              if (owner==='ME' && phase==='COMBAT') {
                if (canBeAttacker(index)) setAttackerIdx(index)
              }
            }}
            onAttackHero={(idx) => {
                if (attackerIdx!==idx || !canAttackHeroNow()) return
                const res = attackHero(idx)
                if (!res.ok) alert(res.error)
                setAttackerIdx(null)
              }}
              showAttackHero={(owner, idx) => owner==='ME' && attackerIdx===idx && canAttackHeroNow()}
            getCard={getCardById}
            isTargetable={(owner, index) =>
              targetMode.active
                ? isSpellTargetable(owner, index)
                : (owner==='ME' && canBeAttacker(index) && (attackerIdx===null || attackerIdx===index))
            }
          />
        </div>
      </div>

      {/* Hand ME */}
      <div style={{ gridColumn: '2 / 3' }}>
        <div style={{ fontWeight:600, marginBottom:6 }}>Hand ME</div>
        <Hand
  ids={me.hand}
  onPlay={playSmart}
  getCard={getCardById}
  currentMana={me.mana}
  isPlayable={(c) =>
    // criaturas/hechizos en MAIN si la pila está vacía (turno del activo)
    (phase === 'MAIN' && stack.length === 0)
    // o si tienes prioridad (MAIN o instant)
    || (hasPriority && (phase === 'MAIN' || c?.type === 'INSTANT'))
  }
/>
      </div>

      {/* Columna izquierda bottom (ME) */}
            {/* Columna izquierda bottom (ME) */}
            <div style={{ gridColumn: '1 / 2', display:'grid', gap:8 }}>
        <Box label="vida ME" value={`${me.life}/${me.maxLife}`} bg="#111" color="#fff" />
        <Box label="mana ME" value={`${me.mana}/${me.maxMana}`} bg="#34d1e0" />
        <Box label="grave ME" value={me.graveyard.length} bg="#000" color="#fff" />
      </div>

      {/* Estado y log */}
      <div style={{ gridColumn: '2 / 3' }}>
        <div style={{ marginTop:12 }}>
          <div style={{ fontWeight:700 }}>Log</div>
          <ul style={{ margin:0, paddingLeft:16 }}>
            {(logs ?? []).map((l, i) => (<li key={i} style={{ fontSize: 12 }}>{l}</li>))}
          </ul>
        </div>
      </div>

      {/* Overlay lateral derecho (solo en target mode) */}
      {targetMode.active && (
        <div style={{
          position:'fixed', top:0, right:0, height:'100vh', width: 300,
          background:'#111827', color:'#fff', padding:12,
          boxShadow:'-6px 0 18px rgba(0,0,0,0.35)', zIndex: 30,
          display:'grid', gridTemplateRows:'auto 1fr auto', gap:12
        }}>
          <div style={{ fontWeight:700, fontSize:16 }}>Objetivos</div>
          <div style={{ overflow:'auto' }}>
            <div style={{ marginBottom:8, fontSize:13, opacity:0.9 }}>
              Carta: {(() => {
                const id = targetMode.handIndex != null ? me.hand[targetMode.handIndex] : undefined
                return getCardById(id ?? '')?.name ?? id ?? '-'
              })()}
            </div>
            <div style={{ marginBottom:12, fontSize:13, opacity:0.85 }}>
              Objetivo: {currentTarget ?? '-'}
            </div>
            {(() => {
              const t = currentTarget
              if (t === 'TARGET_SPELL') {
                return (<div style={{ fontSize:13 }}>- Haz click en la pila enemiga (resaltada) para contrarrestar el top.</div>)
              }
              if (t === 'ENEMY_HERO') {
                return (
                  <div style={{ display:'grid', gap:8 }}>
                    <div style={{ fontSize:13 }}>- Haz click en: Héroe OPP</div>
                    <button onClick={() => (selectHero('OPP'))} style={{ padding:'6px 10px' }}>
                      Héroe OPP
                    </button>
                  </div>
                )
              }
              if (t === 'FRIENDLY_HERO') {
                return (
                  <div style={{ display:'grid', gap:8 }}>
                    <div style={{ fontSize:13 }}>- Haz click en: Tu héroe</div>
                    <button onClick={() => (selectHero('ME'))} style={{ padding:'6px 10px' }}>
                      Héroe ME
                    </button>
                  </div>
                )
              }
              if (t === 'TARGET_CREATURE' || t === 'ANY_CREATURE') {
                return (<div style={{ fontSize:13 }}>- Haz click en una criatura resaltada en verde. Enemigos con Sigilo no se pueden seleccionar.</div>)
              }
              return (<div style={{ fontSize:13 }}>- Selecciona el objetivo indicado en el tablero o la pila.</div>)
            })()}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={cancelTarget} style={{ flex:1, padding:'8px 10px' }}>Cancelar</button>
            </div>
        </div>
      )}
      <DiscoverModal
        open={discoverOpen}
        choices={discoverChoices}
        getCard={getCardById}
        onPick={(id) => {
          setDiscoverOpen(false)
          discoverResolveRef.current?.(id)
        }}
        onCancel={() => {
          setDiscoverOpen(false)
          discoverResolveRef.current?.(discoverChoices[0])
        }}
      />
    </div>
  )
}