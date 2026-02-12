import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Icon from 'cozy-ui/transpiled/react/Icon'
import CheckIcon from 'cozy-ui/transpiled/react/Icons/Check'
import PasswordInput from 'cozy-ui/transpiled/react/Labs/PasswordInput'
import PasswordExample from 'cozy-ui/transpiled/react/PasswordExample'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { UnorderedList, ListItem } from 'cozy-ui/transpiled/react/UnorderedList'
import Input from 'cozy-ui/transpiled/react/legacy/Input'

import styles from '@/styles/passphrase.styl'

import PageTitle from '@/components/PageTitle'
import ReactMarkdownWrapper from '@/components/ReactMarkdownWrapper'
import { useCanAuthWith } from '@/hooks/useCanAuthWith'
import passwordHelper from '@/lib/passwordHelper'

const initialData = {
  currentPassphrase: '',
  newPassphrase: '',
  newPassphraseRepeat: '',
  hint: ''
}

const PassphraseForm = ({ errors, submitting, saved, onSubmit }) => {
  const { t } = useI18n()

  const [formData, setFormData] = useState(initialData)

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = e => {
    e.preventDefault()

    // eslint-disable-next-line promise/catch-or-return
    onSubmit(formData.currentPassphrase, formData.newPassphrase, formData.hint)
      // eslint-disable-next-line promise/always-return
      .then(() => {
        setFormData(initialData)
      })
  }

  const currentPassphraseError = errors && errors.currentPassphrase
  const globalError = errors && errors.global
  const twoFactorError = errors && errors.wrongTwoFactor
  const strength = passwordHelper.getStrength(formData.newPassphrase)

  const newPassphraseTouched =
    formData.newPassphrase !== '' && formData.newPassphraseRepeat !== ''

  const newPassphraseMatch =
    formData.newPassphrase === formData.newPassphraseRepeat
  const hintSameAsPassphrase =
    newPassphraseTouched && formData.newPassphrase === formData.hint

  const canSubmit =
    newPassphraseTouched &&
    newPassphraseMatch &&
    strength.label !== 'weak' &&
    !hintSameAsPassphrase

  const { canAuthWithPassword, canAuthWithOIDC } = useCanAuthWith()
  const shouldUseOIDCtitle = !canAuthWithPassword && canAuthWithOIDC

  return (
    <Stack spacing="xl" tag="form" onSubmit={handleSubmit}>
      <PageTitle>
        {shouldUseOIDCtitle
          ? t('PassphraseView.title_oidc')
          : t('PassphraseView.title')}
      </PageTitle>
      <Stack spacing="m">
        <Typography variant="h5" component="label" htmlFor="current-passphrase">
          {t('PassphraseView.current_passphrase.label')}
        </Typography>
        <PasswordInput
          name="currentPassphrase"
          value={formData.currentPassphrase}
          onChange={handleInputChange}
          autoComplete="current-password"
          id="current-passphrase"
          placeholder={t('PassphraseView.current_passphrase.placeholder')}
          error={Boolean(currentPassphraseError)}
        />
        {currentPassphraseError && (
          <Typography variant="body1">{t(currentPassphraseError)}</Typography>
        )}
      </Stack>
      <Stack spacing="m">
        <Typography variant="h5" component="label" htmlFor="new-passphrase">
          {t('PassphraseView.new_passphrase.label')}
        </Typography>
        <Stack spacing="xs">
          <PasswordInput
            name="newPassphrase"
            autoComplete="new-password"
            id="new-passphrase"
            placeholder={t('PassphraseView.new_passphrase.placeholder')}
            value={formData.newPassphrase}
            onChange={handleInputChange}
            showStrength
            error={newPassphraseTouched && !newPassphraseMatch}
          />
          <PasswordInput
            name="newPassphraseRepeat"
            autoComplete="new-password"
            id="new-passphrase-repeat"
            placeholder={t(
              'PassphraseView.new_passphrase.confirmation_placeholder'
            )}
            value={formData.newPassphraseRepeat}
            onChange={handleInputChange}
            error={newPassphraseTouched && !newPassphraseMatch}
          />
        </Stack>
        {newPassphraseTouched && !newPassphraseMatch && (
          <Typography variant="body1" className="u-error">
            {t('PassphraseView.new_passphrase.dont_match')}
          </Typography>
        )}
        {globalError && (
          <Typography variant="body1" className="u-error">
            {t(globalError)}
          </Typography>
        )}
        {twoFactorError && (
          <Typography variant="body1" className="u-error">
            {t(twoFactorError)}
          </Typography>
        )}
        <UnorderedList className={styles['set-passphrase-advices']}>
          <ListItem>
            <ReactMarkdownWrapper
              source={t('PassphraseView.advices.strong_passphrase')}
            />
          </ListItem>
          <ListItem>
            <ReactMarkdownWrapper
              source={t('PassphraseView.advices.memorize')}
            />
          </ListItem>
          <ListItem>
            <ReactMarkdownWrapper
              source={t('PassphraseView.advices.our_tip')}
            />
            <PasswordExample password="Cl4ude€st1Nu@ge" />
          </ListItem>
        </UnorderedList>
      </Stack>
      <Stack spacing="m">
        <Typography variant="h5" component="label" htmlFor="hint">
          {t('PassphraseView.hint.title')}
        </Typography>
        <Stack spacing="xs">
          <Input
            value={formData.hint}
            onChange={handleInputChange}
            placeholder={t('PassphraseView.hint.placeholder')}
            name="hint"
            id="hint"
            error={hintSameAsPassphrase}
          />
          {hintSameAsPassphrase && (
            <Typography variant="body1" className="u-error">
              {t('PassphraseView.hint.same_as_passphrase')}
            </Typography>
          )}
        </Stack>
        <ReactMarkdownWrapper source={t('PassphraseView.hint.description')} />
      </Stack>
      <Stack spacing="xs">
        <Buttons
          busy={submitting}
          disabled={!canSubmit}
          label={t('PassphraseView.submit')}
          fullWidth
          className="u-mb-half"
          type="submit"
        >
          {saved && <Icon className="u-ml-half u-valid" icon={CheckIcon} />}
        </Buttons>
        <Buttons
          component={Link}
          to="/profile"
          label={t('PassphraseView.cancel')}
          variant="secondary"
          fullWidth
        />
      </Stack>
    </Stack>
  )
}

export default PassphraseForm
