import React from 'react'
import { useI18n } from 'twake-i18n'

import Typography from 'cozy-ui/transpiled/react/Typography'

import ReactMarkdownWrapper from '@/components/ReactMarkdownWrapper'

export const ActivationConfirmation = ({ error }) => {
  const { t } = useI18n()
  return (
    <>
      <ReactMarkdownWrapper
        source={t('ProfileView.twofa.modal.change', {
          link: 'https://support.cozy.io/article/114-doubleauthentification'
        })}
      />
      <div className="u-mt-1">
        <div className="u-flex u-flex-column u-mb-1">
          <Typography variant="h5">
            {t('ProfileView.twofa.modal.secu_title')}
          </Typography>
          <Typography variant="body1">
            {t('ProfileView.twofa.modal.secu_description')}
          </Typography>
        </div>
        <div className="u-flex u-flex-column u-mb-1">
          <Typography variant="h5">
            {t('ProfileView.twofa.modal.protect_title')}
          </Typography>
          <Typography variant="body1">
            {t('ProfileView.twofa.modal.protect_description')}
          </Typography>
        </div>
      </div>
      {error && (
        <Typography variant="body1" className="u-error">
          {t(error)}
        </Typography>
      )}
    </>
  )
}

export default ActivationConfirmation
