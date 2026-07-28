import { Icon, Info } from '@linagora/twake-icons'
import React from 'react'
import { useI18n } from 'twake-i18n'

import { useClient, generateWebLink } from 'cozy-client'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import AppLinker from 'cozy-ui-plus/dist/AppLinker'

export const AboutButton = ({ appData }) => {
  const { t } = useI18n()
  const client = useClient()
  const { subdomain: subDomainType } = client.getInstanceOptions()
  const appWebRef =
    appData &&
    generateWebLink({
      cozyUrl: client.getStackClient().uri,
      slug: 'store',
      subDomainType,
      hash: `discover/${appData.slug}`
    })

  return (
    <AppLinker app={appData} href={appWebRef}>
      {({ onClick, href }) => (
        <IconButton
          aria-label={t('Permissions.about')}
          href={href}
          onClick={onClick}
        >
          <Icon icon={Info} />
        </IconButton>
      )}
    </AppLinker>
  )
}
