import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import Alert from 'cozy-ui/transpiled/react/Alert'
import Avatar from 'cozy-ui/transpiled/react/Avatar'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import { IllustrationDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Icon from 'cozy-ui/transpiled/react/Icon'
import WarningIcon from 'cozy-ui/transpiled/react/Icons/Warning'
import InputLabel from 'cozy-ui/transpiled/react/InputLabel'
import PasswordField from 'cozy-ui/transpiled/react/PasswordField'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

import nextcloudLogo from '@/assets/icons/nextcloud-logo.svg'

const NextcloudConnectDialog = ({ onClose }) => {
  const { t } = useI18n()
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)

    try {
      // TODO: Implement actual connection logic
      // For now, simulate an error to show the UI
      await new Promise(resolve => setTimeout(resolve, 1000))
      setError(t('MigrationView.nextcloud.connect.error'))
    } catch {
      setError(t('MigrationView.nextcloud.connect.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = !!url.trim() && !!username.trim() && !!password.trim()

  return (
    <IllustrationDialog
      open
      onClose={onClose}
      title={
        <div className="u-flex u-flex-column u-flex-items-center">
          <Avatar
            size={80}
            style={{ backgroundColor: 'var(--primaryColorLight)' }}
          >
            <Icon icon={nextcloudLogo} size={48} />
          </Avatar>
          <Typography variant="h3" className="u-mt-1">
            {t('MigrationView.nextcloud.connect.title')}
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            className="u-mt-half u-fz-small"
          >
            {t('MigrationView.nextcloud.connect.subtitle')}
          </Typography>
        </div>
      }
      content={
        <div className="u-flex u-flex-column">
          <div className="u-mb-1">
            <InputLabel htmlFor="nextcloud-url" className="u-mb-half">
              {t('MigrationView.nextcloud.connect.url.label')}
            </InputLabel>
            <TextField
              id="nextcloud-url"
              placeholder={t('MigrationView.nextcloud.connect.url.placeholder')}
              value={url}
              onChange={e => {
                setUrl(e.target.value)
                setError(null)
              }}
              fullWidth
              variant="outlined"
            />
          </div>

          <div className="u-mb-1">
            <InputLabel htmlFor="nextcloud-username" className="u-mb-half">
              {t('MigrationView.nextcloud.connect.username.label')}
            </InputLabel>
            <TextField
              id="nextcloud-username"
              placeholder={t(
                'MigrationView.nextcloud.connect.username.placeholder'
              )}
              value={username}
              onChange={e => {
                setUsername(e.target.value)
                setError(null)
              }}
              fullWidth
              variant="outlined"
            />
          </div>

          <div className="u-mb-1">
            <InputLabel htmlFor="nextcloud-password" className="u-mb-half">
              {t('MigrationView.nextcloud.connect.password.label')}
            </InputLabel>
            <PasswordField
              id="nextcloud-password"
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                setError(null)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && canSubmit && !isLoading) {
                  handleSubmit()
                }
              }}
              fullWidth
              variant="outlined"
            />
          </div>

          {error && (
            <Alert
              severity="error"
              icon={<Icon icon={WarningIcon} size={20} />}
              className="u-mt-half"
            >
              {error}
            </Alert>
          )}
        </div>
      }
      actions={
        <>
          <Buttons
            variant="secondary"
            onClick={onClose}
            label={t('MigrationView.nextcloud.connect.cancel')}
          />
          <Buttons
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            busy={isLoading}
            label={t('MigrationView.nextcloud.connect.submit')}
          />
        </>
      }
    />
  )
}

export default NextcloudConnectDialog
