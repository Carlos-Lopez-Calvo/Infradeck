interface GoogleCredentialResponse {
  credential?: string
  client_id?: string
  select_by?: string
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: Record<string, unknown>) => void
        renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        cancel: () => void
      }
    }
  }
}
