import { GameState, CreatureOnBoard, GamePhase, AttackResult, getCardByIdGlobal } from './game-state'
import { addCardToHandOrGraveyard, getCurrentPlayerIndex, getOpponentPlayerIndex } from './turns'
import { hasFinalStandImmunity, checkAndActivateFinalStand } from './final-stand'
import { notifyEffectTriggered, notifyLeaveBattlefield, triggerPriority } from './priority'
import { applyAction } from './effects/dispatcher'
import { updateConditionalBuffs } from './effects/board-effects'
import { Ability, EffectTiming } from '../types/cards'

// =======================
// Helpers de habilidades
// =======================

// Comprueba si una criatura tiene una habilidad concreta
export function hasAbility(creature: CreatureOnBoard, ability: Ability): boolean {
  return creature.abilities?.some(a => a === String(ability)) ?? false
}

// Comprueba si el enemigo tiene alguna criatura con Taunt
export function enemyHasTaunt(state: GameState, enemyIndex: number): boolean {
  return state.players[enemyIndex].board.some(c => hasAbility(c, Ability.TAUNT))
}

// Aplica efectos de habilidades especiales tras eventos de combate
export function applyAbilityEffects(
  state: GameState, 
  creature: CreatureOnBoard, 
  playerIndex: number, 
  event: 'ON_ATTACK' | 'ON_DEFEND' | 'ON_DAMAGE_TAKEN' | 'ON_KILL'
): void {
  const abilities = creature.abilities || []
  
  // REGENERACIÓN: revive con 1 vida al recibir daño mortal
  if (event === 'ON_DAMAGE_TAKEN' && creature.health <= 0 && abilities.includes(String(Ability.REGENERACION))) {
    creature.health = 1
    creature.abilities = creature.abilities.filter(a => a !== String(Ability.REGENERACION))
  }
}

// =======================
// Lógica de combate
// =======================

// Ataque a héroe enemigo (estilo Hearthstone - puedes atacar en cualquier momento)
export function declareAttackHero(state: GameState, attackerIndex: number, attackerBoardIndex: number): AttackResult {
  const active = getCurrentPlayerIndex(state)
  if (attackerIndex !== active) return { ok: false, error: 'No es tu turno' }
  if (state.turn.phase !== GamePhase.PLAYING) return { ok: false, error: 'No puedes atacar ahora' }

  const me = state.players[attackerIndex]
  const oppIndex = getOpponentPlayerIndex(state)
  const opp = state.players[oppIndex]
  const atk = me.board[attackerBoardIndex]
  if (!atk) return { ok: false, error: 'Atacante inválido' }
  if (atk.exhausted) return { ok: false, error: 'Esta criatura está exhausta' }
  if (hasAbility(atk, Ability.IMPACIENTE) && atk.impatientHeroLockThisTurn) {
    return { ok: false, error: 'Impaciente: en su primer turno solo puede atacar criaturas' }
  }

  // TAUNT: si el oponente tiene criaturas con Taunt, debes atacarlas primero
  const taunters = opp.board.filter(c => hasAbility(c, Ability.TAUNT))
  if (taunters.length > 0) {
    return { ok: false, error: 'Debes atacar las criaturas con Taunt primero' }
  }

  // SIGILO: se pierde al atacar
  if (hasAbility(atk, Ability.SIGILO)) {
    atk.abilities = atk.abilities.filter(a => a !== String(Ability.SIGILO))
    console.log(`🫥 ${atk.cardId} pierde Sigilo tras atacar al héroe`)
  }

  // Marcar contexto de ataque para condiciones de efectos (p.ej. ATTACKING_HERO)
  me.lastAttackTargetHero = true
  me.attackersDeclaredThisTurn = (me.attackersDeclaredThisTurn ?? 0) + 1

  // Triggers ON_ATTACK
  notifyEffectTriggered(state, attackerIndex, atk.cardId, 'ON_ATTACK')

  // Daño al héroe
  const damage = atk.attack ?? 0
  const oldLife = opp.life 

  // Final Stand: inmunidad al daño letal
  if (hasFinalStandImmunity(state, oppIndex)) {
    console.log(`🛡️ El objetivo es inmune al daño de ataque (Final Stand)`)
    atk.exhausted = true
    return { ok: true }
  }
  
  opp.life = Math.max(0, opp.life - damage)
  console.log(`⚔️ Ataque al héroe: ${damage} daño (${oldLife} → ${opp.life})`)
  
  // Verificar Final Stand si el daño fue letal
  if (opp.life <= 0 && oldLife > 0) {
    const finalStandActivated = checkAndActivateFinalStand(
      state, 
      oppIndex, 
      attackerIndex
    )
    if (finalStandActivated) {
      console.log(`⚡ Final Stand evitó la muerte por ataque de criatura`)
    }
  }

  // ROBO_DE_VIDA: cura al atacante
  if (damage > 0 && hasAbility(atk, Ability.ROBO_DE_VIDA)) {
    me.life += damage
  }

  // DOBLE_GOLPE: segundo impacto al héroe
  if (hasAbility(atk, Ability.DOBLE_GOLPE)) {
    const secondDamage = atk.attack ?? 0
    opp.life -= secondDamage
    if (secondDamage > 0 && hasAbility(atk, Ability.ROBO_DE_VIDA)) {
      me.life += secondDamage
    }
  }

  // Exhaust solo el atacante
  atk.exhausted = true

  // Prioridad después del ataque
  updateConditionalBuffs(state, attackerIndex)
  updateConditionalBuffs(state, oppIndex)
  triggerPriority(state, state.turn.phase)
  return { ok: true }
}

