export const GOOGLE_CREDENTIAL_STORAGE_KEY = 'infradeck_google_credential'
const HASH_PREFIX = '#infradeck_google='

export function peekGoogleCredentialFromHash(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash.startsWith(HASH_PREFIX)) return null
  try {
    return decodeURIComponent(hash.slice(HASH_PREFIX.length))
  } catch {
    return null
  }
}

export function hasPendingGoogleAuth(): boolean {
  if (typeof window === 'undefined') return false
  if (peekGoogleCredentialFromHash()) return true
  return sessionStorage.getItem(GOOGLE_CREDENTIAL_STORAGE_KEY) !== null
}

export function clearGoogleAuthReturn(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(GOOGLE_CREDENTIAL_STORAGE_KEY)
  const url = new URL(window.location.href)
  url.searchParams.delete('auth')
  url.hash = ''
  const next = `${url.pathname}${url.search}` || '/'
  window.history.replaceState({}, '', next)
}

/** @deprecated use clearGoogleAuthReturn */
export const clearGoogleAuthQuery = clearGoogleAuthReturn
