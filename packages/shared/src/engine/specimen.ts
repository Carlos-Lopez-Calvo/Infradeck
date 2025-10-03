import { GameState, PlayerState, CreatureOnBoard, getCardByIdGlobal} from './game-state'
import { ESPECIMEN_PERFECTO } from '../cards/class-cards'
import { Ability, CardType } from '../types/cards'
import { notifyEnterBattlefield } from './priority'

// =======================
// Helpers de specimen
// =======================

// Comprueba si ya hay espécimen en mesa
export function hasSpecimenOnBoard(p: PlayerState): boolean {
  return p.board.some(e => e.cardId === 'SPECIMEN_TOKEN' || e.cardId === 'SPECIMEN_EVOLVED_TOKEN')
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
}

// =======================
// Invocación del Espécimen Perfecto
// =======================
export function summonSpecimen(state: GameState, playerIndex: number): boolean {
  const player = state.players[playerIndex]
  const specimenCard = ESPECIMEN_PERFECTO
  const specimenSummons = player.specimenSummons ?? 0

  // Calcula el coste dinámico
  const cost = getSpecimenCost(player)
  if (player.mana < cost) return false

  // Hereda habilidades únicas del cementerio
  const inheritedAbilities = getUniqueAbilitiesFromGraveyard(player)

  // Hereda efectos programados
  const programmedEffects = player.programmedSpecimenEffects ?? []

  player.mana -= cost
  player.specimenSummons = specimenSummons + 1

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

  // Ejecuta efectos programados al entrar
  const boardIndex = player.board.length - 1
  handleSpecimenOnEnter(state, playerIndex, boardIndex)

  // Limpia los efectos programados tras invocar
  player.programmedSpecimenEffects = []
  player.specimenSummonedThisTurn = true
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
      case 'DAMAGE_3_ON_ENTER':
        // Aplica 3 de daño a un objetivo (elige el primero enemigo por defecto)
        if (state.players[1 - playerIndex].board.length > 0) {
          state.players[1 - playerIndex].board[0].health -= 3
        } else {
          state.players[1 - playerIndex].life = Math.max(0, state.players[1 - playerIndex].life - 3)
        }
        break
      case 'IMMEDIATE_SUMMON_WITH_SCALING':
        // Buffea al espécimen +1/+1 por cada habilidad diferente que tenga
        const uniqueAbilities = new Set(specimen.abilities || [])
        specimen.attack += uniqueAbilities.size
        specimen.health += uniqueAbilities.size
        break
      case 'TAUNT_AND_BUFF':
        // Gana Taunt y +2/+2
        if (!specimen.abilities.includes(String(Ability.TAUNT))) {
          specimen.abilities.push(String(Ability.TAUNT))
        }
        specimen.attack += 2
        specimen.health += 2
        break
      // Agrega más casos según los efectos que programes
      default:
        break
    }
  }

  // Limpia los efectos tras ejecutarlos
  specimen.programmedEffects = []
}