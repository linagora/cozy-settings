import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useClient } from 'cozy-client'
import Button from 'cozy-ui/transpiled/react/Button'
import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import ImportErrors from './ImportErrors'
import ImportsProgress from './ImportsProgress'
import ImportsProviderSelect from './ImportsProviderSelect'
import ImportsRunHeader from './ImportsRunHeader'
import NextcloudAccountDialog from './NextcloudAccountDialog'
import NextcloudAccountSection from './NextcloudAccountSection'
import NextcloudPathSection from './NextcloudPathSection'
import {
  createNextcloudAccount,
  findNextcloudAccounts,
  deleteNextcloudAccount
} from './Providers/nextcloud/accountService'
import { nextcloudProvider } from './Providers/nextcloud/provider'
import RemotePreview from './RemotePreview'

import { useImports } from '@/components/Imports/ImportsContext'
import Page from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'
import { routes } from '@/constants/routes'

const SERVICES = [
  { label: 'Nextcloud', slug: 'nextcloud' },
  { label: 'GoogleDrive', slug: 'googledrive' },
  { label: 'Dropbox', slug: 'dropbox' }
]

const ROOT_DIR_ID = 'io.cozy.files.root-dir'
const IMPORTS_RUN_STATE_KEY = 'imports.run.state'

const loadRunState = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(IMPORTS_RUN_STATE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saveRunState = state => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(IMPORTS_RUN_STATE_KEY, JSON.stringify(state))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to save imports run state:', err)
  }
}

const clearRunState = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(IMPORTS_RUN_STATE_KEY)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear imports run state:', err)
  }
}

