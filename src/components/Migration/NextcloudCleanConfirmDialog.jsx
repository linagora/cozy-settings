import React from 'react'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Icon from 'cozy-ui/transpiled/react/Icon'
import DeleteIcon from 'cozy-ui/transpiled/react/Icons/Trash'
import Typography from 'cozy-ui/transpiled/react/Typography'

import nextcloudLogo from '@/assets/icons/nextcloud-logo.svg'

const NextcloudCleanConfirmDialog = ({ isCleaning, onCancel, onConfirm }) => {
  const { t } = useI18n()

  return (
    <ConfirmDialog
      open
      title={
        <span className="u-flex u-flex-items-center u-column-gap-half">
          <Icon icon={nextcloudLogo} size={24} className="u-mr-1" />
          {t('MigrationView.cleanNextcloudDialog.title')}
        </span>
      }
      content={
        <>
          <Typography variant="body2" className="u-mb-1">
            {t('MigrationView.cleanNextcloudDialog.description')}
          </Typography>
          <Typography variant="body2" className="u-mb-half">
            {t('MigrationView.cleanNextcloudDialog.disclaimer1')}
          </Typography>
          <Typography variant="body2">
            {t('MigrationView.cleanNextcloudDialog.disclaimer2')}
          </Typography>
        </>
      }
      actions={
        <>
          <Button
            label={t('MigrationView.cleanNextcloudDialog.cancel')}
            variant="secondary"
            className="u-fz-small"
            onClick={onCancel}
          />
          <Button
            label={t('MigrationView.cleanNextcloudDialog.confirm')}
            color="error"
            className="u-fz-small"
            startIcon={<Icon icon={DeleteIcon} size={14} />}
            onClick={onConfirm}
            disabled={isCleaning}
          />
        </>
      }
      onClose={onCancel}
    />
  )
}

export { NextcloudCleanConfirmDialog }
