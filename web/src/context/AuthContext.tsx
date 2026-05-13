import React, { createContext, useContext, useEffect, useState } from 'react'

type User = {
  id: string
  username: string
  email: string
  nickname: string
  avatarUrl: string | null
  level: number
  xp: number
  gold: number
  gems: number
}

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  register: (data: { username: string; email: string; password: string }) => Promise<void>
  login: (data: { email: string; password: string }) => Promise<void>
  logout: () => void
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl && envUrl.trim()) return envUrl.trim()
  if (typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:3001`
  return 'http://localhost:3001'
})()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('infradeck:user') : null
    const rawToken = typeof window !== 'undefined' ? localStorage.getItem('infradeck:token') : null

    if (!rawUser || !rawToken) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('infradeck:user')
        localStorage.removeItem('infradeck:token')
      }
      setLoading(false)
      return
    }

    try {
      setUser(JSON.parse(rawUser))
      setToken(rawToken)
    } catch {
      localStorage.removeItem('infradeck:user')
      localStorage.removeItem('infradeck:token')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${rawToken}`,
          },
        })
        if (!res.ok) {
          throw new Error('session_invalid')
        }
        const body = (await res.json()) as { user: User }
        setUser(body.user)
        localStorage.setItem('infradeck:user', JSON.stringify(body.user))
      } catch {
        setUser(null)
        setToken(null)
        localStorage.removeItem('infradeck:user')
        localStorage.removeItem('infradeck:token')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const persistSession = (nextToken: string, nextUser: User) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('infradeck:token', nextToken)
    localStorage.setItem('infradeck:user', JSON.stringify(nextUser))
  }

  const register = async (data: { username: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const code = (body as any)?.error
      if (code === 'user_already_exists') {
        throw new Error('Este usuario o email ya existe')
      }
      if (code === 'password_too_short') {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }
      if (code === 'invalid_username_length') {
        throw new Error('El nickname debe tener entre 3 y 24 caracteres')
      }
      throw new Error('No se pudo registrar')
    }

    const payload = (await res.json()) as { accessToken: string; user: User }
    persistSession(payload.accessToken, payload.user)
  }

  const login = async (data: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const code = (body as any)?.error
      if (code === 'invalid_credentials') {
        throw new Error('Credenciales inválidas')
      }
      throw new Error('No se pudo iniciar sesión')
    }

    const payload = (await res.json()) as { accessToken: string; user: User }
    persistSession(payload.accessToken, payload.user)
  }

  const authFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers ?? {})
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(input, { ...init, headers })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('infradeck:user')
      localStorage.removeItem('infradeck:token')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

