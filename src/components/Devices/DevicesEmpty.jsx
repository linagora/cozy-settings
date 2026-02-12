import React from 'react'
import { useI18n } from 'twake-i18n'

import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Empty from 'cozy-ui/transpiled/react/Empty'

import EmptyIcon from '@/assets/icons/icon-devices.svg'

/**
 * Empty state to be displayed when no device is connected
 */
const DevicesEmpty = () => {
  const { t } = useI18n()
  return (
    <Empty
      className="u-maw-6"
      icon={EmptyIcon}
      title={t('Empty.devices.title')}
      text={t('Empty.devices.text')}
    >
      <Buttons
        href={t('Empty.devices.link.href')}
        label={t('Empty.devices.link.text')}
      />
    </Empty>
  )
}

export { DevicesEmpty }
