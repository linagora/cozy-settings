import React, { useState, useEffect, useMemo } from 'react'
import { useI18n } from 'twake-i18n'

import {
  useInstanceInfo,
  useQuery,
  Q,
  isQueryLoading,
  useClient
} from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import Chip from 'cozy-ui/transpiled/react/Chips'
import Divider from 'cozy-ui/transpiled/react/Divider'
import Icon from 'cozy-ui/transpiled/react/Icon'
import CheckCircleIcon from 'cozy-ui/transpiled/react/Icons/CheckCircle'
import DeleteIcon from 'cozy-ui/transpiled/react/Icons/Trash'
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

const NEXTCLOUD_MIGRATIONS_DOCTYPE = 'io.cozy.nextcloud.migrations'

const buildCompletedNextcloudMigrationsQuery = () => ({
  definition: Q(NEXTCLOUD_MIGRATIONS_DOCTYPE)
    .where({ status: 'completed' })
    .limitBy(1)
    .indexFields(['status']),
  options: {
    as: `${NEXTCLOUD_MIGRATIONS_DOCTYPE}/completed`
  }
})

const ProviderLogo = ({ icon, alt }) => (
  <Icon icon={icon} aria-label={alt} size={40} />
)

const Migration = () => {
  const { t } = useI18n()
  const client = useClient()
  const [showNextcloudDialog, setShowNextcloudDialog] = useState(false)
  const [isCleaningNextcloud, setIsCleaningNextcloud] = useState(false)
  const [hasCompletedNextcloudMigration, setHasCompletedNextcloudMigration] =
    useState(false)

  const { context } = useInstanceInfo()
  const helpLink = context?.data?.help_link || 'https://twake.app/en/support/'
  const completedMigrationsQuery = useMemo(
    () => buildCompletedNextcloudMigrationsQuery(),
    []
  )
  const { data: completedMigrations, ...completedMigrationsQueryState } =
    useQuery(
      completedMigrationsQuery.definition,
      completedMigrationsQuery.options
    )
  useEffect(() => {
    if (isQueryLoading(completedMigrationsQueryState)) return
    setHasCompletedNextcloudMigration(completedMigrations?.length > 0)
  }, [completedMigrations, completedMigrationsQueryState])

  const isNextcloudMigrated = hasCompletedNextcloudMigration

  useEffect(() => {
    const handleUpdate = doc => {
      if (doc.status === 'completed') {
        setHasCompletedNextcloudMigration(true)
        client.query(
          completedMigrationsQuery.definition,
          completedMigrationsQuery.options
        )
      }
    }
    client.plugins.realtime.subscribe(
      'updated',
      NEXTCLOUD_MIGRATIONS_DOCTYPE,
      handleUpdate
    )
    return () => {
      client.plugins.realtime.unsubscribe(
        'updated',
        NEXTCLOUD_MIGRATIONS_DOCTYPE,
        handleUpdate
      )
    }
  }, [client, completedMigrationsQuery])

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

      <Paper elevation={1} className="u-mb-3">
        <List disablePadding>
          {providers.map((provider, index) => (
            <React.Fragment key={provider.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem>
                <ListItemIcon>
                  <ProviderLogo icon={provider.icon} alt={provider.name} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span className="u-flex u-flex-items-center">
                      {provider.name}
                      {provider.id === 'nextcloud' && isNextcloudMigrated && (
                        <Chip
                          label={t('MigrationView.migrated')}
                          color="success"
                          variant="ghost"
                          icon={<Icon icon={CheckCircleIcon} size="12" />}
                          className="u-ml-half"
                        />
                      )}
                    </span>
                  }
                  secondary={provider.description}
                />
                <ListItemSecondaryAction>
                  {provider.id === 'nextcloud' && isNextcloudMigrated ? (
                    <Button
                      variant="text"
                      label={t('MigrationView.cleanNextcloud')}
                      size="small"
                      className="u-m-1"
                      startIcon={<Icon icon={DeleteIcon} size={14} />}
                      color="error"
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      label={t('MigrationView.startMigration')}
                      size="small"
                      className="u-m-1"
                      onClick={() =>
                        provider.id === 'nextcloud' &&
                        setShowNextcloudDialog(true)
                      }
                    />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {showNextcloudDialog && (
        <NextcloudMigrationDialog
          onCloseAll={() => setShowNextcloudDialog(false)}
        />
      )}

      <Typography variant="h6" className="u-mb-half">
        {t('MigrationView.help.title')}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {t('MigrationView.help.description')}{' '}
        <a href={helpLink} target="_blank" className="u-link" rel="noreferrer">
          {t('MigrationView.help.contactSupport')}
        </a>
      </Typography>
    </Page>
  )
}

export { Migration }
