import React from 'react'
import { useI18n } from 'twake-i18n'

import { useWebviewIntent } from 'cozy-intent'
import Button from 'cozy-ui/transpiled/react/Buttons'
import { Dialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Typography from 'cozy-ui/transpiled/react/Typography'

interface BiometryDeniedDialogProps {
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const BiometryDeniedDialog = ({
  setModalVisible
}: BiometryDeniedDialogProps): JSX.Element => {
  const onCancel = (): void => setModalVisible(false)
  const { t } = useI18n()
  const webviewIntent = useWebviewIntent()

  const tryOpenSettings = (): void => {
    if (!webviewIntent) return

    void webviewIntent.call('openAppOSSettings').then(() => {
      return setModalVisible(false)
    })
  }

  return (
    <Dialog
      open
      onClose={onCancel}
      size="small"
      title={t('BiometryDeniedDialog.title')}
      content={
        <>
          <Typography className="u-mb-1" variant="body1">
            {t('BiometryDeniedDialog.content')}
          </Typography>
        </>
      }
      actions={
        <>
          <Button
            onClick={onCancel}
            variant="secondary"
            label={t('BiometryDeniedDialog.cancel')}
          />
          <Button
            onClick={(): void => tryOpenSettings()}
            label={t('BiometryDeniedDialog.open_settings')}
          />
        </>
      }
    />
  )
}
