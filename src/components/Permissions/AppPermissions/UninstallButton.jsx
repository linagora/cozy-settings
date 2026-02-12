import React from 'react'
import { useI18n } from 'twake-i18n'

import { useClient, generateWebLink } from 'cozy-client'
import CircleButton from 'cozy-ui/transpiled/react/CircleButton'
import Icon from 'cozy-ui/transpiled/react/Icon'
import TrashIcon from 'cozy-ui/transpiled/react/Icons/Trash'
import AppLinker from 'cozy-ui-plus/dist/AppLinker'

export const UninstallButton = ({ appData }) => {
  const { t } = useI18n()
  const client = useClient()
  const { subdomain: subDomainType } = client.getInstanceOptions()
  const appWebRef =
    appData &&
    generateWebLink({
      cozyUrl: client.getStackClient().uri,
      slug: 'store',
      subDomainType,
      hash: `discover/${appData.slug}/uninstall`
    })

  return (
    <AppLinker app={appData} href={appWebRef}>
      {({ onClick, href }) => (
        <CircleButton
          label={t('Permissions.uninstall')}
          href={href}
          onClick={onClick}
        >
          <Icon icon={TrashIcon} />
        </CircleButton>
      )}
    </AppLinker>
  )
}
