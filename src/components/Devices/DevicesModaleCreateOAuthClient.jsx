import React, { useCallback, useState } from 'react'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import { FixedDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import DevicesCreateOAuthClientForm from '@/components/Devices/DevicesCreateOAuthClientForm'
import DevicesCreatedOAuthClientCredentials from '@/components/Devices/DevicesCreatedOAuthClientCredentials'
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
    <DevicesCreatedOAuthClientCredentials
      t={t}
      created={created}
      copiedField={copiedField}
      onCopy={handleCopy}
    />
  ) : (
    <DevicesCreateOAuthClientForm
      t={t}
      errorMessage={errorMessage}
      clientName={clientName}
      onClientNameChange={setClientName}
      redirectUri={redirectUri}
      onRedirectUriChange={setRedirectUri}
      clientKind={clientKind}
      onClientKindChange={setClientKind}
      softwareId={softwareId}
      onSoftwareIdChange={setSoftwareId}
    />
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
