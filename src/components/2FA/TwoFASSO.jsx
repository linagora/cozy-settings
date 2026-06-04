import React from 'react'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import Typography from 'cozy-ui/transpiled/react/Typography'

const TwoFASSO = ({ url }) => {
  const { t } = useI18n()

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        {t('ProfileView.twofa.auth.title')}
      </Typography>
      <Button
        component="a"
        variant="secondary"
        label={t('ProfileView.twofa.sso.cta')}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>
  )
}

export default TwoFASSO
