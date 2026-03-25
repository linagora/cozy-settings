import { useClient } from 'cozy-client'
import flag from 'cozy-flags'

interface useCanAuthWithReturn {
  canAuthWithOIDC: boolean
  canAuthWithPassword: boolean
  canAuthWithMagicLinks: boolean
}

export const useCanAuthWith = (): useCanAuthWithReturn => {
  const client = useClient()

  return {
    canAuthWithOIDC: flag('settings.oidc-auth')
      ? true
      : (client?.capabilities.can_auth_with_oidc ?? false),
    canAuthWithPassword: client?.capabilities.can_auth_with_password ?? false,
    canAuthWithMagicLinks:
      client?.capabilities.can_auth_with_magic_links ?? false
  }
}
