import React from 'react'
import { useI18n } from 'twake-i18n'

import { useInstanceInfo } from 'cozy-client'
import flag from 'cozy-flags'
import Button from 'cozy-ui/transpiled/react/Buttons'
import FormControlLabel from 'cozy-ui/transpiled/react/FormControlLabel'
import FormGroup from 'cozy-ui/transpiled/react/FormGroup'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Switch from 'cozy-ui/transpiled/react/Switch'
import Typography from 'cozy-ui/transpiled/react/Typography'

import { AUTH_MODE } from '@/actions/twoFactor'

const TwoFA = () => {
  const { t } = useI18n()
  const {
    instance: { data }
  } = useInstanceInfo()

  const signUpUrl = flag('signup.url')
  const isTwoFactorEnabled = data.auth_mode === AUTH_MODE.TWO_FA_OIDC
  const recoveryEmail = data.recovery_email

  return (
    <>
      <Stack spacing="m">
        <Typography variant="h5" gutterBottom>
          {t('ProfileView.twofa.external-email.title')}
        </Typography>
        <Typography gutterBottom>
          {t('ProfileView.twofa.external-email.label')}
        </Typography>
        {!!recoveryEmail && (
          <Typography style={{ fontWeight: 700 }} gutterBottom>
            {recoveryEmail}
          </Typography>
        )}
        <Button
          component="a"
          variant="secondary"
          label={
            recoveryEmail
              ? t('ProfileView.twofa.external-email.cta.change')
              : t('ProfileView.twofa.external-email.cta.add')
          }
          href={`${signUpUrl}/change-recovery-email`}
          target="_blank"
        />
      </Stack>
      <div>
        <Typography variant="h5" gutterBottom>
          {t('ProfileView.twofa.auth.title')}
        </Typography>
        <FormGroup row>
          <FormControlLabel
            className="u-m-0"
            label={t('ProfileView.twofa.auth.label')}
            labelPlacement="start"
            control={<Switch color="primary" checked={isTwoFactorEnabled} />}
            onClick={ev => {
              ev.preventDefault()
              window.open(`${signUpUrl}/configure-2fa`)
            }}
          />
        </FormGroup>
      </div>
    </>
  )
}

export default TwoFA
