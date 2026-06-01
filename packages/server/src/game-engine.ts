// Wrapper para el motor del juego - usa importaciones dinámicas para evitar problemas con ESM/tsx

let gameEngine: any = null

async function loadGameEngine() {
  if (!gameEngine) {
    const module = await import('../../shared/src/index.js')
    gameEngine = module
  }
  return gameEngine
}

export async function createGame(player1: any, player2: any): Promise<any> {
  const engine = await loadGameEngine()
  return engine.createGame(player1, player2)
}

export async function startGame(gameState: any): Promise<void> {
  const engine = await loadGameEngine()
  return engine.startGame(gameState)
}

export async function playCard(
  gameState: any,
  playerIndex: number,
  handIndex: number,
  cardResolver: any,
  options?: any
): Promise<any> {
  const engine = await loadGameEngine()
  return engine.playCard(gameState, playerIndex, handIndex, cardResolver, options)
}

export async function endTurn(gameState: any): Promise<void> {
  const engine = await loadGameEngine()
  return engine.endTurn(gameState)
}

export async function declareAttackHero(
  gameState: any,
  playerIndex: number,
  attackerIndex: number
): Promise<any> {
  const engine = await loadGameEngine()
  return engine.declareAttackHero(gameState, playerIndex, attackerIndex)
}

export async function declareAttackCreature(
  gameState: any,
  playerIndex: number,
  attackerIndex: number,
  targetIndex: number
): Promise<any> {
  const engine = await loadGameEngine()
  return engine.declareAttackCreature(gameState, playerIndex, attackerIndex, targetIndex)
}

export async function summonSpecimen(gameState: any, playerIndex: number): Promise<boolean> {
  const engine = await loadGameEngine()
  return engine.summonSpecimen(gameState, playerIndex)
}
