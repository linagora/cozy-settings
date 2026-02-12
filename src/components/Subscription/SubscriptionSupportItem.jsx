import React from 'react'
import { useI18n } from 'twake-i18n'

import Icon from 'cozy-ui/transpiled/react/Icon'
import HelpOutlinedIcon from 'cozy-ui/transpiled/react/Icons/HelpOutlined'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

const SubscriptionSupportItem = () => {
  const { t } = useI18n()

  return (
    <ListItem size="small" ellipsis={false}>
      <ListItemIcon>
        <Icon icon={HelpOutlinedIcon} />
      </ListItemIcon>
      <ListItemText primary={t('Subscription.included.support')} />
    </ListItem>
  )
}

export { SubscriptionSupportItem }
