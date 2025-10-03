

export function declareAttackHero(state: GameState, attackerIndex: number, attackerBoardIndex: number): AttackResult {
  const active = getCurrentPlayerIndex(state)
  if (attackerIndex !== active) return { ok: false, error: 'No es tu turno' }
  if (state.turn.phase !== GamePhase.COMBAT && state.turn.phase !== GamePhase.MAIN) return { ok: false, error: 'No estás en fase de combate' }

  const me = state.players[attackerIndex]
  const oppIndex = getOpponentPlayerIndex(state)
  const opp = state.players[oppIndex]
  const atk = me.board[attackerBoardIndex]
  if (!atk) return { ok: false, error: 'Atacante inválido' }
  if (atk.exhausted) return { ok: false, error: 'Esta criatura está exhausta' }

  // ✅ TAUNT: si el oponente tiene criaturas con Taunt, debes atacarlas
  const taunters = opp.board.filter(c => hasAbility(c, Ability.TAUNT))
  if (taunters.length > 0) {
    return { ok: false, error: 'Debes atacar las criaturas con Taunt primero' }
  }

  // ✅ SIGILO: SE PIERDE AL ATACAR - Quitar Sigilo del atacante
  if (hasAbility(atk, Ability.SIGILO)) {
    atk.abilities = atk.abilities.filter(a => a !== String(Ability.SIGILO))
    console.log(`🫥 ${atk.cardId} loses Sigilo after attacking hero`)
  }

  // ON_ATTACK triggers
  notifyEffectTriggered(state, attackerIndex, atk.cardId, 'ON_ATTACK')

  // Daño al héroe
  const damage = atk.attack ?? 0
  const oldLife = opp.life 

  if (hasFinalStandImmunity(state, oppIndex)) {
    console.log(`🛡️ Target is immune to attack damage (Final Stand)`)
    atk.exhausted = true
    return { ok: true } // Ataque "conecta" pero no hace daño
  }
  
  opp.life = Math.max(0, opp.life - damage)
  console.log(`⚔️ Hero attack: ${damage} damage (${oldLife} → ${opp.life})`)
  
  // ✅ Verificar Final Stand si el daño fue letal
  if (opp.life <= 0 && oldLife > 0) {
    const finalStandActivated = checkAndActivateFinalStand(
      state, 
      oppIndex, 
      attackerIndex // Atacante causó el daño
    )
    
    if (finalStandActivated) {
      console.log(`⚡ Final Stand prevented death from creature attack`)
    }
  }

  // ✅ ROBO_DE_VIDA: cura al dueño
  if (damage > 0 && hasAbility(atk, Ability.ROBO_DE_VIDA)) {
    me.life = Math.min(me.maxLife || 20, me.life + damage)
  }

  // ✅ DOBLE_GOLPE: segundo impacto al héroe
  if (hasAbility(atk, Ability.DOBLE_GOLPE)) {
    const secondDamage = atk.attack ?? 0
    opp.life -= secondDamage
    
    // Robo de vida por el segundo golpe
    if (secondDamage > 0 && hasAbility(atk, Ability.ROBO_DE_VIDA)) {
      me.life = Math.min(me.maxLife || 20, me.life + secondDamage)
    }
  }

  // Exhaust atacante
  atk.exhausted = true

  // Prioridad después del ataque
  triggerPriority(state, state.turn.phase)
  return { ok: true }
}


