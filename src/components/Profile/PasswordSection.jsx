import React from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import flag from 'cozy-flags'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'

import { useHasPassword } from '@/hooks/useHasPassword'

const PasswordSection = () => {
  const { t } = useI18n()
  const { hasPassword } = useHasPassword()

  const signUpUrl = flag('signup.url')
  const isPasswordReadonly = flag('settings.password.readonly')

  if (signUpUrl) {
    return (
      <Stack spacing="m">
        <Typography variant="h5" gutterBottom>
          {t('ProfileView.password.title')}
        </Typography>
        <Typography variant="body1">
          {t('ProfileView.password.label')}
        </Typography>
        <Buttons
          variant="secondary"
          size="medium"
          label={t('ProfileView.password.cta')}
          href={`${signUpUrl}/change-password`}
          target="_blank"
          disabled={isPasswordReadonly}
        />
      </Stack>
    )
  }

  if (hasPassword) {
    return (
      <Stack spacing="m">
        <Typography variant="h5" gutterBottom>
          {t('ProfileView.password.title')}
        </Typography>
        <Typography variant="body1">
          {t('ProfileView.password.label')}
        </Typography>
        <Buttons
          variant="secondary"
          size="medium"
          label={t('ProfileView.password.cta')}
          component={Link}
          to="/profile/password"
          disabled={isPasswordReadonly}
        />
      </Stack>
    )
  }

  return null
}

export default PasswordSection
