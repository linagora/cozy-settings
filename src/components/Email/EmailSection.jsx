import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import { useClient, useQuery } from 'cozy-client'
import Alert from 'cozy-ui/transpiled/react/Alert'
import AlertTitle from 'cozy-ui/transpiled/react/AlertTitle'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Snackbar from 'cozy-ui/transpiled/react/Snackbar'
import Typography from 'cozy-ui/transpiled/react/Typography'

import { buildSettingsInstanceQuery } from '@/lib/queries'

const EmailSection = () => {
  const { t } = useI18n()
  const client = useClient()

  const [snackbar, setSnackbar] = useState(null)

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const onResend = async () => {
    try {
      await client.stackClient.fetchJSON('POST', '/settings/email/resend')
      setSnackbar({
        severity: 'success',
        message: t('EmailSection.snackbar.resend_success', {
          pendingEmail: instance.pending_email
        })
      })
    } catch (e) {
      setSnackbar({
        severity: 'error',
        message: t('EmailSection.snackbar.server_error')
      })
    }
  }

  const onCancel = async () => {
    try {
      await client.stackClient.fetchJSON('DELETE', '/settings/email')
    } catch (e) {
      setSnackbar({
        severity: 'error',
        message: t('EmailSection.snackbar.server_error')
      })
    }
  }

  const onSnackbarClose = () => {
    setSnackbar(null)
  }

  if (instance == null) {
    return null
  }

  return (
    <>
      <Typography variant="h5" className="u-mb-half">
        {t('EmailSection.title')}
      </Typography>
      <Typography variant="body1" className="u-mb-half">
        {t('EmailSection.subtitle')}
      </Typography>
      <Typography variant="body1" style={{ fontWeight: 700 }}>
        {instance.email}
      </Typography>
      {instance.pending_email ? (
        <Alert
          className="u-mt-half"
          severity="primary"
          block
          action={
            <>
              <Buttons
                variant="text"
                size="small"
                label={t('EmailSection.alert.resend')}
                onClick={onResend}
              />
              <Buttons
                variant="text"
                size="small"
                label={t('EmailSection.alert.cancel')}
                onClick={onCancel}
              />
            </>
          }
        >
          <AlertTitle>{t('EmailSection.alert.title')}</AlertTitle>
          {t('EmailSection.alert.content', {
            pendingEmail: instance.pending_email
          })}
        </Alert>
      ) : (
        <Buttons
          component={Link}
          to="/profile/email"
          label={t('EmailSection.action')}
          variant="secondary"
          className="u-mt-half u-mh-0"
        />
      )}
      {snackbar !== null && (
        <Snackbar open onClose={onSnackbarClose}>
          <Alert
            variant="filled"
            elevation={6}
            severity={snackbar?.severity}
            onClose={onSnackbarClose}
          >
            {snackbar?.message}
          </Alert>
        </Snackbar>
      )}
    </>
  )
}

export default EmailSection
