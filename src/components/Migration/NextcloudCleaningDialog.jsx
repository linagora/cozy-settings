import React from 'react'
import { useI18n } from 'twake-i18n'

import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Icon from 'cozy-ui/transpiled/react/Icon'
import LinearProgress from 'cozy-ui/transpiled/react/LinearProgress'
import Typography from 'cozy-ui/transpiled/react/Typography'

import nextcloudLogo from '@/assets/icons/nextcloud-logo.svg'

const NextcloudCleaningDialog = ({ onClose }) => {
  const { t } = useI18n()

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      title={
        <span className="u-flex u-flex-items-center u-column-gap-half">
          <Icon icon={nextcloudLogo} size={24} className="u-mr-1" />
          {t('MigrationView.cleaningNextcloudDialog.title')}
        </span>
      }
      content={
        <>
          <Typography variant="body2" className="u-mb-1">
            {t('MigrationView.cleaningNextcloudDialog.description')}
          </Typography>
          <LinearProgress />
        </>
      }
    />
  )
}

export { NextcloudCleaningDialog }
