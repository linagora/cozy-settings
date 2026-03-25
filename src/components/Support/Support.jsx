import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Checkbox from 'cozy-ui/transpiled/react/Checkbox'
import Icon from 'cozy-ui/transpiled/react/Icon'
import PaperplaneIcon from 'cozy-ui/transpiled/react/Icons/Paperplane'
import InputLabel from 'cozy-ui/transpiled/react/InputLabel'
import TextField from 'cozy-ui/transpiled/react/TextField'

import styles from './support.styl'

import { sendMessageToSupport } from '@/actions/email'
import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'

export const Support = ({
  emailStatus: { isSending, isSent, error },
  sendMessageToSupport
}) => {
  const { t } = useI18n()
  const client = useClient()

  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    // reset message if successfully sent
    if (isSent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage('')
      setConsent(false)
    }
  }, [isSent])

  const sendMessage = () => {
    sendMessageToSupport(
      client,
      `${message}\n\n${
        consent ? t('support.response_email.allowConsent') : ''
      }`,
      t
    )
  }

  const handleConsentChange = () => {
    setConsent(!consent)
  }

  return (
    <Page narrow>
      <PageTitle>{t(`support.title`)}</PageTitle>
      <InputLabel htmlFor="settings-support-form-textarea">
        {t('support.fields.message.title')}
      </InputLabel>
      <TextField
        id="settings-support-form-textarea"
        className="u-mt-half"
        value={message}
        placeholder={t('support.fields.message.placeholder')}
        onChange={e => {
          setMessage(e.target.value)
        }}
        multiline
        fullWidth
        rows={4}
        variant="outlined"
      />
      <Checkbox
        className="u-mt-1"
        checked={consent}
        label={t('support.fields.consent.label')}
        onChange={handleConsentChange}
      />
      <div className="u-fz-small">
        {((!isSent && !isSending && !error) ||
          (isSent && !isSending && !error && message)) && (
          <p className={styles['support-form-detail']}>
            {t('support.emailDetail')}
          </p>
        )}
        {!isSending && isSent && !message && (
          <p className={styles['support-form-success']}>
            {t('support.success')}
          </p>
        )}
        {!isSending && error && (
          <p className={styles['support-form-error']}>
            {error.i18n && `${t(error.i18n)}`}
            {error.message && `${t('support.error')} : ${error.message}`}
            {!error.i18n && !error.message && t('support.error')}
          </p>
        )}
        {isSending && (
          <p className={styles['support-form-detail']}>
            {t('support.sending')}
          </p>
        )}
      </div>
      <Buttons
        className="u-m-0"
        onClick={() => sendMessage()}
        disabled={!message}
        busy={isSending}
        startIcon={<Icon icon={PaperplaneIcon} />}
        label={t('support.button')}
      />
    </Page>
  )
}

const mapStateToProps = state => ({
  emailStatus: state.emailStatus
})

const mapDispatchToProps = dispatch => ({
  sendMessageToSupport: (client, message, t) => {
    dispatch(sendMessageToSupport(client, message, t))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Support)
