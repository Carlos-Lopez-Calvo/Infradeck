interface GoogleCredentialResponse {
  credential?: string
  client_id?: string
  select_by?: string
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string
          callback?: (response: GoogleCredentialResponse) => void
          auto_select?: boolean
          cancel_on_tap_outside?: boolean
          ux_mode?: 'popup' | 'redirect'
          login_uri?: string
          use_fedcm_for_button?: boolean
          use_fedcm_for_prompt?: boolean
        }) => void
        renderButton: (
          parent: HTMLElement,
          options: Record<string, unknown> & { ux_mode?: 'popup' | 'redirect'; login_uri?: string },
        ) => void
        cancel: () => void
      }
    }
  }
}
