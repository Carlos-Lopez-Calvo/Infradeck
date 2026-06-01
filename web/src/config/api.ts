export const API_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl && envUrl.trim()) return envUrl.trim()
  if (typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:3001`
  return 'http://localhost:3001'
})()
