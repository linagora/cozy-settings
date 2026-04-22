import React from 'react'
import { useI18n } from 'twake-i18n'

import Alert from 'cozy-ui/transpiled/react/Alert'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import LinearProgress from 'cozy-ui/transpiled/react/LinearProgress'
import Typography from 'cozy-ui/transpiled/react/Typography'

const formatRemainingTime = (seconds, t) => {
  if (!seconds || seconds <= 0) return null
  if (seconds < 60)
    return t('MigrationView.nextcloud.progress.timeSeconds', {
      count: Math.round(seconds)
    })
  const minutes = Math.round(seconds / 60)
  return t('MigrationView.nextcloud.progress.timeMinutes', { count: minutes })
}

const MigrationProgressInfo = ({
  percent,
  remainingTimeSeconds,
  cancelSuccess,
  cancelError,
  onCancel,
  isCanceling
}) => {
  const { t } = useI18n()

  return (
    <>
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
          const formattedTime = formatRemainingTime(remainingTimeSeconds, t)
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
  )
}

export default MigrationProgressInfo
