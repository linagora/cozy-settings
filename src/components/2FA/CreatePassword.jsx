import React, { useMemo, useState } from 'react'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Buttons'
import FormTextHelper from 'cozy-ui/transpiled/react/FormHelperText'
import PasswordInput from 'cozy-ui/transpiled/react/Labs/PasswordInput'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'

import CreatePasswordHint from '@/components/2FA/CreatePasswordHint'
import { forceSetPassphrase } from '@/components/2FA/helpers'
import passwordHelper from '@/lib/passwordHelper'

const initialData = {
  passphrase: '',
  passphraseRepeat: '',
  hint: ''
}

const CreatePassword = ({ onSuccess }) => {
  const { t } = useI18n()
  const [formData, setFormData] = useState(initialData)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState()

  const client = useClient()

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setServerError(false)
    setSubmitting(true)
    try {
      await forceSetPassphrase(client, formData.passphrase, formData.hint)
      onSuccess()
    } catch (e) {
      setServerError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const strength = passwordHelper.getStrength(formData.passphrase)

  const passphraseTouched =
    formData.passphrase !== '' && formData.passphraseRepeat !== ''

  const passphraseMatch = formData.passphrase === formData.passphraseRepeat
  const hintSameAsPassphrase =
    passphraseTouched && formData.passphrase === formData.hint

  const canSubmit =
    passphraseTouched &&
    passphraseMatch &&
    strength.label !== 'weak' &&
    !hintSameAsPassphrase

  const helperText = useMemo(() => {
    if (serverError) {
      return 'PassphraseView.server_error'
    }
    if (passphraseTouched && !passphraseMatch) {
      return 'PassphraseView.new_passphrase.dont_match'
    }
    return 'ProfileView.twofa.password_creation.help'
  }, [passphraseMatch, passphraseTouched, serverError])

  const passphraseError = (passphraseTouched && !passphraseMatch) || serverError

  return (
    <form onSubmit={handleSubmit} className="u-h-100 u-flex u-flex-column">
      <Typography
        variant="h5"
        component="label"
        htmlFor="current-passphrase"
        className="u-ta-center u-mt-auto"
      >
        {t('ProfileView.twofa.password_creation.title')}
      </Typography>
      <Stack spacing="m" className="u-mv-1-half">
        <PasswordInput
          name="passphrase"
          autoComplete="new-password"
          id="new-passphrase"
          placeholder={t('PassphraseView.new_passphrase.placeholder')}
          value={formData.passphrase}
          onChange={handleInputChange}
          showStrength
          error={passphraseError}
        />
        <PasswordInput
          name="passphraseRepeat"
          autoComplete="new-password"
          id="new-passphrase-repeat"
          placeholder={t(
            'PassphraseView.new_passphrase.confirmation_placeholder'
          )}
          value={formData.passphraseRepeat}
          onChange={handleInputChange}
          error={passphraseError}
        />
        <FormTextHelper error={passphraseError} className="u-mh-1 u-mt-half">
          {t(helperText)}
        </FormTextHelper>
        <CreatePasswordHint
          value={formData.hint}
          onChange={handleInputChange}
          sameAsPassword={hintSameAsPassphrase}
        />
      </Stack>
      <Button
        type="submit"
        className="u-mt-auto"
        label={t('ProfileView.twofa.modal.button.next')}
        disabled={!canSubmit}
        busy={submitting}
        fullWidth
      />
    </form>
  )
}

export default CreatePassword
