import Lottie from 'lottie-react'
import React from 'react'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import Alert from 'cozy-ui/transpiled/react/Alert'
import Avatar from 'cozy-ui/transpiled/react/Avatar'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Dialog from 'cozy-ui/transpiled/react/Dialog'
import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import Cross from 'cozy-ui/transpiled/react/Icons/Cross'
import FolderOpen from 'cozy-ui/transpiled/react/Icons/FolderOpen'
import LinearProgress from 'cozy-ui/transpiled/react/LinearProgress'
import Typography from 'cozy-ui/transpiled/react/Typography'

import styles from './NextcloudProgressDialog.styl'
import {
  computeRemainingSeconds,
  isMigrationDone,
  computeProgressPercent,
  useDriveUrl
} from './useMigration'

import migrationAnimationDone from '@/assets/images/migration-animation-done.json'
import migrationAnimation from '@/assets/images/migration-animation.json'

const formatRemainingTime = (seconds, t) => {
  if (!seconds || seconds <= 0) return null
  if (seconds < 60)
    return t('MigrationView.nextcloud.progress.timeSeconds', {
      count: Math.round(seconds)
    })
  const minutes = Math.round(seconds / 60)
  return t('MigrationView.nextcloud.progress.timeMinutes', { count: minutes })
}

const ANIMATION_SIZE = 322
const AVATAR_SIZE = 146

const NextcloudProgressDialog = ({
  progress,
  startedAt,
  onCloseAll,
  onCancel,
  isCanceling,
  cancelSuccess,
  cancelError,
  status
}) => {
  const { t } = useI18n()
  const client = useClient()
  const avatarSrc = `${client.getStackClient().uri}/public/avatar?fallback=initials`
  const { subdomain: subDomainType } = client.getInstanceOptions()

  const isDone = isMigrationDone(status)
  const percent = computeProgressPercent(progress)

  const driveUrl = useDriveUrl(isDone, client, subDomainType)
  const remainingTimeSeconds = computeRemainingSeconds(progress, startedAt)

  return (
    <Dialog
      open
      fullScreen
      PaperProps={{
        className:
          'u-flex u-flex-column u-flex-items-center u-flex-justify-center',
        style: { background: 'var(--defaultBackgroundColor, #fff)' }
      }}
    >
      <IconButton
        onClick={onCloseAll}
        className="u-top-xs u-right-xs"
        style={{ position: 'absolute' }}
      >
        <Icon icon={Cross} size={16} />
      </IconButton>
      <div
        className="u-flex u-flex-column u-flex-items-center u-ph-3"
        style={{ width: '100%', maxWidth: 560 }}
      >
        <div
          className="u-mb-2"
          style={{
            position: 'relative',
            width: ANIMATION_SIZE,
            height: ANIMATION_SIZE
          }}
        >
          {isDone ? (
            <Lottie
              animationData={migrationAnimationDone}
              loop={false}
              style={{ width: ANIMATION_SIZE, height: ANIMATION_SIZE }}
            />
          ) : (
            <>
              <Lottie
                animationData={migrationAnimation}
                loop
                style={{ width: ANIMATION_SIZE, height: ANIMATION_SIZE }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <Avatar
                  src={avatarSrc}
                  size={AVATAR_SIZE}
                  className={styles['migration-avatar-pulse']}
                />
              </div>
            </>
          )}
        </div>

        {isDone ? (
          <>
            <Typography
              variant="h4"
              align="center"
              className="u-fw-bold u-mb-1"
            >
              {t('MigrationView.nextcloud.done.title')}
            </Typography>

            <Typography variant="body1" align="center" color="textSecondary">
              {t('MigrationView.nextcloud.done.subtitle')}
            </Typography>

            <Buttons
              variant="primary"
              label={t('MigrationView.nextcloud.done.openFolder')}
              className="u-mt-1"
              startIcon={<Icon icon={FolderOpen} size={16} />}
              component="a"
              href={driveUrl || '#'}
              rel="noopener noreferrer"
            />
          </>
        ) : (
          <>
            <Typography
              variant="h4"
              align="center"
              className="u-fw-bold u-mb-1"
            >
              {t('MigrationView.nextcloud.progress.title')}
            </Typography>

            <Typography variant="body1" align="center" color="textSecondary">
              {t('MigrationView.nextcloud.progress.subtitle')}
            </Typography>

            <div className="u-w-100 u-mb-1 u-mt-1">
              <LinearProgress
                variant="determinate"
                value={percent}
                style={{ height: 8, borderRadius: 4 }}
              />
            </div>

            <div className="u-flex u-flex-justify-between u-w-100 u-mb-4">
              <Typography variant="body2" color="textSecondary">
                {t('MigrationView.nextcloud.progress.percent', { percent })}
              </Typography>
              {(() => {
                const formattedTime = formatRemainingTime(
                  remainingTimeSeconds,
                  t
                )
                return formattedTime ? (
                  <Typography variant="body2" color="textSecondary">
                    {t('MigrationView.nextcloud.progress.remaining', {
                      time: formattedTime
                    })}
                  </Typography>
                ) : null
              })()}
            </div>

            {cancelSuccess && (
              <Alert severity="success" className="u-mt-1 u-w-100">
                {t('MigrationView.nextcloud.progress.cancelSuccess')}
              </Alert>
            )}
            {cancelError && (
              <Alert severity="error" className="u-mt-1 u-w-100">
                {t('MigrationView.nextcloud.progress.cancelError')}
              </Alert>
            )}
            <Buttons
              variant="text"
              label={t('MigrationView.nextcloud.progress.cancel')}
              onClick={onCancel}
              disabled={isCanceling}
              busy={isCanceling}
            />
          </>
        )}
      </div>
    </Dialog>
  )
}

export default NextcloudProgressDialog
