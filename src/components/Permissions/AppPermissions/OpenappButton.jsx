import React from 'react'
import { useI18n } from 'twake-i18n'

import { useClient, generateWebLink } from 'cozy-client'
import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import OpenappIcon from 'cozy-ui/transpiled/react/Icons/Openapp'
import AppLinker from 'cozy-ui-plus/dist/AppLinker'

export const OpenappButton = ({ type, appData }) => {
  const { t } = useI18n()
  const client = useClient()
  const { subdomain: subDomainType } = client.getInstanceOptions()

  // eslint-disable-next-line no-useless-assignment
  let appWebRef = ''
  if (type === 'konnector') {
    appWebRef =
      appData &&
      generateWebLink({
        cozyUrl: client.getStackClient().uri,
        slug: 'home',
        subDomainType,
        hash: `connected/${appData.slug}`
      })
  } else {
    appWebRef = appData.links?.related
  }

  return (
    <AppLinker app={appData} href={appWebRef}>
      {({ onClick, href }) => (
        <IconButton
          aria-label={t('Permissions.open')}
          href={href}
          onClick={onClick}
        >
          <Icon icon={OpenappIcon} />
        </IconButton>
      )}
    </AppLinker>
  )
}
