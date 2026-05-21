import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GameBoard } from './components/GameBoard'
import { OnlineGameBoard } from './components/OnlineGameBoard'
import { GameEngineProvider } from './context/GameEngineProvider'
import { OnlineGameProvider, useOnlineGame } from './context/OnlineGameProvider'
import { OnlineMatchmaking } from './components/OnlineMatchmaking'
import { AuthProvider, useAuth } from './context/AuthContext'
import { HomeScreen } from './components/HomeScreen'
import { Landing } from './components/Landing'
import { AuthScreen } from './components/AuthScreen'
import { DeckManagerScreen } from './components/DeckManagerScreen'
import { CollectionScreen } from './components/CollectionScreen'

type Route = 'landing' | 'auth' | 'menu' | 'local' | 'online' | 'decks' | 'collection'

function AppContent() {
  const { gameState } = useOnlineGame()
  const { user, loading } = useAuth()
  const [route, setRoute] = useState<Route>('landing')

  // Redirigir a login si se intenta ir a rutas protegidas sin usuario
  useEffect(() => {
    if (!loading && !user && (route === 'menu' || route === 'local' || route === 'online' || route === 'decks' || route === 'collection')) {
      setRoute('auth')
    }
  }, [user, loading, route])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
        Cargando...
      </div>
    )
  }

  if (!user) {
    if (route === 'auth') {
      return <AuthScreen onAuthenticated={() => setRoute('menu')} />
    }
    return <Landing onPrimaryAction={() => setRoute('auth')} />
  }

  if (route === 'menu') {
    return (
      <HomeScreen
        onStartLocal={() => setRoute('local')}
        onStartOnline={() => setRoute('online')}
        onOpenCollection={() => setRoute('collection')}
        onOpenDecks={() => setRoute('decks')}
      />
    )
  }

  if (route === 'collection') {
    return <CollectionScreen onBack={() => setRoute('menu')} />
  }

  if (route === 'decks') {
    return <DeckManagerScreen onBack={() => setRoute('menu')} />
  }

  if (route === 'online') {
    if (gameState) {
      return (
        <>
          <button
            onClick={() => setRoute('menu')}
            className="fixed top-4 left-4 z-[11000] px-4 py-2 text-sm rounded-lg bg-slate-900/80 border border-slate-600 text-slate-100 hover:bg-slate-800"
          >
            ← Volver al menú
          </button>
          <OnlineGameBoard />
        </>
      )
    }
    return (
      <>
        <button
          onClick={() => setRoute('menu')}
          className="fixed top-4 left-4 z-[11000] px-4 py-2 text-sm rounded-lg bg-slate-900/80 border border-slate-600 text-slate-100 hover:bg-slate-800"
        >
          ← Volver al menú
        </button>
        <OnlineMatchmaking />
      </>
    )
  }

  // Vista local (offline)
  return (
    <GameEngineProvider>
      <button
        onClick={() => setRoute('menu')}
        className="fixed top-4 left-4 z-[11000] px-4 py-2 text-sm rounded-lg bg-slate-900/80 border border-slate-600 text-slate-100 hover:bg-slate-800"
      >
        ← Volver al menú
      </button>
      <GameBoard />
    </GameEngineProvider>
  )
}

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? ''

function App() {
  const content = (
    <AuthProvider>
      <OnlineGameProvider>
        <AppContent />
      </OnlineGameProvider>
    </AuthProvider>
  )

  if (!googleClientId) {
    return content
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
}

export default App