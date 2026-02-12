import React from 'react'
import { useI18n } from 'twake-i18n'

import flag from 'cozy-flags'
import Icon from 'cozy-ui/transpiled/react/Icon'
import PassIcon from 'cozy-ui/transpiled/react/Icons/Pass'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

const SubscriptionPasswordsItem = () => {
  const { t } = useI18n()

  const label = flag('passwords.can-share-organizations')
    ? t('Subscription.included.passwords.share')
    : t('Subscription.included.passwords.default')

  return (
    <ListItem size="small" ellipsis={false}>
      <ListItemIcon>
        <Icon icon={PassIcon} />
      </ListItemIcon>
      <ListItemText primary={label} />
    </ListItem>
  )
}

export { SubscriptionPasswordsItem }
