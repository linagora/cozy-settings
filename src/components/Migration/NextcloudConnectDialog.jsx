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
import NextcloudProgressDialog from '@/components/Migration/NextcloudProgressDialog'
import useMigration, {
  NEXTCLOUD_IMPORTED_FILES_DIR_NAME
} from '@/components/Migration/useMigration'
import useNextcloudKonnector from '@/components/Migration/useNextcloudKonnector'

const getKonnectorErrorMessage = ({ konnectorErrorMessage, t }) => {
  if (konnectorErrorMessage === 'LOGIN_FAILED') {
    return t('MigrationView.nextcloud.connect.errors.loginFailed')
  }

  if (konnectorErrorMessage === 'TIMEOUT') {
    return t('MigrationView.nextcloud.connect.errors.timeout')
  }

  return t('MigrationView.nextcloud.connect.error')
}

const NextcloudCredentialsDialogView = ({
  onCloseAll,
  url,
  username,
  password,
  onUrlChange,
  onUsernameChange,
  onPasswordChange,
  onPasswordKeyDown,
  onSubmit,
  canSubmit,
  isSubmitting,
  currentError,
  currentErrorMessage
}) => {
  const { t } = useI18n()

  return (
    <IllustrationDialog
      open
      onClose={onCloseAll}
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
              onChange={onUrlChange}
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
              onChange={onUsernameChange}
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
              onChange={onPasswordChange}
              onKeyDown={onPasswordKeyDown}
              fullWidth
              variant="outlined"
            />
          </div>

          {currentError && (
            <Alert
              severity="error"
              icon={<Icon icon={WarningIcon} size={20} />}
              className="u-mt-half"
            >
              {currentErrorMessage}
            </Alert>
          )}
        </div>
      }
      actions={
        <>
          <Buttons
            variant="secondary"
            onClick={onCloseAll}
            label={t('MigrationView.nextcloud.connect.cancel')}
          />
          <Buttons
            variant="primary"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            busy={isSubmitting}
            label={t('MigrationView.nextcloud.connect.submit')}
          />
        </>
      }
    />
  )
}

const NextcloudConnectModeDialog = ({ onCloseAll }) => {
  const { t } = useI18n()
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const {
    start: startNextcloudKonnector,
    isLoading: isKonnectorLoading,
    success: isKonnectorSuccess,
    error: konnectorError,
    errorMessage: konnectorErrorMessage,
    setError: setKonnectorError,
    setErrorMessage: setKonnectorErrorMessage
  } = useNextcloudKonnector()

  const handleUrlChange = event => {
    setUrl(event.target.value)
    setKonnectorError(null)
    setKonnectorErrorMessage(null)
  }

  const handleUsernameChange = event => {
    setUsername(event.target.value)
    setKonnectorError(null)
    setKonnectorErrorMessage(null)
  }

  const handlePasswordChange = event => {
    setPassword(event.target.value)
    setKonnectorError(null)
    setKonnectorErrorMessage(null)
  }

  const handleSubmit = async () => {
    await startNextcloudKonnector({
      url,
      username,
      password
    })
  }

  const canSubmit = !!url.trim() && !!username.trim() && !!password.trim()

  const handlePasswordKeyDown = event => {
    if (event.key === 'Enter' && canSubmit && !isKonnectorLoading) {
      handleSubmit()
    }
  }

  if (isKonnectorLoading || isKonnectorSuccess) {
    return (
      <NextcloudProgressDialog
        mode="connect"
        onCloseAll={onCloseAll}
        isDone={isKonnectorSuccess}
      />
    )
  }

  return (
    <NextcloudCredentialsDialogView
      onCloseAll={onCloseAll}
      url={url}
      username={username}
      password={password}
      onUrlChange={handleUrlChange}
      onUsernameChange={handleUsernameChange}
      onPasswordChange={handlePasswordChange}
      onPasswordKeyDown={handlePasswordKeyDown}
      onSubmit={handleSubmit}
      canSubmit={canSubmit}
      isSubmitting={isKonnectorLoading}
      currentError={konnectorError}
      currentErrorMessage={getKonnectorErrorMessage({
        konnectorErrorMessage,
        t
      })}
    />
  )
}

const NextcloudTransferModeDialog = ({ onCloseAll }) => {
  const { t } = useI18n()
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const {
    start,
    cancel,
    migrationId,
    startedAt,
    progress,
    isLoading,
    isCanceling,
    cancelSuccess,
    error,
    setError,
    status
  } = useMigration()

  const handleUrlChange = event => {
    setUrl(event.target.value)
    setError(null)
  }

  const handleUsernameChange = event => {
    setUsername(event.target.value)
    setError(null)
  }

  const handlePasswordChange = event => {
    setPassword(event.target.value)
    setError(null)
  }

  const handleSubmit = async () => {
    await start({
      nextcloud_url: url,
      nextcloud_login: username,
      nextcloud_app_password: password,
      target_dir: NEXTCLOUD_IMPORTED_FILES_DIR_NAME
    })
  }

  const canSubmit = !!url.trim() && !!username.trim() && !!password.trim()

  const handlePasswordKeyDown = event => {
    if (event.key === 'Enter' && canSubmit && !isLoading) {
      handleSubmit()
    }
  }

  if (migrationId) {
    return (
      <NextcloudProgressDialog
        mode="transfer"
        progress={progress}
        startedAt={startedAt}
        onCloseAll={onCloseAll}
        onCancel={cancel}
        isCanceling={isCanceling}
        cancelSuccess={cancelSuccess}
        cancelError={error}
        status={status}
      />
    )
  }

  return (
    <NextcloudCredentialsDialogView
      onCloseAll={onCloseAll}
      url={url}
      username={username}
      password={password}
      onUrlChange={handleUrlChange}
      onUsernameChange={handleUsernameChange}
      onPasswordChange={handlePasswordChange}
      onPasswordKeyDown={handlePasswordKeyDown}
      onSubmit={handleSubmit}
      canSubmit={canSubmit}
      isSubmitting={isLoading}
      currentError={error}
      currentErrorMessage={t('MigrationView.nextcloud.connect.error')}
    />
  )
}

const NextcloudConnectDialog = ({ mode, onCloseAll }) => {
  if (mode === 'connect') {
    return <NextcloudConnectModeDialog onCloseAll={onCloseAll} />
  }

  if (mode === 'transfer') {
    return <NextcloudTransferModeDialog onCloseAll={onCloseAll} />
  }

  return null
}

export default NextcloudConnectDialog
