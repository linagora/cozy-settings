import Lottie from 'lottie-react'
import React from 'react'
import { useI18n } from 'twake-i18n'

import { generateWebLink, useClient } from 'cozy-client'
import Avatar from 'cozy-ui/transpiled/react/Avatar'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Dialog from 'cozy-ui/transpiled/react/Dialog'
import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import Cross from 'cozy-ui/transpiled/react/Icons/Cross'
import FolderOpen from 'cozy-ui/transpiled/react/Icons/FolderOpen'
import Typography from 'cozy-ui/transpiled/react/Typography'

import MigrationProgressInfo from './MigrationProgressInfo'
import styles from './NextcloudProgressDialog.styl'
import {
  computeRemainingSeconds,
  isMigrationDone,
  computeProgressPercent,
  useDriveUrl
} from './useMigration'

import migrationAnimationDone from '@/assets/images/migration-animation-done.json'
import migrationAnimation from '@/assets/images/migration-animation.json'

const ANIMATION_SIZE = 322
const AVATAR_SIZE = 146

const NextcloudProgressDialogView = ({
  onCloseAll,
  avatarSrc,
  isDone,
  progressTitle,
  progressSubtitle,
  doneSubtitle,
  doneButtonLabel,
  showProgressInfo,
  percent,
  remainingTimeSeconds,
  cancelSuccess,
  cancelError,
  onCancel,
  isCanceling,
  driveUrl
}) => {
  const { t } = useI18n()

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
              {doneSubtitle}
            </Typography>

            <Buttons
              variant="primary"
              label={doneButtonLabel}
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
              {progressTitle}
            </Typography>

            <Typography variant="body1" align="center" color="textSecondary">
              {progressSubtitle}
            </Typography>

            {showProgressInfo && (
              <MigrationProgressInfo
                percent={percent}
                remainingTimeSeconds={remainingTimeSeconds}
                cancelSuccess={cancelSuccess}
                cancelError={cancelError}
                onCancel={onCancel}
                isCanceling={isCanceling}
              />
            )}
          </>
        )}
      </div>
    </Dialog>
  )
}

const NextcloudConnectionProgressDialog = ({ onCloseAll, isDone }) => {
  const { t } = useI18n()
  const client = useClient()
  const { subdomain: subDomainType } = client.getInstanceOptions()
  const avatarSrc = `${client.getStackClient().uri}/public/avatar?fallback=initials`
  const driveRootUrl = generateWebLink({
    cozyUrl: client.getStackClient().uri,
    slug: 'drive',
    subDomainType,
    hash: ''
  })

  return (
    <NextcloudProgressDialogView
      onCloseAll={onCloseAll}
      avatarSrc={avatarSrc}
      isDone={isDone}
      progressTitle={t('MigrationView.nextcloud.connectionProgress.title')}
      progressSubtitle={t(
        'MigrationView.nextcloud.connectionProgress.subtitle'
      )}
      doneSubtitle={t('MigrationView.nextcloud.connectionDone.subtitle')}
      doneButtonLabel={t('MigrationView.nextcloud.connectionDone.openDrive')}
      showProgressInfo={false}
      percent={0}
      remainingTimeSeconds={null}
      cancelSuccess={false}
      cancelError={null}
      onCancel={null}
      isCanceling={false}
      driveUrl={driveRootUrl}
    />
  )
}

const NextcloudTransferProgressDialog = ({
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
  const migrationDriveUrl = useDriveUrl(isDone, client, subDomainType)
  const remainingTimeSeconds = computeRemainingSeconds(progress, startedAt)

  return (
    <NextcloudProgressDialogView
      onCloseAll={onCloseAll}
      avatarSrc={avatarSrc}
      isDone={isDone}
      progressTitle={t('MigrationView.nextcloud.progress.title')}
      progressSubtitle={t('MigrationView.nextcloud.progress.subtitle')}
      doneSubtitle={t('MigrationView.nextcloud.done.subtitle')}
      doneButtonLabel={t('MigrationView.nextcloud.done.openFolder')}
      showProgressInfo
      percent={percent}
      remainingTimeSeconds={remainingTimeSeconds}
      cancelSuccess={cancelSuccess}
      cancelError={cancelError}
      onCancel={onCancel}
      isCanceling={isCanceling}
      driveUrl={migrationDriveUrl}
    />
  )
}

const NextcloudProgressDialog = ({ mode, ...props }) => {
  if (mode === 'connect') {
    return (
      <NextcloudConnectionProgressDialog
        onCloseAll={props.onCloseAll}
        isDone={props.isDone}
      />
    )
  }

  if (mode === 'transfer') {
    return <NextcloudTransferProgressDialog {...props} />
  }

  return null
}

export default NextcloudProgressDialog
