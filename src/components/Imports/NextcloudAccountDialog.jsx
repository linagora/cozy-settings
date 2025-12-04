import React, { useState } from 'react'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Button'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import { createNextcloudAccount } from './Providers/nextcloud/accountService'

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

      const newId = acc?._id
      if (!newId) {
        throw new Error(t('ImportsRun.nc_dialog.error.no_id'))
      }

      onCreated(newId)

      resetForm()
      onClose()
    } catch (e) {
      setLoading(false)
      setError(e?.message || t('ImportsRun.nc_dialog.error.create_failed'))
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={handleCancel}
      title={t('ImportsRun.nc_dialog.title')}
      content={
        <>
          <label style={{ display: 'grid', gap: 4 }}>
            <Typography variant="caption">
              {t('ImportsRun.nc_dialog.login_label')}
            </Typography>
            <input
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              disabled={loading}
              style={{ padding: 8 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4, marginTop: 8 }}>
            <Typography variant="caption">
              {t('ImportsRun.nc_dialog.password_label')}
            </Typography>
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
              {t('ImportsRun.nc_dialog.url_label')}
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
            {t('ImportsRun.nc_dialog.cancel')}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="small"
            disabled={loading || !login || !password || !url.trim()}
            busy={loading}
            onClick={handleSubmit}
          >
            {loading
              ? t('ImportsRun.nc_dialog.connecting')
              : t('ImportsRun.nc_dialog.save')}
          </Button>
        </>
      }
    />
  )
}

export default NextcloudAccountDialog
