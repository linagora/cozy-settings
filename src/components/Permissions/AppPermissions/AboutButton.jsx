import React from 'react'
import { useI18n } from 'twake-i18n'

import { useClient, generateWebLink } from 'cozy-client'
import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import InfoIcon from 'cozy-ui/transpiled/react/Icons/Info'
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
          <Icon icon={InfoIcon} />
        </IconButton>
      )}
    </AppLinker>
  )
}