const Run = () => {
  const { t } = useI18n()
  const client = useClient()
  const navigate = useNavigate()
  const { enabled } = useImports()

  const persistedRef = useRef(null)
  if (persistedRef.current === null) {
    persistedRef.current = loadRunState() || {}
  }
  const persisted = persistedRef.current

  const [serviceSlug, setServiceSlug] = useState(persisted.serviceSlug || '')
  const isNextcloud = serviceSlug === 'nextcloud'

  const [checkingAccount, setCheckingAccount] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState(
    persisted.selectedAccountId || ''
  )

  const [remotePath, setRemotePath] = useState(persisted.remotePath || '/')

  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const [remotePreview, setRemotePreview] = useState([])
  const [failedItems, setFailedItems] = useState([])

  const [progress, setProgress] = useState({ total: 0, done: 0, current: '' })
  const [abortRequested, setAbortRequested] = useState(false)
  const abortRef = useRef(false)

  const [importSummary, setImportSummary] = useState('')

  const [showNcForm, setShowNcForm] = useState(false)
  const [ncLogin, setNcLogin] = useState('')
  const [ncPassword, setNcPassword] = useState('')
  const [ncUrl, setNcUrl] = useState('https://mynextcloud.example.com')
  const [ncError, setNcError] = useState(null)
  const [ncLoading, setNcLoading] = useState(false)

  const resetMsgs = useCallback(() => {
    setError(null)
    setStatus('')
    setRemotePreview([])
    setFailedItems([])
    setProgress({ total: 0, done: 0, current: '' })
    setAbortRequested(false)
    abortRef.current = false
    setImportSummary('')
  }, [])

  useEffect(() => {
    resetMsgs()
    setSelectedAccountId('')
    setAccounts([])

    if (!enabled || !isNextcloud) return

    let aborted = false
    ;(async () => {
      setCheckingAccount(true)
      try {
        const docs = await nextcloudProvider.listAccounts(client)
        if (aborted) return
        setAccounts(docs)
        if (docs.length) setSelectedAccountId(docs[0]._id)
      } catch (e) {
        if (!aborted) setError(e?.message || 'Accounts fetch failed')
      } finally {
        if (!aborted) setCheckingAccount(false)
      }
    })()
    return () => {
      aborted = true
    }
  }, [client, enabled, isNextcloud, resetMsgs])

  useEffect(() => {
    if (!enabled) {
      clearRunState()
      abortRef.current = true
      return
    }

    saveRunState({
      serviceSlug,
      selectedAccountId,
      remotePath
    })
  }, [enabled, serviceSlug, selectedAccountId, remotePath])

  useEffect(() => {
    return () => {
      abortRef.current = true
    }
  }, [])

  const readError = async e => {
    try {
      const raw = await e?.response?.text()
      if (!raw) return e?.message || String(e)
      try {
        const j = JSON.parse(raw)
        return j?.errors?.[0]?.detail || j?.error || raw
      } catch {
        return raw
      }
    } catch {
      return e?.message || 'Error'
    }
  }

  const pickAccountId = async () => {
    if (selectedAccountId) return selectedAccountId
    const all = await nextcloudProvider.listAccounts(client)
    return all?.[0]?._id
  }

  const handleListRemote = async () => {
    resetMsgs()
    if (!isNextcloud) return
    setBusy(true)
    try {
      const accId = await pickAccountId()
      if (!accId) throw new Error('No Nextcloud account configured')
      const { kind, items, name } = await nextcloudProvider.probePath(
        client,
        accId,
        remotePath || '/'
      )
      if (kind === 'file') {
        setStatus(`Remote path is a file: ${name}`)
        setRemotePreview([name])
      } else {
        setStatus(
          `Remote list: ${items.length} item(s) at ${remotePath || '/'}`
        )
        const names = (items || [])
          .slice(0, 10)
          .map(it => it?.attributes?.name || it?.name || it?.path || 'unknown')
        setRemotePreview(names)
      }
    } catch (e) {
      setError(await readError(e))
    } finally {
      setBusy(false)
    }
  }

  const handleImport = async () => {
    resetMsgs()
    if (!isNextcloud) return
    if (!remotePath) {
      setError('Missing remote path')
      return
    }

    abortRef.current = false
    setAbortRequested(false)
    setBusy(true)

    try {
      const accId = await pickAccountId()
      if (!accId) throw new Error('No Nextcloud account configured')

      let accDoc = accounts.find(a => a._id === accId)
      if (!accDoc) {
        const all = await nextcloudProvider.listAccounts(client)
        accDoc = all.find(a => a._id === accId)
      }
      const login = accDoc?.auth?.login || accDoc?.label || accId

      const destId = await nextcloudProvider.ensureImportsDestination(
        client,
        'Nextcloud',
        login
      )

      setStatus('Analyzing path…')

      const summary = await nextcloudProvider.importPathRecursive(
        client,
        accId,
        remotePath || '/',
        destId || ROOT_DIR_ID,
        {
          copy: true,
          maxDepth: 20,
          onDiscovered: ({ files = 0 }) =>
            setProgress(prev => ({
              ...prev,
              total: prev.total + (files || 0)
            })),
          onProcessed: ({ path }) =>
            setProgress(prev => ({
              ...prev,
              done: prev.done + 1,
              current: path
            })),
          isAborted: () => abortRef.current
        }
      )

      if (abortRef.current) {
        setStatus('Import stopped by user.')
        if (summary.filesCopied > 0) {
          setImportSummary(
            `Import stopped by user after copying ${summary.filesCopied} files.`
          )
        } else {
          setImportSummary('Import stopped by user.')
        }
      } else {
        setStatus('Import success.')
        setImportSummary(`Successfully imported ${summary.filesCopied} files.`)
      }

      if (summary.errors?.length) {
        setError(`Some items failed: ${summary.errors.length}`)
        setFailedItems(summary.errors)
      }
    } catch (e) {
      if (abortRef.current) {
        setStatus('Import stopped by user.')
      } else {
        setError(await readError(e))
      }
    } finally {
      setBusy(false)
      abortRef.current = false
      setAbortRequested(false)
    }
  }

  const handleCreateNcAccount = async () => {
    if (!isNextcloud) return
    setNcError(null)
    setNcLoading(true)
    try {
      const account = await createNextcloudAccount(client, {
        login: ncLogin,
        password: ncPassword,
        url: ncUrl
      })
      const docs = await findNextcloudAccounts(client)
      setAccounts(docs)
      const newId =
        account?._id || (docs && docs.length ? docs[0]._id : '') || ''
      if (newId) {
        setSelectedAccountId(newId)
      }
      setShowNcForm(false)
      setNcPassword('')
    } catch (e2) {
      setNcError(e2?.message || 'Error while creating Nextcloud account')
    } finally {
      setNcLoading(false)
    }
  }

  const handleDeleteNcAccount = async () => {
    if (!isNextcloud) return
    if (!selectedAccountId) return
    const account = accounts.find(a => a._id === selectedAccountId)
    if (!account) return

    setError(null)

    try {
      await deleteNextcloudAccount(client, account)
      const nextAccounts = accounts.filter(a => a._id !== selectedAccountId)
      setAccounts(nextAccounts)
      setSelectedAccountId(nextAccounts[0]?._id || '')
      setStatus('Nextcloud account deleted.')
    } catch (e) {
      setError(e?.message || 'Error while deleting Nextcloud account')
    }
  }

  const handleStopImport = () => {
    if (!busy || abortRequested) return
    abortRef.current = true
    setAbortRequested(true)
    setStatus('Stopping import…')
  }

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

        <NextcloudAccountSection
          isNextcloud={isNextcloud}
          checkingAccount={checkingAccount}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          onAddAccount={() => {
            setShowNcForm(true)
            setNcError(null)
          }}
          onDeleteAccount={handleDeleteNcAccount}
        />

        {isNextcloud && accounts.length > 0 && (
          <NextcloudPathSection
            title={t('ImportsRun.sections.path.title', {
              _: 'Chemin à importer'
            })}
            helper={t('ImportsRun.sections.path.helper', {
              _: 'Le contenu sera copié dans Imports/Nextcloud/<login> dans Twake Drive.'
            })}
            remotePath={remotePath}
            busy={busy}
            onChangeRemotePath={setRemotePath}
            onImport={handleImport}
            onListRemote={handleListRemote}
            onStopImport={handleStopImport}
            canStop={busy && progress.total > 0 && !abortRequested}
          />
        )}

        {(progress.total > 0 ||
          remotePreview.length > 0 ||
          status ||
          importSummary ||
          error ||
          failedItems.length > 0) && (
          <Stack spacing="m">
            {(progress.total > 0 || status || importSummary) && (
              <ImportsProgress
                title={t('ImportsRun.sections.progress.title', {
                  _: 'Progression'
                })}
                progress={progress}
                busy={busy}
                status={status}
                summary={importSummary}
              />
            )}

            {remotePreview.length > 0 && (
              <RemotePreview items={remotePreview} />
            )}

            {(error || failedItems.length > 0) && (
              <ImportErrors error={error} failedItems={failedItems} />
            )}
          </Stack>
        )}
      </Stack>

      <NextcloudAccountDialog
        open={showNcForm}
        login={ncLogin}
        password={ncPassword}
        url={ncUrl}
        loading={ncLoading}
        error={ncError}
        onChangeLogin={setNcLogin}
        onChangePassword={setNcPassword}
        onChangeUrl={setNcUrl}
        onSubmit={handleCreateNcAccount}
        onClose={() => {
          setShowNcForm(false)
          setNcError(null)
        }}
      />
    </Page>
  )
}

export default Run
