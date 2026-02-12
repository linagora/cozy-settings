import React, { useMemo, useState } from 'react'
import { useI18n } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import PasswordField from 'cozy-ui/transpiled/react/PasswordField'
import Typography from 'cozy-ui/transpiled/react/Typography'

import useCheckPassword from '@/hooks/useCheckPassword'

/**
 * Password confirmation for account deletion requests
 */
const ConfirmModal = ({ onClose, onSuccess }) => {
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [isRequired, setRequired] = useState(false)
  const { checkPassword, isLoading, error } = useCheckPassword()

  const handleChange = ev => {
    setPassword(ev.target.value)
  }

  const handleSubmit = () => {
    const passwordRequired = password.length > 0
    setRequired(!passwordRequired)
    if (passwordRequired) {
      checkPassword(password, onSuccess)
    }
  }

  const helperText = useMemo(() => {
    if (isRequired) {
      return t('DeleteAccount.modal.confirm.password.required')
    }

    if (error) {
      return t(`DeleteAccount.modal.confirm.password.errors.${error}`)
    }
  }, [error, isRequired, t])

  return (
    <ConfirmDialog
      open
      title={t('DeleteAccount.modal.confirm.title')}
      content={
        <>
          <ul className="u-mt-0">
            <li>{t('DeleteAccount.modal.confirm.description.line.1')}</li>
            <li>{t('DeleteAccount.modal.confirm.description.line.2')}</li>
            <li>{t('DeleteAccount.modal.confirm.description.line.3')}</li>
          </ul>
          <Typography variant="body1">
            {t('DeleteAccount.modal.confirm.description.line.4')}
          </Typography>
          <PasswordField
            required
            autoFocus
            fullWidth
            className="u-mt-1 u-mb-0"
            value={password}
            error={Boolean(error) || isRequired}
            onChange={handleChange}
            disabled={isLoading}
            helperText={helperText}
          />
        </>
      }
      actions={
        <>
          <Button
            label={t('DeleteAccount.modal.confirm.button.cancel.label')}
            variant="secondary"
            onClick={onClose}
          />
          <Button
            label={t('DeleteAccount.modal.confirm.button.submit.label')}
            color="error"
            busy={isLoading}
            disabled={isLoading}
            onClick={handleSubmit}
          />
        </>
      }
      onClose={onClose}
    />
  )
}

export default ConfirmModal
