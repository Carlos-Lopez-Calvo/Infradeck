import { GameState, PlayerState, CreatureOnBoard, getCardByIdGlobal} from './game-state'
import { ESPECIMEN_PERFECTO } from '../cards/class-cards'
import { Ability, CardType } from '../types/cards'
import { notifyEnterBattlefield } from './priority'
import { triggerTriggeredEffects } from './effects'

// =======================
// Helpers de specimen
// =======================

// Comprueba si ya hay espécimen en mesa
export function hasSpecimenOnBoard(p: PlayerState): boolean {
  const isAnySpecimen = (id: string) =>
    id === 'Especimen_Perfecto' ||
    id === 'Especimen_Perfecto_Final_Stand' ||
    id === 'Especimen_Perfecto_Evolucionado' ||
    id === 'SPECIMEN_TOKEN' ||
    id === 'SPECIMEN_EVOLVED_TOKEN'
  return p.board.some(e => isAnySpecimen(e.cardId))
}

// Coste dinámico del espécimen
export function getSpecimenCost(p: PlayerState): number {
  const summons = p.specimenSummons ?? 0
  return Math.min(10, 5 + 2 * summons)
}

// Hereda habilidades únicas del cementerio
export function getUniqueAbilitiesFromGraveyard(player: PlayerState): string[] {
  const abilitiesSet = new Set<string>()
  for (const cardId of player.graveyard) {
    const card = getCardByIdGlobal(cardId)
    if (card && card.type === CardType.CREATURE && card.abilities) {
    card.abilities.forEach((ab: Ability | string) => abilitiesSet.add(String(ab)))
    }
  }
  return Array.from(abilitiesSet)
}

// Invoca el espécimen token (básico o evolucionado)
export function summonSpecimenToken(state: GameState, playerIndex: number, evolved = false) {
  const p = state.players[playerIndex]
  const id = `SPECIMEN_${evolved ? 'EVOLVED' : 'BASE'}#${Date.now()}#${Math.floor(Math.random()*1e6)}`
  const entity: CreatureOnBoard = {
    id,
    cardId: evolved ? 'SPECIMEN_EVOLVED_TOKEN' : 'SPECIMEN_TOKEN',
    ownerId: p.id,
    attack: evolved ? 10 : 5,
    health: evolved ? 10 : 5,
    exhausted: true,
    abilities: [],
    effects: [],
  }
  p.board.push(entity)
  p.specimenSummons = (p.specimenSummons ?? 0) + 1
  p.specimenSummonedThisTurn = true
  notifyEnterBattlefield(state, playerIndex, id)
  triggerTriggeredEffects(state, playerIndex)
}

// =======================
// Invocación del Espécimen Perfecto
// =======================
export function summonSpecimen(state: GameState, playerIndex: number): boolean {
  const player = state.players[playerIndex]
  const specimenCard = ESPECIMEN_PERFECTO
  const specimenSummons = player.specimenSummons ?? 0

  // Coste dinámico y bandera de invocación gratis
  const cost = getSpecimenCost(player)
  const free = !!player.specimenFreeThisTurn || !!player.freeSpecimenThisTurn

  // Si no es gratis, verifica y cobra
  if (!free) {
    if (player.mana < cost) return false
    player.mana -= cost
  }

  // Hereda habilidades únicas del cementerio (ambos jugadores)
  const inheritedAbilities = Array.from(new Set([
    ...getUniqueAbilitiesFromGraveyard(player),
    ...getUniqueAbilitiesFromGraveyard(state.players[1 - playerIndex])
  ]))

  // Hereda efectos programados
  const programmedEffects = player.programmedSpecimenEffects ?? []

  // Incrementa contador de invocaciones (también cuando es gratis para escalar el coste futuro)
  player.specimenSummons = specimenSummons + 1

  // Invoca
  player.board.push({
    id: `specimen-${Date.now()}`,
    cardId: specimenCard.id,
    attack: specimenCard.attack ?? 0,
    health: specimenCard.health ?? 1,
    exhausted: true,
    ownerId: player.id,
    abilities: [...specimenCard.abilities, ...inheritedAbilities],
    programmedEffects: [...programmedEffects],
    effects: [],
  })

  // Ejecuta ON_ENTER programados
  const boardIndex = player.board.length - 1
  handleSpecimenOnEnter(state, playerIndex, boardIndex)

  // Limpia y marca flags
  player.programmedSpecimenEffects = []
  player.specimenSummonedThisTurn = true

  // Dispara TRIGGERED
  triggerTriggeredEffects(state, playerIndex)

  return true
}

// =======================
// Efectos programados al entrar
// =======================
export function handleSpecimenOnEnter(state: GameState, playerIndex: number, boardIndex: number) {
  const player = state.players[playerIndex]
  const specimen = player.board[boardIndex]
  if (!specimen || !specimen.programmedEffects || specimen.programmedEffects.length === 0) return

  for (const effect of specimen.programmedEffects) {
    switch (effect) {
      case 'DAMAGE_3_ON_ENTER': {
        const hints = (state.pendingTargets && state.pendingTargets.length) ? state.pendingTargets as any : []
        const pick = hints[0]
        if (pick?.type === 'CREATURE_ENEMY' && typeof pick.index === 'number') {
          const enemy = state.players[1 - playerIndex]
          const c = enemy.board[pick.index]
          if (c) {
            c.health -= 3
            c.damagedThisTurn = true
          }
        } else if (pick?.type === 'HERO_ENEMY') {
          const enemy = state.players[1 - playerIndex]
          enemy.life = Math.max(0, enemy.life - 3)
        } else {
          const enemy = state.players[1 - playerIndex]
          if (enemy.board.length > 0) {
            enemy.board[0].health -= 3
            enemy.board[0].damagedThisTurn = true
          } else {
            enemy.life = Math.max(0, enemy.life - 3)
          }
        }
        break
      }
      default:
        break
    }
  }

  state.pendingTargets = []
  specimen.programmedEffects = []
}