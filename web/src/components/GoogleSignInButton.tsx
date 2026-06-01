import { useEffect, useRef } from 'react'
import { useGoogleOAuth, type CredentialResponse } from '@react-oauth/google'
import { API_BASE } from '../config/api'

type GoogleSignInButtonProps = {
  onSuccess: (response: CredentialResponse) => void
  onError?: (message: string) => void
  disabled?: boolean
}

const loginUri = `${API_BASE.replace(/\/$/, '')}/auth/google/callback`

export function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth()
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const configuredRef = useRef<string | null>(null)

  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !containerRef.current || disabled) return

    const google = window.google
    if (!google?.accounts?.id) {
      onErrorRef.current?.('No se pudo cargar el script de Google')
      return
    }

    const configKey = `${clientId}:${loginUri}`
    if (configuredRef.current !== configKey) {
      google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'redirect',
        login_uri: loginUri,
        use_fedcm_for_button: false,
        use_fedcm_for_prompt: false,
        callback: (credentialResponse) => {
          if (!credentialResponse.credential) {
            onErrorRef.current?.('No se recibió credencial de Google')
            return
          }
          onSuccessRef.current({
            credential: credentialResponse.credential,
            clientId: credentialResponse.client_id,
            select_by: credentialResponse.select_by,
          })
        },
      })
      configuredRef.current = configKey
    }

    const el = containerRef.current
    el.innerHTML = ''
    google.accounts.id.renderButton(el, {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      locale: 'es',
      ux_mode: 'redirect',
      login_uri: loginUri,
    })
  }, [scriptLoadedSuccessfully, clientId, disabled])

  if (!scriptLoadedSuccessfully) {
    return <p className="text-xs text-slate-500 text-center">Cargando Google…</p>
  }

  return <div ref={containerRef} className="min-h-10 flex justify-center" />
}