export function declareAttackCreature(state: GameState, attackerIndex: number, attackerBoardIndex: number, defenderBoardIndex: number): AttackResult {
  const active = getCurrentPlayerIndex(state)
  if (attackerIndex !== active) return { ok: false, error: 'No es tu turno' }
  if (state.turn.phase !== GamePhase.COMBAT && state.turn.phase !== GamePhase.MAIN) return { ok: false, error: 'No estás en fase de combate' }

  const me = state.players[attackerIndex]
  const oppIndex = getOpponentPlayerIndex(state)
  const opp = state.players[oppIndex]
  const atk = me.board[attackerBoardIndex]
  const def = opp.board[defenderBoardIndex]
  if (!atk) return { ok: false, error: 'Atacante inválido' }
  if (!def) return { ok: false, error: 'Defensor inválido' }
  if (atk.exhausted) return { ok: false, error: 'Esta criatura está exhausta' }

  // ✅ SIGILO: el defensor no puede ser targeteado si tiene Sigilo
  if (hasAbility(def, Ability.SIGILO)) {
    return { ok: false, error: 'No puedes atacar a una criatura con Sigilo' }
  }

  // ✅ VUELO: solo criaturas con Vuelo pueden atacar criaturas con Vuelo
  if (hasAbility(def, Ability.VUELO) && !hasAbility(atk, Ability.VUELO)) {
    return { ok: false, error: 'No puedes atacar a una criatura con Vuelo sin tener Vuelo' }
  }

  // ✅ SIGILO: SE PIERDE AL ATACAR - Quitar Sigilo del atacante
  if (hasAbility(atk, Ability.SIGILO)) {
    atk.abilities = atk.abilities.filter(a => a !== String(Ability.SIGILO))
    console.log(`🫥 ${atk.cardId} loses Sigilo after attacking`)
  }

  // ON_ATTACK triggers
  notifyEffectTriggered(state, attackerIndex, atk.cardId, 'ON_ATTACK')

  // Daño simultáneo
  const atkDamage = atk.attack ?? 0
  const defDamage = def.attack ?? 0

  // ✅ ESCUDO: previene el próximo daño que recibiría
  const attackerHasShield = hasAbility(atk, Ability.ESCUDO)
  const defenderHasShield = hasAbility(def, Ability.ESCUDO)

  // Aplicar daño a defensor
  if (defenderHasShield) {
    def.abilities = def.abilities.filter(a => a !== String(Ability.ESCUDO))
  } else {
    def.health -= atkDamage
    def.damagedThisTurn = true
    
    // ✅ Aplicar efectos después del daño
    applyAbilityEffects(state, def, oppIndex, 'ON_DAMAGE_TAKEN')
  }

  // Aplicar daño a atacante
  if (attackerHasShield) {
    atk.abilities = atk.abilities.filter(a => a !== String(Ability.ESCUDO))
  } else {
    atk.health -= defDamage
    atk.damagedThisTurn = true
    
    // ✅ Aplicar efectos después del daño
    applyAbilityEffects(state, atk, attackerIndex, 'ON_DAMAGE_TAKEN')
  }

  // ✅ VENENO: cualquier daño que conecte destruye
  if (atkDamage > 0 && hasAbility(atk, Ability.VENENO)) def.health = 0
  if (defDamage > 0 && hasAbility(def, Ability.VENENO)) atk.health = 0

  // ✅ ROBO_DE_VIDA: cura al dueño por el daño que hace
  if (atkDamage > 0 && hasAbility(atk, Ability.ROBO_DE_VIDA)) {
    me.life = Math.min(me.maxLife || 20, me.life + atkDamage)
  }
  if (defDamage > 0 && hasAbility(def, Ability.ROBO_DE_VIDA)) {
    opp.life = Math.min(opp.maxLife || 20, opp.life + defDamage)
  }

  // Muertes y triggers ON_DEATH
  if (def.health <= 0) {
    const [dead] = opp.board.splice(defenderBoardIndex, 1)
    opp.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, oppIndex, dead.id)
    notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
    
    // ✅ Trigger ON_KILL para el atacante si sobrevive
    if (atk.health > 0) {
      applyAbilityEffects(state, atk, attackerIndex, 'ON_KILL')
    }
  }
  
  if (atk.health <= 0) {
    const [dead] = me.board.splice(attackerBoardIndex, 1)
    me.graveyard.unshift(dead.cardId)
    notifyLeaveBattlefield(state, attackerIndex, dead.id)
    notifyEffectTriggered(state, attackerIndex, dead.cardId, 'ON_DEATH')
  }

  // Exhaust atacante tras atacar si sigue vivo
  if (me.board[attackerBoardIndex]) {
    me.board[attackerBoardIndex].exhausted = true
  }

  // ✅ DOBLE_GOLPE: segundo impacto solo del atacante
  if (hasAbility(atk, Ability.DOBLE_GOLPE)) {
    const atkNow = me.board[attackerBoardIndex]
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
        me.life = Math.min(me.maxLife || 20, me.life + dmg)
      }

      // Muerte del defensor tras segundo golpe
      if (defNow.health <= 0) {
        const [dead] = opp.board.splice(defenderBoardIndex, 1)
        opp.graveyard.unshift(dead.cardId)
        notifyLeaveBattlefield(state, oppIndex, dead.id)
        notifyEffectTriggered(state, oppIndex, dead.cardId, 'ON_DEATH')
        
        // ON_KILL trigger por segundo golpe
        if (atkNow.health > 0) {
          applyAbilityEffects(state, atkNow, attackerIndex, 'ON_KILL')
        }
      }
    }
  }

  // Prioridad después del combate
  triggerPriority(state, state.turn.phase)
  return { ok: true }
}