// Ataque a criatura enemiga (estilo Hearthstone - puedes atacar en cualquier momento)
export function declareAttackCreature(
  state: GameState,
  attackerIndex: number,
  attackerBoardIndex: number,
  defenderBoardIndex: number,
  options?: { forcedBySpell?: boolean },
): AttackResult {
  const forcedBySpell = options?.forcedBySpell === true
  const active = getCurrentPlayerIndex(state)
  if (!forcedBySpell && attackerIndex !== active) return { ok: false, error: 'No es tu turno' }
  if (!forcedBySpell && state.turn.phase !== GamePhase.PLAYING) return { ok: false, error: 'No puedes atacar ahora' }

  const me = state.players[attackerIndex]
  const oppIndex = getOpponentPlayerIndex(state)
  const opp = state.players[oppIndex]
  const atk = me.board[attackerBoardIndex]
  const def = opp.board[defenderBoardIndex]
  if (!atk) return { ok: false, error: 'Atacante inválido' }
  if (!def) return { ok: false, error: 'Defensor inválido' }
  if (!forcedBySpell && atk.exhausted) return { ok: false, error: 'Esta criatura está exhausta' }

  const attackerEntityId = atk.id

  // SIGILO solo bloquea ataques declarados normales, no ataques forzados por hechizo
  if (!forcedBySpell && hasAbility(def, Ability.SIGILO)) {
    return { ok: false, error: 'No puedes atacar a una criatura con Sigilo' }
  }

  // VUELO: solo criaturas con Vuelo pueden atacar criaturas con Vuelo
  if (hasAbility(def, Ability.VUELO) && !hasAbility(atk, Ability.VUELO)) {
    return { ok: false, error: 'No puedes atacar a una criatura con Vuelo sin tener Vuelo' }
  }

  // SIGILO: se pierde al atacar
  if (hasAbility(atk, Ability.SIGILO)) {
    atk.abilities = atk.abilities.filter(a => a !== String(Ability.SIGILO))
    console.log(`🫥 ${atk.cardId} pierde Sigilo tras atacar`)
  }

  // Triggers ON_ATTACK
  // Establecer hint para que el efecto sepa qué criatura es SELF
  me.lastAttackTargetHero = false
  state.pendingTargets = [{ type: 'CREATURE_SELF', index: attackerBoardIndex }]
  console.log('[COMBAT] ON_ATTACK trigger', { 
    cardId: atk.cardId, 
    attackerBoardIndex, 
    pendingTargets: state.pendingTargets,
    boardLength: me.board.length 
  })
  notifyEffectTriggered(state, attackerIndex, atk.cardId, 'ON_ATTACK')

  // Incrementar contador de atacantes
  me.attackersDeclaredThisTurn = (me.attackersDeclaredThisTurn ?? 0) + 1

  // Daño simultáneo
  const atkDamage = atk.attack ?? 0
  const defDamage = def.attack ?? 0

  // ESCUDO: previene el próximo daño recibido
  const attackerHasShield = hasAbility(atk, Ability.ESCUDO)
  const defenderHasShield = hasAbility(def, Ability.ESCUDO)

  // Aplicar daño al defensor
  if (defenderHasShield) {
    def.abilities = def.abilities.filter(a => a !== String(Ability.ESCUDO))
  } else {
    def.health -= atkDamage
    def.damagedThisTurn = true
    applyAbilityEffects(state, def, oppIndex, 'ON_DAMAGE_TAKEN')
  }

  // Aplicar daño al atacante
  if (attackerHasShield) {
    atk.abilities = atk.abilities.filter(a => a !== String(Ability.ESCUDO))
  } else {
    atk.health -= defDamage
    atk.damagedThisTurn = true
    applyAbilityEffects(state, atk, attackerIndex, 'ON_DAMAGE_TAKEN')
  }

  // VENENO: cualquier daño que conecte destruye
  if (atkDamage > 0 && hasAbility(atk, Ability.VENENO)) def.health = 0
  if (defDamage > 0 && hasAbility(def, Ability.VENENO)) atk.health = 0

  // ROBO_DE_VIDA: cura al dueño por el daño que hace
  if (atkDamage > 0 && hasAbility(atk, Ability.ROBO_DE_VIDA)) {
    me.life += atkDamage
  }
  if (defDamage > 0 && hasAbility(def, Ability.ROBO_DE_VIDA)) {
    opp.life += defDamage
  }

  // Detectar si el atacante mató al defensor (incluso si el atacante también muere)
  const attackerKilledDefender = def.health <= 0
  
  // Guardar información del atacante antes de splices (para efectos ON_KILL)
  const attackerCardId = atk.cardId
  const attackerTempDraw = atk.tempDrawOnKill
  const attackerStillAlive = atk.health > 0
  
  console.log('[COMBAT] kill check', { 
    attackerKilledDefender, 
    defHealth: def.health,
    atkHealth: atk.health,
    attackerStillAlive,
    attackerCardId,
    attackerTempDraw 
  })

  // Muertes y triggers ON_DEATH
  if (def.health <= 0) {
    const [dead] = opp.board.splice(defenderBoardIndex, 1)
    opp.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, oppIndex, dead.id)
    notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
  }
  if (atk.health <= 0) {
    const [dead] = me.board.splice(attackerBoardIndex, 1)
    me.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, attackerIndex, dead.id)
    notifyEffectTriggered(state, attackerIndex, dead.cardId, 'ON_DEATH')
  }

  // Actualizar buffs condicionales después de cambios en el tablero
  updateConditionalBuffs(state, attackerIndex)
  updateConditionalBuffs(state, oppIndex)

  // Activar efectos TRIGGERED cuando el atacante mata al defensor (incluso si el atacante muere)
  if (attackerKilledDefender) {
    console.log('[COMBAT] processing ON_KILL effects', { 
      attackerCardId, 
      attackerTempDraw,
      attackerStillAlive,
      boardLength: me.board.length 
    })
    
    // Encontrar al atacante en el board actual (puede no estar si murió)
    const currentAtkIndex = me.board.findIndex(c => c.cardId === attackerCardId && c.id === atk.id)
    console.log('[COMBAT] searching for attacker', { 
      attackerId: atk.id, 
      attackerCardId,
      attackerStillAlive, 
      currentAtkIndex,
      boardCreatures: me.board.map(c => ({ id: c.id, cardId: c.cardId }))
    })
    
    if (currentAtkIndex < 0 && attackerStillAlive) {
      console.warn('[COMBAT] attacker should be alive but not found - this should not happen')
    }
    
    const atkCard = getCardByIdGlobal(attackerCardId)
    if (atkCard && atkCard.effects) {
      console.log('[COMBAT] checking card effects', { 
        cardId: attackerCardId, 
        effectsCount: atkCard.effects.length 
      })
      
      for (const eff of atkCard.effects) {
        if (eff.timing === EffectTiming.TRIGGERED) {
          console.log('[COMBAT] triggering ON_KILL effect', { 
            cardId: attackerCardId, 
            effectId: eff.id,
            actionType: eff.action.type,
            target: eff.action.target
          })
          
          // Ejecutar el efecto (DRAW_CARDS no necesita ubicación de criatura)
          applyAction(state, attackerIndex, eff.action, [])
          console.log('[COMBAT] ON_KILL effect applied')
        }
      }
    }
    
    // Verificar tempDrawOnKill (buff temporal de Cuchilla Envenenada)
    if (attackerTempDraw && attackerTempDraw > 0) {
      console.log('[COMBAT] tempDrawOnKill triggered', { 
        cardId: attackerCardId, 
        drawAmount: attackerTempDraw,
        deckSize: me.deck.length 
      })
      
      // Robar cartas
      for (let i = 0; i < attackerTempDraw; i++) {
        if (me.deck.length > 0) {
          const drawn = me.deck.shift()
          if (drawn) {
            addCardToHandOrGraveyard(state, attackerIndex, drawn)
            console.log('[COMBAT] drew card from tempDrawOnKill', { 
              card: drawn,
              handSize: me.hand.length 
            })
          }
        } else {
          console.log('[COMBAT] cannot draw - deck is empty')
        }
      }
    }
  } else {
    console.log('[COMBAT] NOT processing ON_KILL', { 
      attackerKilledDefender, 
      attackerStillAlive,
      defHealth: def.health,
      reason: 'defender not killed'
    })
  }

  // Exhaust solo al atacante que sigue en mesa (índice viejo inválido si murió y hubo splice)
  if (!forcedBySpell) {
    const stillIdx = me.board.findIndex((c) => c.id === attackerEntityId)
    if (stillIdx >= 0) me.board[stillIdx].exhausted = true
  }

  // DOBLE_GOLPE: segundo impacto solo del atacante
  if (hasAbility(atk, Ability.DOBLE_GOLPE)) {
    const atkIdx2 = me.board.findIndex((c) => c.id === attackerEntityId)
    const atkNow = atkIdx2 >= 0 ? me.board[atkIdx2] : undefined
    const defNow = opp.board[defenderBoardIndex]
    if (atkNow && defNow) {
      const dmg = atkNow.attack ?? 0
      // Escudo del defensor para el segundo golpe
      const defenderHasShield2 = hasAbility(defNow, Ability.ESCUDO)
      if (defenderHasShield2) {
        defNow.abilities = defNow.abilities.filter(a => a !== String(Ability.ESCUDO))
      } else {
        defNow.health -= dmg
        defNow.damagedThisTurn = true
        applyAbilityEffects(state, defNow, oppIndex, 'ON_DAMAGE_TAKEN')
      }
      // Veneno del atacante en el segundo golpe
      if (dmg > 0 && hasAbility(atkNow, Ability.VENENO)) defNow.health = 0
      // Robo de vida por el segundo golpe
      if (dmg > 0 && hasAbility(atkNow, Ability.ROBO_DE_VIDA)) {
        me.life += dmg
      }
      // Muerte del defensor tras segundo golpe
      if (defNow.health <= 0) {
        const [dead] = opp.board.splice(defenderBoardIndex, 1)
        opp.graveyard.unshift(dead.cardId)
        notifyLeaveBattlefield(state, oppIndex, dead.id)
        notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
        
        // ON_KILL trigger por segundo golpe (incluso si el atacante muere después)
        console.log('[COMBAT] DOBLE_GOLPE killed defender', { attackerCardId: atkNow.cardId })
        const atkCard2 = getCardByIdGlobal(atkNow.cardId)
        if (atkCard2 && atkCard2.effects) {
          for (const eff of atkCard2.effects) {
            if (eff.timing === EffectTiming.TRIGGERED) {
              console.log('[COMBAT] DOBLE_GOLPE triggering ON_KILL effect', { effectId: eff.id })
              applyAction(state, attackerIndex, eff.action, [])
            }
          }
        }
        
        // También verificar tempDrawOnKill del segundo golpe
        if (atkNow.tempDrawOnKill && atkNow.tempDrawOnKill > 0) {
          console.log('[COMBAT] DOBLE_GOLPE tempDrawOnKill triggered', { drawAmount: atkNow.tempDrawOnKill })
          for (let i = 0; i < atkNow.tempDrawOnKill; i++) {
            if (me.deck.length > 0) {
              const drawn = me.deck.shift()
              if (drawn) addCardToHandOrGraveyard(state, attackerIndex, drawn)
            }
          }
        }
      }
    }
  }

  // Prioridad después del combate
  triggerPriority(state, state.turn.phase)
  return { ok: true }
}

// =======================
// Targeting y helpers
// =======================

// Valida si una criatura puede ser objetivo de una acción
export function canTargetCreature(
  state: GameState, 
  targetPlayerIndex: number, 
  targetCreatureIndex: number, 
  sourcePlayerIndex: number,
  sourceType: 'SPELL' | 'ABILITY' | 'ATTACK'
): boolean {
  const target = state.players[targetPlayerIndex].board[targetCreatureIndex]
  if (!target) return false
  // SIGILO solo bloquea ataques, no hechizos/habilidades dirigidas
  if (hasAbility(target, Ability.SIGILO) && targetPlayerIndex !== sourcePlayerIndex && sourceType === 'ATTACK') {
    return false
  }
  return true
}