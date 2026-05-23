import { useState, useEffect, useCallback } from 'react'
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
import { ProfileScreen } from './components/ProfileScreen'
import type { PlayDeckConfig } from './utils/play-deck'

type Route = 'landing' | 'auth' | 'menu' | 'local' | 'online' | 'decks' | 'collection' | 'profile'

type AppContentProps = {
  selectedPlayDeck: PlayDeckConfig | null
  onSelectedPlayDeckChange: (deck: PlayDeckConfig | null) => void
}

function AppContent({ selectedPlayDeck, onSelectedPlayDeckChange }: AppContentProps) {
  const { gameState, resetGame } = useOnlineGame()
  const { user, loading } = useAuth()
  const [route, setRoute] = useState<Route>('landing')
  const [localPlayDeck, setLocalPlayDeck] = useState<PlayDeckConfig | null>(null)

  const goOnline = () => {
    if (!selectedPlayDeck) return
    setRoute('online')
  }

  useEffect(() => {
    if (loading) return

    if (!user) {
      resetGame()
      if (route !== 'auth') {
        setRoute('landing')
      }
      return
    }

    if (route === 'landing') {
      setRoute('menu')
    }
  }, [user, loading, route, resetGame])

  useEffect(() => {
    if (route !== 'online' && route !== 'local') return
    return () => {
      resetGame()
    }
  }, [route, resetGame])

  useEffect(() => {
    if (route === 'local' && !localPlayDeck) {
      setRoute('menu')
    }
  }, [route, localPlayDeck])


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

  if (route === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
        Cargando...
      </div>
    )
  }

  if (route === 'menu') {
    return (
      <HomeScreen
        onPlayDeckChange={onSelectedPlayDeckChange}
        onStartLocal={(deck) => {
          setLocalPlayDeck(deck)
          setRoute('local')
        }}
        onStartOnline={goOnline}
        onOpenCollection={() => setRoute('collection')}
        onOpenDecks={() => setRoute('decks')}
        onOpenProfile={() => setRoute('profile')}
      />
    )
  }

  if (route === 'profile') {
    return <ProfileScreen onBack={() => setRoute('menu')} />
  }

  if (route === 'collection') {
    return <CollectionScreen onBack={() => setRoute('menu')} />
  }

  if (route === 'decks') {
    return <DeckManagerScreen onBack={() => setRoute('menu')} />
  }

  if (route === 'online') {
    if (gameState) {
      return <OnlineGameBoard onExitToMenu={() => { resetGame(); setRoute('menu') }} />
    }
    return (
      <>
        <button
          onClick={() => { resetGame(); setRoute('menu') }}
          className="fixed top-4 left-4 z-[11000] px-4 py-2 text-sm rounded-lg bg-slate-900/80 border border-slate-600 text-slate-100 hover:bg-slate-800"
        >
          ← Volver al menú
        </button>
        <OnlineMatchmaking />
      </>
    )
  }

  if (route === 'local') {
    if (!localPlayDeck) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
          Cargando partida...
        </div>
      )
    }
    return (
      <GameEngineProvider
        key={localPlayDeck.id}
        playDeck={localPlayDeck}
        onExitToMenu={() => {
          setLocalPlayDeck(null)
          setRoute('menu')
        }}
      >
        <GameBoard />
      </GameEngineProvider>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-slate-200">
      Cargando...
    </div>
  )
}

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? ''

function App() {
  const [selectedPlayDeck, setSelectedPlayDeck] = useState<PlayDeckConfig | null>(null)
  const onSelectedPlayDeckChange = useCallback((deck: PlayDeckConfig | null) => {
    setSelectedPlayDeck(deck)
  }, [])

  const content = (
    <AuthProvider>
      <OnlineGameProvider matchDeck={selectedPlayDeck}>
        <AppContent
          selectedPlayDeck={selectedPlayDeck}
          onSelectedPlayDeckChange={onSelectedPlayDeckChange}
        />
      </OnlineGameProvider>
    </AuthProvider>
  )

  if (!googleClientId) {
    return content
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
}

export default App