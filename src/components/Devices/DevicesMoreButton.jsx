import { Icon, Dots } from '@linagora/twake-icons'
import React from 'react'
import { useI18n } from 'twake-i18n'

import IconButton from 'cozy-ui/transpiled/react/IconButton'

const DevicesMoreButton = ({ deviceName, onClick }) => {
  const { t } = useI18n()
  return (
    <IconButton
      theme="secondary"
      extension="narrow"
      size="small"
      aria-label={`${t('Toolbar.more')} ${deviceName}`}
      onClick={onClick}
    >
      <Icon icon={Dots} />
    </IconButton>
  )
}

export { DevicesMoreButton }
