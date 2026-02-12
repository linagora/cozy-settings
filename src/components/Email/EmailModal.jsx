import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import { useClient, useQuery } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import TextField from 'cozy-ui/transpiled/react/TextField'

import emailHelper from '@/lib/emailHelper'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const EmailModal = ({ onClose, onSuccess, passwordHash, skipConfirmation }) => {
  const client = useClient()
  const { t } = useI18n()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const handleSubmit = async e => {
    e.preventDefault()

    if (error !== null) return

    if (!emailHelper.isValidEmail(email)) {
      setError('email_format')
      return
    }

    setStatus('loading')
    try {
      if (skipConfirmation) {
        await client.save({
          _rev: instance.meta.rev,
          ...instance,
          attributes: {
            ...instance.attributes,
            email: email
          }
        })
      } else {
        await client.stackClient.fetchJSON('POST', '/settings/email', {
          email,
          passphrase: passwordHash
        })
      }
      setStatus('success')
      onSuccess()
    } catch (e) {
      setStatus('error')
      setError('server')
    }
  }

  const isLoading = status === 'isLoading'

  const handleChange = e => {
    const value = e.currentTarget.value
    setEmail(value)
    if (value === instance.email) {
      setError('same_email')
    } else {
      setError(null)
    }
  }

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      title={t('EmailModal.title')}
      content={
        <form onSubmit={handleSubmit}>
          <TextField
            value={email}
            onChange={handleChange}
            disabled={isLoading}
            variant="outlined"
            required
            fullWidth
            error={Boolean(error)}
            helperText={error && t(`EmailModal.errors.${error}`)}
            inputProps={{ type: 'email', autoFocus: true }}
          />
        </form>
      }
      actions={
        <>
          <Button
            disabled={isLoading}
            label={t('EmailModal.cancel')}
            variant="secondary"
            onClick={onClose}
            fullWidth
          />
          <Button
            busy={isLoading}
            disabled={isLoading}
            label={t('EmailModal.submit')}
            onClick={handleSubmit}
            fullWidth
          />
        </>
      }
    />
  )
}

export default EmailModal
