import React, { useEffect, useState } from 'react'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import Checkbox from 'cozy-ui/transpiled/react/Checkbox'
import Icon from 'cozy-ui/transpiled/react/Icon'
import PaperplaneIcon from 'cozy-ui/transpiled/react/Icons/Paperplane'
import Textarea from 'cozy-ui/transpiled/react/Textarea'

const Support = ({
  iconSrc,
  emailStatus: { isSending, isSent, error },
  sendMessageToSupport
}) => {
  const { t } = useI18n()

  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    // reset message if successfully sent
    if (isSent) {
      setMessage('')
      setConsent(false)
    }
  }, [isSent])

  const sendMessage = () => {
    sendMessageToSupport(
      `${message}\n\n${consent ? t('support.response_email.allowConsent') : ''}`
    )
  }

  const handleConsentChange = () => {
    setConsent(!consent)
  }

  return (
    <div className="set-support-form">
      <div className="set-support-form-header">
        <img className="set-support-form-header-icon" src={iconSrc} />
        <p className="set-support-form-header-title">{t(`support.title`)}</p>
      </div>
      <div className="set-support-form-content coz-form">
        <label className="coz-form-label">
          {t('support.fields.message.title')}
          <Textarea
            className="set-services-support-form-textarea"
            value={message}
            placeholder={t('support.fields.message.placeholder')}
            onChange={e => {
              setMessage(e.target.value)
            }}
          />
        </label>
        <Checkbox
          checked={consent}
          className="u-mt-1"
          label={t('support.fields.consent.label')}
          onChange={handleConsentChange}
        />
        {((!isSent && !isSending && !error) ||
          (isSent && !isSending && !error && message)) && (
          <p className="set-support-form-detail">{t('support.emailDetail')}</p>
        )}
        {!isSending && isSent && !message && (
          <p className="set-support-form-success">{t('support.success')}</p>
        )}
        {!isSending && error && (
          <p className="set-support-form-error">
            {error.i18n && `${t(error.i18n)}`}
            {error.message && `${t('support.error')} : ${error.message}`}
            {!error.i18n && !error.message && t('support.error')}
          </p>
        )}
        {isSending && (
          <p className="set-support-form-detail">{t('support.sending')}</p>
        )}
        <Button
          onClick={() => sendMessage()}
          disabled={!message}
          busy={isSending}
          startIcon={<Icon icon={PaperplaneIcon} />}
          label={t('support.button')}
        />
      </div>
    </div>
  )
}

export default Support
