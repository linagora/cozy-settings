import React, { useState, useCallback, useEffect } from 'react'
import { useI18n } from 'twake-i18n'

import { useInstanceInfo, useQuery, isQueryLoading } from 'cozy-client'
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
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'

import nextcloudLogo from '@/assets/icons/nextcloud-logo.svg'
import { NextcloudCleanConfirmDialog } from '@/components/Migration/NextcloudCleanConfirmDialog'
import { NextcloudCleaningDialog } from '@/components/Migration/NextcloudCleaningDialog'
import { NextcloudMigrationDialog } from '@/components/Migration/NextcloudMigrationDialog'
import useMigration from '@/components/Migration/useMigration'
import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import { buildCompletedNextcloudMigrationsQuery } from '@/lib/queries'

const SNACKBAR_AUTO_HIDE_MS = 6000

const DumbMigration = ({
  helpLink,
  isNextcloudMigrated,
  isCleaning,
  showNextcloudDialog,
  showCleanConfirmDialog,
  showCleaningDialog,
  onStartMigration,
  onRequestClean,
  onCancelClean,
  onConfirmClean,
  onCloseNextcloudDialog,
  onDismissCleaningDialog
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
              <Icon
                icon={nextcloudLogo}
                aria-label={t('MigrationView.nextcloud.name')}
                size={40}
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <span className="u-flex u-flex-items-center">
                  {t('MigrationView.nextcloud.name')}
                  {isNextcloudMigrated && (
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
              {isNextcloudMigrated ? (
                <Button
                  variant="text"
                  label={t('MigrationView.cleanNextcloud')}
                  size="small"
                  className="u-m-1"
                  startIcon={<Icon icon={DeleteIcon} size={14} />}
                  color="error"
                  onClick={onRequestClean}
                  disabled={isCleaning}
                />
              ) : (
                <Button
                  variant="secondary"
                  label={t('MigrationView.startMigration')}
                  size="small"
                  className="u-m-1"
                  onClick={onStartMigration}
                />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {showNextcloudDialog && (
        <NextcloudMigrationDialog onCloseAll={onCloseNextcloudDialog} />
      )}

      {showCleanConfirmDialog && (
        <NextcloudCleanConfirmDialog
          isCleaning={isCleaning}
          onCancel={onCancelClean}
          onConfirm={onConfirmClean}
        />
      )}

      {showCleaningDialog && (
        <NextcloudCleaningDialog onClose={onDismissCleaningDialog} />
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
  const { t } = useI18n()
  const { showAlert } = useAlert()
  const { context } = useInstanceInfo()
  const helpLink = context?.data?.help_link || 'https://twake.app/en/support/'

  const completedMigrationsQuery = buildCompletedNextcloudMigrationsQuery()
  const { data: completedMigrations, ...completedMigrationsQueryState } =
    useQuery(
      completedMigrationsQuery.definition,
      completedMigrationsQuery.options
    )

  const completedMigration = isQueryLoading(completedMigrationsQueryState)
    ? null
    : (completedMigrations?.[0] ?? null)
  const isNextcloudMigrated = Boolean(completedMigration)
  const completedMigrationId = completedMigration?._id ?? null

  const {
    clean,
    isCleaning,
    cleanSuccess,
    cleanError,
    setCleanSuccess,
    setCleanError
  } = useMigration({
    migrationId: completedMigrationId
  })

  const [showNextcloudDialog, setShowNextcloudDialog] = useState(false)
  const [showCleanConfirmDialog, setShowCleanConfirmDialog] = useState(false)
  const [cleaningDialogDismissed, setCleaningDialogDismissed] = useState(false)

  const handleConfirmClean = useCallback(async () => {
    setShowCleanConfirmDialog(false)
    setCleaningDialogDismissed(false)
    if (isCleaning) return
    await clean()
  }, [isCleaning, clean])

  useEffect(() => {
    if (!cleanSuccess) return

    showAlert({
      title: t('MigrationView.cleanedSnackbar.title'),
      message: t('MigrationView.cleanedSnackbar.description'),
      severity: 'success',
      duration: SNACKBAR_AUTO_HIDE_MS
    })
    setCleanSuccess(false)
  }, [cleanSuccess, setCleanSuccess, showAlert, t])

  useEffect(() => {
    if (!cleanError) return

    showAlert({
      title: t('MigrationView.cleanErrorSnackbar.title'),
      message: t('MigrationView.cleanErrorSnackbar.description'),
      severity: 'error',
      duration: SNACKBAR_AUTO_HIDE_MS
    })
    setCleanError(null)
  }, [cleanError, setCleanError, showAlert, t])

  return (
    <DumbMigration
      helpLink={helpLink}
      isNextcloudMigrated={isNextcloudMigrated}
      isCleaning={isCleaning}
      showNextcloudDialog={showNextcloudDialog}
      showCleanConfirmDialog={showCleanConfirmDialog}
      showCleaningDialog={isCleaning && !cleaningDialogDismissed}
      onStartMigration={() => setShowNextcloudDialog(true)}
      onRequestClean={() => setShowCleanConfirmDialog(true)}
      onCancelClean={() => setShowCleanConfirmDialog(false)}
      onConfirmClean={handleConfirmClean}
      onCloseNextcloudDialog={() => setShowNextcloudDialog(false)}
      onDismissCleaningDialog={() => setCleaningDialogDismissed(true)}
    />
  )
}

export { Migration }
