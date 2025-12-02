import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Button'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import ImportsRunHeader from './ImportsRunHeader'
import ImportsProviderSelect from './ImportsProviderSelect'
import NextcloudAccountSection from './NextcloudAccountSection'
import NextcloudAccountDialog from './NextcloudAccountDialog'
import NextcloudPathSection from './NextcloudPathSection'
import ImportsProgress from './ImportsProgress'
import ImportErrors from './ImportErrors'
import RemotePreview from './RemotePreview'

import { useNextcloudAccounts } from './Providers/nextcloud/useNextcloudAccounts'
import { useNextcloudImport } from './Providers/nextcloud/useNextcloudImport'

import { useImports } from '@/components/Imports/ImportsContext'
import Page from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'
import { routes } from '@/constants/routes'

const SERVICES = [
  { label: 'Nextcloud', slug: 'nextcloud' },
  { label: 'GoogleDrive', slug: 'googledrive' },
  { label: 'Dropbox', slug: 'dropbox' }
]

const Run = () => {
  const { t } = useI18n()
  const client = useClient()
  const navigate = useNavigate()
  const { enabled } = useImports()

  const [serviceSlug, setServiceSlug] = useState('')
  const isNextcloud = serviceSlug === 'nextcloud'

  const {
    checking,
    accounts,
    selectedId,
    setSelectedId,
    error: accountError,
    removeAccount,
    reload
  } = useNextcloudAccounts(client, enabled, isNextcloud)

  const ncImport = useNextcloudImport(client, accounts, selectedId)

  const [showNcForm, setShowNcForm] = useState(false)

  const providerOptions = SERVICES.map(s => ({
    value: s.slug,
    label: s.label
  }))

  const providerValue = serviceSlug
    ? providerOptions.find(o => o.value === serviceSlug) || null
    : null

  const providerFieldProps = {
    title: t('ImportsRun.sections.provider.title', { _: 'Service' }),
    label: t('ImportsRun.sections.provider.helper', {
      _: 'Choisissez un service à partir duquel importer vos données.'
    })
  }

  if (!enabled) {
    return (
      <Page>
        <Stack spacing="m">
          <Typography variant="h3" gutterBottom>
            {t('ImportsRun.title')}
          </Typography>
          <Typography variant="body1">
            {t('ImportsRun.disabled_helper')}
          </Typography>
          <Button variant="primary" onClick={() => navigate(routes.imports)}>
            {t('ImportsRun.back_to_settings')}
          </Button>
        </Stack>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader title={t('ImportsRun.title')} />

      <Stack spacing="l">
        <ImportsRunHeader />

        <Stack spacing="m">
          <ImportsProviderSelect
            providerOptions={providerOptions}
            providerValue={providerValue}
            providerFieldProps={providerFieldProps}
            onChange={setServiceSlug}
          />
        </Stack>

        {isNextcloud && (
          <NextcloudAccountSection
            isNextcloud={isNextcloud}
            checkingAccount={checking}
            accounts={accounts}
            selectedAccountId={selectedId}
            onSelectAccount={setSelectedId}
            onAddAccount={() => setShowNcForm(true)}
            onDeleteAccount={() => {
              if (selectedId) {
                removeAccount(selectedId)
              }
            }}
          />
        )}

        {isNextcloud && accounts.length > 0 && (
          <NextcloudPathSection
            title={t('ImportsRun.sections.path.title', {
              _: 'Chemin à importer'
            })}
            helper={t('ImportsRun.sections.path.helper', {
              _: 'Le contenu sera copié dans Imports/Nextcloud/<login> dans Twake Drive.'
            })}
            remotePath={ncImport.remotePath}
            busy={ncImport.busy}
            onChangeRemotePath={ncImport.setRemotePath}
            onImport={ncImport.startImport}
            onListRemote={ncImport.listRemote}
            onStopImport={ncImport.stopImport}
            canStop={
              ncImport.busy &&
              ncImport.progress.total > 0 &&
              !ncImport.abortRequested
            }
          />
        )}

        {(ncImport.progress.total > 0 ||
          ncImport.remotePreview.length > 0 ||
          ncImport.status ||
          ncImport.importSummary ||
          ncImport.error ||
          accountError ||
          ncImport.failedItems.length > 0) && (
          <Stack spacing="m">
            {(ncImport.progress.total > 0 ||
              ncImport.status ||
              ncImport.importSummary) && (
              <ImportsProgress
                title={t('ImportsRun.sections.progress.title', {
                  _: 'Progression'
                })}
                progress={ncImport.progress}
                busy={ncImport.busy}
                status={ncImport.status}
                summary={ncImport.importSummary}
              />
            )}

            {ncImport.remotePreview.length > 0 && (
              <RemotePreview items={ncImport.remotePreview} />
            )}

            {(ncImport.error ||
              accountError ||
              ncImport.failedItems.length > 0) && (
              <ImportErrors
                error={ncImport.error || accountError}
                failedItems={ncImport.failedItems}
              />
            )}
          </Stack>
        )}
      </Stack>

      <NextcloudAccountDialog
        open={showNcForm}
        onClose={() => setShowNcForm(false)}
        onCreated={async newId => {
          await reload()
          setSelectedId(newId)
          setShowNcForm(false)
        }}
      />
    </Page>
  )
}

export default Run
