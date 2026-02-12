import React from 'react'
import { useI18n } from 'twake-i18n'

import flag from 'cozy-flags'
import Icon from 'cozy-ui/transpiled/react/Icon'
import PhoneIcon from 'cozy-ui/transpiled/react/Icons/Phone'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

const SubscriptionDevicesItem = () => {
  const { t } = useI18n()

  const maxDevices = flag('cozy.oauthclients.max')

  const label =
    !maxDevices || maxDevices === -1
      ? t('Subscription.included.devices.unlimited')
      : t('Subscription.included.devices.up_to', { smart_count: maxDevices })

  return (
    <ListItem size="small" ellipsis={false}>
      <ListItemIcon>
        <Icon icon={PhoneIcon} />
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItem>
  )
}

export { SubscriptionDevicesItem }
