import React, { useState, useCallback } from 'react'
import { useI18n } from 'twake-i18n'

import {
  useInstanceInfo,
  useQuery,
  isQueryLoading,
  useClient
} from 'cozy-client'
import flag from 'cozy-flags'
import Button from 'cozy-ui/transpiled/react/Buttons'
import Chip from 'cozy-ui/transpiled/react/Chips'
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
import {
  resetNextcloudMigrationForTests,
  RESET_NEXTCLOUD_MIGRATION_FLAG
} from '@/components/Migration/resetNextcloudMigration'
import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import logger from '@/lib/logger'
import { buildCompletedNextcloudMigrationsQuery } from '@/lib/queries'

const completedMigrationsQuery = buildCompletedNextcloudMigrationsQuery()

const ProviderLogo = ({ icon, alt }) => (
  <Icon icon={icon} aria-label={alt} size={40} />
)

const DumbMigration = ({
  helpLink,
  hasCompletedNextcloudMigration,
  isCleaningNextcloud,
  showNextcloudDialog,
  onCleanNextcloud,
  onShowNextcloudDialog
}) => {
  const { t } = useI18n()

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
          <ListItem>
            <ListItemIcon>
              <ProviderLogo
                icon={nextcloudLogo}
                alt={t('MigrationView.nextcloud.name')}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <span className="u-flex u-flex-items-center">
                  {t('MigrationView.nextcloud.name')}
                  {hasCompletedNextcloudMigration && (
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
              secondary={t('MigrationView.nextcloud.description')}
            />
            <ListItemSecondaryAction>
              {hasCompletedNextcloudMigration ? (
                <Button
                  variant="text"
                  label={t('MigrationView.cleanNextcloud')}
                  size="small"
                  className="u-m-1"
                  startIcon={<Icon icon={DeleteIcon} size={14} />}
                  color="error"
                  onClick={onCleanNextcloud}
                  disabled={isCleaningNextcloud}
                />
              ) : (
                <Button
                  variant="secondary"
                  label={t('MigrationView.startMigration')}
                  size="small"
                  className="u-m-1"
                  onClick={() => onShowNextcloudDialog(true)}
                />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {showNextcloudDialog && (
        <NextcloudMigrationDialog
          onCloseAll={() => onShowNextcloudDialog(false)}
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

const Migration = () => {
  const client = useClient()
  const [showNextcloudDialog, setShowNextcloudDialog] = useState(false)
  const [isCleaningNextcloud, setIsCleaningNextcloud] = useState(false)

  const { context } = useInstanceInfo()
  const helpLink = context?.data?.help_link || 'https://twake.app/en/support/'

  const { data: completedMigrations, ...completedMigrationsQueryState } =
    useQuery(
      completedMigrationsQuery.definition,
      completedMigrationsQuery.options
    )
  const hasCompletedNextcloudMigration =
    !isQueryLoading(completedMigrationsQueryState) &&
    (completedMigrations?.length ?? 0) > 0

  const handleCleanNextcloud = useCallback(async () => {
    if (!flag(RESET_NEXTCLOUD_MIGRATION_FLAG) || isCleaningNextcloud) return

    setIsCleaningNextcloud(true)

    try {
      await resetNextcloudMigrationForTests({
        client,
        completedMigrationsQuery
      })
    } catch (error) {
      logger.error('Failed to reset Nextcloud migration for tests', error)
    } finally {
      setIsCleaningNextcloud(false)
    }
  }, [client, isCleaningNextcloud])

  return (
    <DumbMigration
      helpLink={helpLink}
      hasCompletedNextcloudMigration={hasCompletedNextcloudMigration}
      isCleaningNextcloud={isCleaningNextcloud}
      showNextcloudDialog={showNextcloudDialog}
      onCleanNextcloud={handleCleanNextcloud}
      onShowNextcloudDialog={setShowNextcloudDialog}
    />
  )
}

export { Migration }
