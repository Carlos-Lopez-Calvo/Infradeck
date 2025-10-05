import { GameBoard } from './components/GameBoard'
import { GameEngineProvider } from './context/GameEngineProvider'

function App() {
  return (
    <GameEngineProvider>
      <GameBoard />
    </GameEngineProvider>
  )
}

export default App