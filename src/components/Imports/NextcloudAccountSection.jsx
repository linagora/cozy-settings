import React from 'react'

import Button from 'cozy-ui/transpiled/react/Button'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'

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
          <Typography variant="h5">Compte Nextcloud</Typography>
          <Typography variant="body1">
            Sélectionnez ou créez un compte Nextcloud pour lancer un import.
          </Typography>
        </Stack>
        <Typography variant="caption" color="textSecondary">
          Select Nextcloud to check connection.
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing="m">
      <Stack spacing="xs">
        <Typography variant="h5">Compte Nextcloud</Typography>
        <Typography variant="body1">
          Sélectionnez ou créez un compte Nextcloud pour lancer un import.
        </Typography>
      </Stack>

      <Stack spacing="s">
        {checkingAccount ? (
          <div className={styles['ImportsNextcloudSection-row']}>
            <Spinner size="small" />
            <Typography variant="caption">Checking account…</Typography>
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
                Add account
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={!selectedAccountId}
                onClick={onDeleteAccount}
              >
                Delete selected account
              </Button>
            </div>
          </>
        ) : (
          <div className={styles['ImportsNextcloudSection-rowWrap']}>
            <Typography variant="caption" color="textSecondary">
              No Nextcloud account configured.
            </Typography>
            <Button size="small" variant="secondary" onClick={onAddAccount}>
              Create Nextcloud account
            </Button>
          </div>
        )}
      </Stack>
    </Stack>
  )
}

export default NextcloudAccountSection
