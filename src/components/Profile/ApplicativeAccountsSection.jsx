import React from 'react'
import { useI18n } from 'twake-i18n'

import flag from 'cozy-flags'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'

const ApplicativeAccountsSection = () => {
  const { t } = useI18n()

  const accountsUrl = flag('settings.applicative-accounts.url')

  return (
    <Stack spacing="m">
      <Typography variant="h5" gutterBottom>
        {t('ProfileView.applicative_accounts.title')}
      </Typography>
      <Typography variant="body1">
        {t('ProfileView.applicative_accounts.label')}
      </Typography>
      <Buttons
        variant="secondary"
        size="medium"
        label={t('ProfileView.applicative_accounts.cta')}
        href={accountsUrl}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!accountsUrl}
      />
    </Stack>
  )
}

export { ApplicativeAccountsSection }
