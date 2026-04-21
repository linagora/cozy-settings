import React, { useCallback, useEffect, useState } from 'react'
import { useI18n } from 'twake-i18n'

import { Q, useClient } from 'cozy-client'
import Alert from 'cozy-ui/transpiled/react/Alert'
import AlertTitle from 'cozy-ui/transpiled/react/AlertTitle'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Icon from 'cozy-ui/transpiled/react/Icon'
import Upload from 'cozy-ui/transpiled/react/Icons/Upload'
import LinearProgress from 'cozy-ui/transpiled/react/LinearProgress'
import Snackbar from 'cozy-ui/transpiled/react/Snackbar'
import Typography from 'cozy-ui/transpiled/react/Typography'

import { NEXTCLOUD_MIGRATIONS_DOCTYPE } from '@/components/Migration/useMigration'
import logger from '@/lib/logger'

const SNACKBAR_AUTO_HIDE_MS = 6000
const isMigrationEnded = status =>
  status === 'completed' || status === 'cancelled' || status === 'error'

const MigrationProgressBanner = () => {
  const { t } = useI18n()
  const client = useClient()

  const [migrationDoc, setMigrationDoc] = useState(null)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [completedFilesTotal, setCompletedFilesTotal] = useState(0)

  useEffect(() => {
    let cancelled = false
    const fetchRunning = async () => {
      try {
        const { data } = await client.query(
          Q(NEXTCLOUD_MIGRATIONS_DOCTYPE)
            .where({ status: 'running' })
            .indexFields(['status', 'cozyMetadata.createdAt'])
            .sortBy([{ 'cozyMetadata.createdAt': 'desc' }])
            .limitBy(1)
        )
        if (cancelled || data?.length === 0) return

        setMigrationDoc(data[0])
      } catch (error) {
        if (!cancelled) {
          logger.error('Failed to fetch running Nextcloud migration', error)
        }
      }
    }
    fetchRunning()
    return () => {
      cancelled = true
    }
  }, [client])

  useEffect(() => {
    const handleCreated = doc => {
      if (!isMigrationEnded(doc.status)) setMigrationDoc(doc)
    }
    client.plugins.realtime.subscribe(
      'created',
      NEXTCLOUD_MIGRATIONS_DOCTYPE,
      handleCreated
    )
    return () => {
      client.plugins.realtime.unsubscribe(
        'created',
        NEXTCLOUD_MIGRATIONS_DOCTYPE,
        handleCreated
      )
    }
  }, [client])

  useEffect(() => {
    if (!migrationDoc?._id) return

    const handleUpdate = doc => {
      if (doc.status === 'completed') {
        setCompletedFilesTotal(doc.progress?.files_total ?? 0)
        setMigrationDoc(null)
        setShowSnackbar(true)
      } else if (doc.status === 'cancelled' || doc.status === 'error') {
        setMigrationDoc(null)
      } else {
        setMigrationDoc(doc)
      }
    }

    client.plugins.realtime.subscribe(
      'updated',
      NEXTCLOUD_MIGRATIONS_DOCTYPE,
      migrationDoc._id,
      handleUpdate
    )
    return () => {
      client.plugins.realtime.unsubscribe(
        'updated',
        NEXTCLOUD_MIGRATIONS_DOCTYPE,
        migrationDoc._id,
        handleUpdate
      )
    }
  }, [client, migrationDoc?._id])

  const handleCancel = useCallback(async () => {
    if (!migrationDoc?._id || isCanceling) return
    setIsCanceling(true)
    try {
      await client
        .getStackClient()
        .fetchJSON(
          'POST',
          `/remote/nextcloud/migration/${migrationDoc._id}/cancel`
        )
    } catch (e) {
      // 409 means already terminal: not an error from the user's perspective
      if (e.status !== 409) logger.error('Migration cancel failed', e)
    } finally {
      setIsCanceling(false)
    }
  }, [client, migrationDoc?._id, isCanceling])

  const progress = migrationDoc?.progress
  const percent =
    progress?.bytes_total > 0
      ? Math.round((progress.bytes_imported / progress.bytes_total) * 100)
      : 0

  return (
    <>
      {migrationDoc && (
        <div className="u-p-half" data-testid="migration-progress-banner">
          <div className="u-flex u-flex-items-center">
            <Icon icon={Upload} size={16} className="u-mr-half" />
            <div className="u-flex-auto">
              <div className="u-flex u-flex-items-center u-mb-half">
                <div className="u-flex u-flex-items-center u-flex-grow-1">
                  <Typography variant="body2">
                    {t('MigrationProgressBanner.title')}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className="u-ml-half"
                    data-testid="migration-progress-banner-percent"
                  >
                    {t('MigrationProgressBanner.percent', { percent })}
                  </Typography>
                </div>
                <div className="u-flex u-flex-items-center u-flex-shrink-0">
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    data-testid="migration-progress-banner-importing"
                  >
                    {t('MigrationProgressBanner.importing', {
                      count: progress?.files_total ?? 0
                    })}
                  </Typography>
                  <Buttons
                    variant="text"
                    size="small"
                    label={t('MigrationProgressBanner.cancel')}
                    onClick={handleCancel}
                    disabled={isCanceling}
                    busy={isCanceling}
                    data-testid="migration-progress-banner-cancel"
                  />
                </div>
              </div>
              <LinearProgress variant="determinate" value={percent} />
            </div>
          </div>
        </div>
      )}
      {showSnackbar && (
        <Snackbar
          open
          autoHideDuration={SNACKBAR_AUTO_HIDE_MS}
          onClose={() => setShowSnackbar(false)}
        >
          <Alert
            variant="filled"
            elevation={6}
            severity="success"
            onClose={() => setShowSnackbar(false)}
            data-testid="migration-progress-banner-done"
          >
            <AlertTitle>{t('MigrationProgressBanner.done.title')}</AlertTitle>
            {t('MigrationProgressBanner.done.body', {
              count: completedFilesTotal
            })}
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default MigrationProgressBanner
