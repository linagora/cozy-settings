import { useState, useRef, useCallback } from 'react'

import { ensureImportsDestination } from './destinationService'
import { importPathRecursive } from './importService'
import { probePath } from './remoteService'

const ROOT_DIR_ID = 'io.cozy.files.root-dir'

export const useNextcloudImport = (client, accounts, selectedId) => {
  const [remotePath, setRemotePath] = useState('/')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const [remotePreview, setRemotePreview] = useState([])
  const [failedItems, setFailedItems] = useState([])
  const [progress, setProgress] = useState({ total: 0, done: 0, current: '' })
  const [importSummary, setImportSummary] = useState('')
  const [abortRequested, setAbortRequested] = useState(false)

  const abortRef = useRef(false)

  const reset = useCallback(() => {
    setStatus('')
    setError(null)
    setRemotePreview([])
    setFailedItems([])
    setProgress({ total: 0, done: 0, current: '' })
    setImportSummary('')
    setAbortRequested(false)
    abortRef.current = false
  }, [])

  const readError = e => {
    if (e?.body?.errors?.[0]) {
      return JSON.stringify(e.body.errors[0])
    }
    return e?.message || String(e)
  }

  const listRemote = async () => {
    reset()
    if (!selectedId) return

    setBusy(true)
    try {
      const { kind, items, name } = await probePath(
        client,
        selectedId,
        remotePath || '/'
      )

      if (kind === 'file') {
        setStatus(`Remote path is a file: ${name}`)
        setRemotePreview([name])
      } else {
        setStatus(
          `Remote list: ${items.length} item(s) at ${remotePath || '/'}`
        )
        const names = items
          .slice(0, 10)
          .map(it => it?.attributes?.name || it?.name || 'unknown')
        setRemotePreview(names)
      }
    } catch (e) {
      setError(readError(e))
    } finally {
      setBusy(false)
    }
  }

  const startImport = async () => {
    reset()
    if (!selectedId) return
    if (!remotePath) {
      setError('Missing remote path')
      return
    }

    abortRef.current = false
    setAbortRequested(false)
    setBusy(true)

    try {
      const accDoc = accounts.find(a => a._id === selectedId)
      const login = accDoc?.auth?.login || accDoc?.label || selectedId

      const { dirId: destId, path: destPath } = await ensureImportsDestination(
        client,
        'Nextcloud',
        login
      )

      setStatus('Analyzing path…')

      const summary = await importPathRecursive(
        client,
        selectedId,
        remotePath || '/',
        destId || ROOT_DIR_ID,
        {
          copy: true,
          maxDepth: 20,
          baseCozyPath: destPath,
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
        setImportSummary(
          summary.filesCopied > 0
            ? `Stopped after copying ${summary.filesCopied} files.`
            : 'Import stopped by user.'
        )
      } else {
        setStatus('Import success.')
        setImportSummary(`Successfully imported ${summary.filesCopied} files.`)
      }

      if (summary.errors?.length) {
        setError(`Some items failed: ${summary.errors.length}`)
        setFailedItems(summary.errors)
      }
    } catch (e) {
      if (!abortRef.current) {
        setError(readError(e))
      } else {
        setStatus('Import stopped by user.')
      }
    } finally {
      setBusy(false)
      abortRef.current = false
      setAbortRequested(false)
    }
  }

  const stopImport = () => {
    if (!busy || abortRef.current) return
    abortRef.current = true
    setAbortRequested(true)
    setStatus('Stopping import…')
  }

  return {
    remotePath,
    setRemotePath,
    busy,
    status,
    error,
    remotePreview,
    failedItems,
    progress,
    importSummary,
    abortRequested,
    listRemote,
    startImport,
    stopImport,
    reset
  }
}
