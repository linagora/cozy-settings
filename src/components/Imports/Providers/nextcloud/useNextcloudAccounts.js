import { useEffect, useState, useCallback } from 'react'

import { findNextcloudAccounts, deleteNextcloudAccount } from './accountService'

export const useNextcloudAccounts = (client, enabled, isNextcloud) => {
  const [checking, setChecking] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [error, setError] = useState(null)

  const loadAccounts = useCallback(async () => {
    if (!enabled || !isNextcloud) {
      setAccounts([])
      setSelectedId('')
      return
    }

    setChecking(true)
    setError(null)

    try {
      const docs = await findNextcloudAccounts(client)
      setAccounts(docs)
      setSelectedId(prev => {
        if (!docs.length) return ''
        if (prev && docs.some(a => a._id === prev)) return prev
        return docs[0]._id
      })
    } catch (e) {
      setError(e?.message || 'Accounts fetch failed')
    } finally {
      setChecking(false)
    }
  }, [client, enabled, isNextcloud])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const removeAccount = async id => {
    setError(null)
    const acc = accounts.find(a => a._id === id)
    if (!acc) return

    try {
      await deleteNextcloudAccount(client, acc)
      await loadAccounts()
    } catch (e) {
      setError(e?.message || 'Error while deleting Nextcloud account')
    }
  }

  return {
    checking,
    accounts,
    selectedId,
    setSelectedId,
    error,
    removeAccount,
    reload: loadAccounts
  }
}
