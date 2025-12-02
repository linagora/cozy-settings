import React, { useState } from 'react'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Button'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import {
  createNextcloudAccount,
  findNextcloudAccounts
} from './Providers/nextcloud/accountService'

const NextcloudAccountDialog = ({ open, onClose, onCreated }) => {
  const client = useClient()
  const { t } = useI18n()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('https://mynextcloud.example.com')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const resetForm = () => {
    setLogin('')
    setPassword('')
    setUrl('https://mynextcloud.example.com')
    setError(null)
    setLoading(false)
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (loading) return

    setError(null)
    setLoading(true)

    try {
      const acc = await createNextcloudAccount(client, {
        login,
        password,
        url
      })

      if (acc?.error || acc?.errors) {
        throw new Error(
          acc?.error || acc?.errors?.[0]?.detail || 'Account creation failed'
        )
      }

      const all = await findNextcloudAccounts(client)
      const newId = acc?._id || (all?.length ? all[all.length - 1]._id : null)

      if (!newId) {
        throw new Error('Account created but no ID returned.')
      }

      onCreated(newId)

      resetForm()
      onClose()
    } catch (e) {
      setLoading(false)
      setError(e?.message || 'Failed to create account.')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={handleCancel}
      title={t('ImportsRun.nc_dialog.title', { _: 'Nextcloud account' })}
      content={
        <>
          <label style={{ display: 'grid', gap: 4 }}>
            <Typography variant="caption">Identifiant</Typography>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              disabled={loading}
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4, marginTop: 8 }}>
            <Typography variant="caption">Mot de passe</Typography>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4, marginTop: 8 }}>
            <Typography variant="caption">
              Url de l&apos;instance Nextcloud
            </Typography>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={loading}
              placeholder="https://mynextcloud.example.com"
              style={{ padding: 8 }}
            />
          </label>

          {error && (
            <Typography
              variant="caption"
              color="error"
              style={{ marginTop: 8, display: 'block' }}
            >
              {String(error)}
            </Typography>
          )}
        </>
      }
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            size="small"
            disabled={loading}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="small"
            disabled={loading || !login || !password || !url.trim()}
            busy={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Connecting…' : 'Save account'}
          </Button>
        </>
      }
    />
  )
}

export default NextcloudAccountDialog
