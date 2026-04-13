import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import Divider from 'cozy-ui/transpiled/react/Divider'
import Icon from 'cozy-ui/transpiled/react/Icon'
import CheckCircleIcon from 'cozy-ui/transpiled/react/Icons/CheckCircle'
import List from 'cozy-ui/transpiled/react/List'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemSecondaryAction from 'cozy-ui/transpiled/react/ListItemSecondaryAction'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import Paper from 'cozy-ui/transpiled/react/Paper'
import Typography from 'cozy-ui/transpiled/react/Typography'

import nextcloudLogo from '@/assets/icons/nextcloud-logo.svg'
import NextcloudMigrationDialog from '@/components/Migration/NextcloudMigrationDialog'
import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'

const ProviderLogo = ({ icon, alt }) => (
  <Icon icon={icon} aria-label={alt} size={40} />
)

const Migration = () => {
  const { t } = useI18n()
  const [showNextcloudDialog, setShowNextcloudDialog] = useState(false)

  const providers = [
    {
      id: 'nextcloud',
      icon: nextcloudLogo,
      name: t('MigrationView.nextcloud.name'),
      description: t('MigrationView.nextcloud.description')
    }
  ]

  return (
    <Page className="u-maw-7">
      <PageTitle>{t('MigrationView.title')}</PageTitle>

      <Typography variant="body1" className="u-mv-1" color="textSecondary">
        {t('MigrationView.subtitle')}
      </Typography>

      <div className="u-flex u-flex-items-center u-mb-2">
        <Icon
          icon={CheckCircleIcon}
          color="var(--successColor)"
          size={16}
          className="u-mr-half"
        />
        <Typography variant="body2" style={{ color: 'var(--successColor)' }}>
          {t('MigrationView.secureTransfer')}
        </Typography>
      </div>

      <Paper elevation={2} className="u-mb-3">
        <List disablePadding>
          {providers.map((provider, index) => (
            <React.Fragment key={provider.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem>
                <ListItemIcon>
                  <ProviderLogo icon={provider.icon} alt={provider.name} />
                </ListItemIcon>
                <ListItemText
                  primary={provider.name}
                  secondary={provider.description}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="secondary"
                    label={t('MigrationView.startMigration')}
                    size="small"
                    className="u-m-1"
                    onClick={() => setShowNextcloudDialog(true)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {showNextcloudDialog && (
        <NextcloudMigrationDialog
          onClose={() => setShowNextcloudDialog(false)}
        />
      )}

      <Typography variant="h6" className="u-mb-half">
        {t('MigrationView.help.title')}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {t('MigrationView.help.description')}{' '}
        <a href="#/support" className="u-link">
          {t('MigrationView.help.contactSupport')}
        </a>
      </Typography>
    </Page>
  )
}

export { Migration }
