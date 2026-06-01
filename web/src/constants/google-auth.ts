export const GOOGLE_CREDENTIAL_STORAGE_KEY = 'infradeck_google_credential'

export function hasPendingGoogleAuth(): boolean {
  if (typeof window === 'undefined') return false
  if (sessionStorage.getItem(GOOGLE_CREDENTIAL_STORAGE_KEY)) return true
  return new URLSearchParams(window.location.search).get('auth') === 'google'
}

export function clearGoogleAuthQuery(): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (!url.searchParams.has('auth')) return
  url.searchParams.delete('auth')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', next || '/')
}
