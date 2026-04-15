import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import { useClient, generateWebLink } from 'cozy-client'
import Avatar from 'cozy-ui/transpiled/react/Avatar'
import { IllustrationDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Divider from 'cozy-ui/transpiled/react/Divider'
import Icon from 'cozy-ui/transpiled/react/Icon'
import ConnectIcon from '/src/assets/icons/connect.svg'
import MigrateIcon from '/src/assets/icons/migrate.svg'
import RightIcon from 'cozy-ui/transpiled/react/Icons/Right'
import List from 'cozy-ui/transpiled/react/List'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import Typography from 'cozy-ui/transpiled/react/Typography'

import nextcloudLogo from '@/assets/icons/nextcloud-logo.svg'
import NextcloudConnectDialog from '@/components/Migration/NextcloudConnectDialog'

const NextcloudMigrationDialog = ({ onClose }) => {
  const { t } = useI18n()
  const client = useClient()
  const { subdomain: subDomainType } = client.getInstanceOptions()
  const [showConnectDialog, setShowConnectDialog] = useState(false)

  const nextcloudStoreUrl = generateWebLink({
    cozyUrl: client.getStackClient().uri,
    slug: 'home',
    subDomainType,
    hash: 'connected/nextcloud/new'
  })

  const options = [
    {
      id: 'transfer',
      icon: MigrateIcon,
      primary: t('MigrationView.nextcloud.dialog.transfer.title'),
      secondary: t('MigrationView.nextcloud.dialog.transfer.description'),
      onClick: () => setShowConnectDialog(true)
    },
    {
      id: 'external',
      icon: ConnectIcon,
      primary: t('MigrationView.nextcloud.dialog.external.title'),
      secondary: t('MigrationView.nextcloud.dialog.external.description'),
      href: nextcloudStoreUrl
    }
  ]

  if (showConnectDialog) {
    return (
      <NextcloudConnectDialog onClose={() => setShowConnectDialog(false)} />
    )
  }

  return (
    <IllustrationDialog
      open
      onClose={onClose}
      title={
        <div className="u-flex u-flex-column u-flex-items-center">
          <Avatar
            size={80}
            style={{ backgroundColor: 'var(--primaryColorLight)' }}
          >
            <Icon icon={nextcloudLogo} size={48} />
          </Avatar>
          <Typography variant="h3" className="u-mt-1">
            {t('MigrationView.nextcloud.dialog.title')}
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            className="u-mt-half u-fz-small"
          >
            {t('MigrationView.nextcloud.dialog.subtitle')}
          </Typography>
        </div>
      }
      content={
        <List disablePadding>
          {options.map((option, index) => (
            <React.Fragment key={option.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                button
                component={option.href ? 'a' : 'li'}
                href={option.href || undefined}
                rel={option.href ? 'noopener noreferrer' : undefined}
                onClick={option.onClick}
              >
                <ListItemIcon>
                  <Icon
                    icon={option.icon}
                    size={48}
                    color="var(--paperBackgroundColor)"
                  />
                </ListItemIcon>
                <ListItemText
                  primary={option.primary}
                  secondary={option.secondary}
                />
                <Icon icon={RightIcon} color="var(--secondaryTextColor)" />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      }
    />
  )
}

export default NextcloudMigrationDialog
