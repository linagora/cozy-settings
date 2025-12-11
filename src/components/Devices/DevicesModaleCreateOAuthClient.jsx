import React, { useCallback, useState } from 'react'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import { FixedDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import CheckIcon from 'cozy-ui/transpiled/react/Icons/Check'
import CopyIcon from 'cozy-ui/transpiled/react/Icons/Copy'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import logger from '@/lib/logger'

const DevicesModaleCreateOAuthClient = ({ onClose }) => {
  const { t } = useI18n()
  const client = useClient()

  const [clientName, setClientName] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const [clientKind, setClientKind] = useState('web')
  const [softwareId, setSoftwareId] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const handleSubmit = useCallback(async () => {
    if (!clientName || !redirectUri) {
      setErrorMessage(t('createOAuthClient.validation_error'))
      return
    }

    try {
      setErrorMessage(null)
      setCopiedField(null)
      setLoading(true)

      const payload = {
        client_name: clientName,
        redirect_uris: [redirectUri],
        client_kind: clientKind
      }

      if (softwareId) {
        payload.software_id = softwareId
      }

      const result = await client.stackClient.fetchJSON(
        'POST',
        '/auth/registerFromWebApp',
        payload
      )

      setCreated({
        clientId: result.client_id,
        clientSecret: result.client_secret || null
      })
    } catch (error) {
      logger.warn(error)
      setErrorMessage(t('createOAuthClient.error'))
    } finally {
      setLoading(false)
    }
  }, [client, clientName, clientKind, redirectUri, softwareId, t])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleCopy = useCallback(async (fieldKey, value) => {
    if (!value) return

    let copied = false

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(value)
        copied = true
      }
    } catch (error) {
      logger.warn(error)
    }

    if (!copied) {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      } catch (error) {
        logger.warn(error)
      }
    }

    setCopiedField(fieldKey)
    setTimeout(() => {
      setCopiedField(current => (current === fieldKey ? null : current))
    }, 2500)
  }, [])

  const actions = created
    ? [
        <Button
          key="close"
          label={t('createOAuthClient.close')}
          onClick={handleClose}
        />
      ]
    : [
        <Button
          key="cancel"
          label={t('createOAuthClient.cancel')}
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
        />,
        <Button
          key="create"
          label={t('createOAuthClient.validate')}
          onClick={handleSubmit}
          disabled={loading}
        />
      ]

  const content = loading ? (
    <div className="u-ta-center u-pv-2">
      <Spinner size="xxlarge" />
    </div>
  ) : created ? (
    <>
      <Typography className="u-mb-1">
        {t('createOAuthClient.success_description')}
      </Typography>

      <div className="u-flex u-flex-items-center u-mb-1">
        <div className="u-flex-grow-1">
          <TextField
            label={t('createOAuthClient.client_id')}
            value={created.clientId}
            readOnly
            fullWidth
          />
        </div>
        <IconButton
          className={
            'u-ml-half u-mt-1' +
            (copiedField === 'clientId' ? ' u-bg-successBackground' : '')
          }
          size="small"
          onClick={() => handleCopy('clientId', created.clientId)}
        >
          <Icon icon={copiedField === 'clientId' ? CheckIcon : CopyIcon} />
        </IconButton>
      </div>

      {created.clientSecret && (
        <div className="u-flex u-flex-items-center">
          <div className="u-flex-grow-1">
            <TextField
              className="u-mt-1"
              label={t('createOAuthClient.client_secret')}
              value={created.clientSecret}
              readOnly
              fullWidth
            />
          </div>
          <IconButton
            className={
              'u-ml-half u-mt-1' +
              (copiedField === 'clientSecret' ? ' u-bg-successBackground' : '')
            }
            size="small"
            onClick={() => handleCopy('clientSecret', created.clientSecret)}
          >
            <Icon
              icon={copiedField === 'clientSecret' ? CheckIcon : CopyIcon}
            />
          </IconButton>
        </div>
      )}
    </>
  ) : (
    <>
      {errorMessage && (
        <div className="u-bg-errorBackground u-p-1 u-mb-1">
          <Typography variant="body2">{errorMessage}</Typography>
        </div>
      )}
      <Typography className="u-mb-1">
        {t('createOAuthClient.description')}
      </Typography>
      <TextField
        label={t('createOAuthClient.client_name')}
        value={clientName}
        onChange={event => setClientName(event.target.value)}
        fullWidth
      />
      <TextField
        className="u-mt-1"
        label={t('createOAuthClient.redirect_uri')}
        value={redirectUri}
        onChange={event => setRedirectUri(event.target.value)}
        fullWidth
      />
      <TextField
        className="u-mt-1"
        label={t('createOAuthClient.client_kind')}
        value={clientKind}
        onChange={event => setClientKind(event.target.value)}
        fullWidth
      />
      <TextField
        className="u-mt-1"
        label={t('createOAuthClient.software_id')}
        value={softwareId}
        onChange={event => setSoftwareId(event.target.value)}
        fullWidth
      />
    </>
  )

  return (
    <FixedDialog
      open
      title={t('createOAuthClient.title')}
      actions={actions}
      onClose={handleClose}
      content={content}
    />
  )
}

export default DevicesModaleCreateOAuthClient
