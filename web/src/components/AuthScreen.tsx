import React, { useEffect, useState } from 'react'
import type { CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { GoogleSignInButton } from './GoogleSignInButton'

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? ''

type AuthScreenProps = {
  onAuthenticated: () => void
}

type Mode = 'login' | 'register'

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const { user, loading, register, login, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      onAuthenticated()
    }
  }, [user, loading, onAuthenticated])

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      alert('No se recibió credencial de Google')
      return
    }
    if (submitting) return
    try {
      setSubmitting(true)
      await loginWithGoogle(response.credential)
      onAuthenticated()
    } catch (e: unknown) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Error al iniciar sesión con Google')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      if (mode === 'register') {
        if (!username.trim() || !email.trim() || !password) {
          alert('Completa todos los campos')
          return
        }
        if (password !== passwordConfirm) {
          alert('Las contraseñas no coinciden')
          return
        }
        await register({ username: username.trim(), email: email.trim(), password })
      } else {
        if (!email.trim() || !password) {
          alert('Introduce tu correo y contraseña')
          return
        }
        await login({ email: email.trim(), password })
      }
      onAuthenticated()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Error de autenticación. Verifica que el backend esté corriendo y accesible en el puerto 3001.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md px-6 py-8 rounded-3xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur">
        <div className="space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h1>
            <p className="text-sm text-slate-300">
              {mode === 'login'
                ? 'Entra con tu cuenta para continuar tus partidas y mazos.'
                : 'Registra una cuenta para guardar mazos y jugar online.'}
            </p>
          </header>

          {googleClientId ? (
            <GoogleSignInButton
              disabled={submitting}
              onSuccess={handleGoogleSuccess}
              onError={(msg) => alert(msg)}
            />
          ) : (
            <p className="text-xs text-slate-500 text-center">
              Login con Google: define VITE_GOOGLE_CLIENT_ID en web/.env
            </p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/80 px-2 text-slate-400">
                {mode === 'login' ? 'o con correo / usuario' : 'registro con correo'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-100 text-left">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu apodo en Infradeck"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-100 text-left">
                Correo electrónico
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !submitting && handleSubmit()}
                placeholder="tujugador@example.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-100 text-left">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !submitting && handleSubmit()}
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-100 text-left">
                  Repetir contraseña
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !submitting && handleSubmit()}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/80"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || (mode === 'register' ? !username.trim() || !email.trim() || !password || !passwordConfirm : !email.trim() || !password)}
              className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-300 text-sm font-semibold transition"
            >
              {submitting ? (mode === 'login' ? 'Entrando...' : 'Creando cuenta...') : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>

            <button
              type="button"
              onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
              className="w-full text-xs text-slate-300 hover:text-emerald-300 mt-1"
            >
              {mode === 'login'
                ? '¿No tienes cuenta? Crear una nueva'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

