import { GameBoard } from './components/GameBoard'
import { OnlineGameBoard } from './components/OnlineGameBoard'
import { GameEngineProvider } from './context/GameEngineProvider'
import { OnlineGameProvider, useOnlineGame } from './context/OnlineGameProvider'
import { OnlineMatchmaking } from './components/OnlineMatchmaking'

function AppContent() {
  const { gameState } = useOnlineGame()
  
  // Si hay un juego online activo, mostrar el tablero online
  if (gameState) {
    return <OnlineGameBoard />
  }
  
  // Si no, mostrar el matchmaking y el juego local
  return (
    <GameEngineProvider>
      <OnlineMatchmaking />
      <GameBoard />
    </GameEngineProvider>
  )
}

function App() {
  return (
    <OnlineGameProvider>
      <AppContent />
    </OnlineGameProvider>
  )
}

export default App