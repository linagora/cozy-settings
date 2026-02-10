import React from 'react'

import Button from 'cozy-ui/transpiled/react/Button'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import styles from './imports.styl'

import Select from '@/components/Select'

const NextcloudAccountSection = ({
  isNextcloud,
  checkingAccount,
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
  onDeleteAccount
}) => {
  const { t } = useI18n()

  const accountOptions = accounts.map(acc => {
    const label = acc?.auth?.login || acc?.label || acc?._id
    return { value: acc._id, label }
  })

  const accountValue = selectedAccountId
    ? accountOptions.find(o => o.value === selectedAccountId) || null
    : null

  if (!isNextcloud) {
    return (
      <Stack spacing="m">
        <Stack spacing="xs">
          <Typography variant="h5">
            {t('ImportsRun.sections.account.title')}
          </Typography>
          <Typography variant="body1">
            {t('ImportsRun.sections.account.helper')}
          </Typography>
        </Stack>
        <Typography variant="caption" color="textSecondary">
          {t('ImportsRun.sections.account.hint_select_provider')}
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing="m">
      <Stack spacing="xs">
        <Typography variant="h5">
          {t('ImportsRun.sections.account.title')}
        </Typography>
        <Typography variant="body1">
          {t('ImportsRun.sections.account.helper')}
        </Typography>
      </Stack>

      <Stack spacing="s">
        {checkingAccount ? (
          <div className={styles['ImportsNextcloudSection-row']}>
            <Spinner size="small" />
            <Typography variant="caption">
              {t('ImportsRun.sections.account.checking')}
            </Typography>
          </div>
        ) : accounts.length ? (
          <>
            <Select
              name="nextcloudAccount"
              options={accountOptions}
              fieldProps={{
                title: '',
                label: ''
              }}
              value={accountValue}
              onChange={sel => {
                onSelectAccount(sel ? sel.value : '')
              }}
              isSearchable={false}
            />
            <div className={styles['ImportsNextcloudSection-rowWrap']}>
              <Button size="small" variant="secondary" onClick={onAddAccount}>
                {t('ImportsRun.sections.account.add')}
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={!selectedAccountId}
                onClick={onDeleteAccount}
              >
                {t('ImportsRun.sections.account.delete_selected')}
              </Button>
            </div>
          </>
        ) : (
          <div className={styles['ImportsNextcloudSection-rowWrap']}>
            <Typography variant="caption" color="textSecondary">
              {t('ImportsRun.sections.account.none_configured')}
            </Typography>
            <Button size="small" variant="secondary" onClick={onAddAccount}>
              {t('ImportsRun.sections.account.create')}
            </Button>
          </div>
        )}
      </Stack>
    </Stack>
  )
}

export default NextcloudAccountSection
