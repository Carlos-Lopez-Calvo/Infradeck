import { GameState, PlayerState, getCardByIdGlobal } from './game-state'
import { CardType } from '../types/cards'
import { applyOnEnterEffects } from './effects'
import { notifyEnterBattlefield } from './priority'
import { hasSpecimenOnBoard } from './specimen'
// Si usas un resolver global de cartas, importa aquí:
// Estado de Final Stand (puedes mover la interfaz aquí si la tienes en game-state.ts)
export interface FinalStandState {
  used: boolean
  immuneUntilTurn?: number
  triggeredByDamageFrom?: number
}

// Activar Final Stand (ajusta vida y stats)
export function activateFinalStand(state: GameState, playerIndex: number): void {
  const p = state.players[playerIndex]
  p.maxLife = 10
  p.life = Math.min(p.life, 1)
}

export function checkAndActivateFinalStand(
  state: GameState, 
  damagedPlayerIndex: number, 
  damageSourcePlayerIndex: number
): boolean {
  const player = state.players[damagedPlayerIndex]
  if (player.life <= 0 && 
      !player.finalStand?.used && 
      damageSourcePlayerIndex !== damagedPlayerIndex) {

    console.log(`💀⚡ FINAL STAND activated for Player ${damagedPlayerIndex}!`)
    player.finalStand = {
      used: true,
      immuneUntilTurn: state.turn.turnNumber + (damagedPlayerIndex === state.turn.currentPlayerIndex ? 2 : 1),
      triggeredByDamageFrom: damageSourcePlayerIndex
    }
    player.life = 1
    player.maxLife = 10

    // Flag para UI
    state.finalStandJustActivated = damagedPlayerIndex

    console.log(`🎁 Final Stand bonus will apply on next turn for ${player.classType}`)
    return true
  }
  return false
}

// ✅ Verificar si un jugador tiene inmunidad activa
export function hasFinalStandImmunity(state: GameState, playerIndex: number): boolean {
  const player = state.players[playerIndex]
  const fs = player.finalStand
  
  if (!fs?.immuneUntilTurn) return false
  
  return state.turn.turnNumber < fs.immuneUntilTurn
}

// ✅ Aplicar bonus de Final Stand (llamar al inicio del turno)
export function applyFinalStandBonus(state: GameState, playerIndex: number): void {
  const player = state.players[playerIndex]
  
  // Solo aplicar si Final Stand fue usado y es su turno
  if (!player.finalStand?.used || state.turn.currentPlayerIndex !== playerIndex) {
    return
  }
  
  // Solo aplicar una vez - marcar que ya se aplicó
  if (player.finalStandBonusApplied) return
  player.finalStandBonusApplied = true
  
  console.log(`🎁 Applying Final Stand bonus for ${player.classType}`)
  
  switch (player.classType) {
    case 'ABOMINACION': {
      // Invocar FS-specimen solo si NO hay Especimen_Perfecto ni Especimen_Perfecto_Evolucionado en tu mesa
      const hasBaseOrEvolved = player.board.some(ent =>
        ent.cardId === 'Especimen_Perfecto' || ent.cardId === 'Especimen_Perfecto_Evolucionado'
      )
      if (hasBaseOrEvolved) break

      const uniqueAbilities = new Set<string>()
      for (const cardId of player.graveyard) {
        const card = getCardByIdGlobal(cardId)
        if (card && card.type === CardType.CREATURE && card.abilities) {
          card.abilities.forEach((ab: string | number) => uniqueAbilities.add(String(ab)))
        }
      }

      const fsCard = getCardByIdGlobal('Especimen_Perfecto_Final_Stand')
      if (fsCard) {
        const ent = {
          id: `fs-specimen-${Date.now()}`,
          cardId: fsCard.id,
          ownerId: player.id,
          attack: fsCard.attack ?? 0,
          health: fsCard.health ?? 1,
          exhausted: true,
          abilities: Array.from(uniqueAbilities),
          effects: [],
        }
        player.board.push(ent)
        notifyEnterBattlefield(state, playerIndex, ent.id)
        applyOnEnterEffects(state, ent as any, playerIndex, fsCard)
      }
      break
    }
    

    
    case 'CAOS': {
      // Empiezas con 6 Entropía, no resetea este turno
      if (player.classResource?.type === 'ENTROPIA') {
        player.classResource.amount = 6
        player.noEntropyResetThisTurn = true
      }
      console.log(`🎲 CAOS Final Stand: 6 Entropy + no reset`)
      break
    }
    
    case 'CICLO': {
      // Todas tus cartas funcionan como Eclipse permanentemente
      if (player.classResource?.type === 'ESTADO') {
        player.classResource.state = 'ECLIPSE'
        player.permanentEclipse = true
      }
      console.log(`🌓 CICLO Final Stand: Permanent Eclipse`)
      break
    }
    
    case 'VITALIDAD': {
      player.freeLifeCosts = false
      player.lifeCredit = 999
      break
    }
  }
}

