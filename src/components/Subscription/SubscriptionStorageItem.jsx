import React from 'react'
import { useI18n } from 'twake-i18n'

import { useInstanceInfo } from 'cozy-client'
import { makeDiskInfos } from 'cozy-client/dist/models/instance'
import Icon from 'cozy-ui/transpiled/react/Icon'
import DriveIcon from 'cozy-ui/transpiled/react/Icons/Drive'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

/**
 * Show user storage quota
 */
const SubscriptionStorageItem = () => {
  const { t } = useI18n()

  const { diskUsage } = useInstanceInfo()

  const { humanDiskQuota } = makeDiskInfos(
    diskUsage.data?.used,
    diskUsage.data?.quota
  )

  return (
    <ListItem size="small" ellipsis={false}>
      <ListItemIcon>
        <Icon icon={DriveIcon} />
      </ListItemIcon>
      <ListItemText
        primary={t('Subscription.included.storage', { humanDiskQuota })}
      />
    </ListItem>
  )
}

export { SubscriptionStorageItem }
