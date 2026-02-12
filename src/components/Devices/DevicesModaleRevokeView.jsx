import React, { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Typography from 'cozy-ui/transpiled/react/Typography'
import Alerter from 'cozy-ui/transpiled/react/deprecated/Alerter'
import { Media, Bd, Img } from 'cozy-ui/transpiled/react/deprecated/Media'

import IconCircle2Arrows from '../../assets/icons/IconCircle2Arrows'

import logger from '@/lib/logger'

const DevicesModaleRevokeView = ({ device, cancelAction, onDeviceRevoked }) => {
  const { t } = useI18n()
  const client = useClient()
  const revokeDevice = useCallback(async () => {
    try {
      await client.destroy(device)
    } catch (err) {
      logger.warn(err)
      return Alerter.error(t('revokeDevice.error'))
    }

    onDeviceRevoked()
  }, [client, device, onDeviceRevoked, t])

  return (
    <ConfirmDialog
      open
      title={t('revokeDevice.title')}
      actions={
        <>
          <Button
            label={t('revokeDevice.validate')}
            color="error"
            onClick={revokeDevice}
          />
          <Button
            label={t('revokeDevice.cancel')}
            variant="secondary"
            onClick={cancelAction}
          />
        </>
      }
      onClose={cancelAction}
      content={
        <>
          <Typography>
            {t('revokeDevice.description', { name: device.client_name })}
          </Typography>

          <Media>
            <Img className="u-mr-half">
              <IconCircle2Arrows />
            </Img>
            <Bd>
              <ReactMarkdown source={t('revokeDevice.subText')} />
            </Bd>
          </Media>
        </>
      }
    />
  )
}

export { DevicesModaleRevokeView }
