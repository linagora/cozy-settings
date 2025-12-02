import { useEffect, useState, useCallback } from 'react'

import {
  findNextcloudAccounts,
  createNextcloudAccount,
  deleteNextcloudAccount
} from './accountService'

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

  const createAccount = async ({ login, password, url }) => {
    setError(null)

    const acc = await createNextcloudAccount(client, {
      login,
      password,
      url
    })

    if (acc?.error || acc?.errors) {
      throw new Error(
        acc?.error || acc?.errors?.[0]?.detail || 'Account creation failed'
      )
    }

    await loadAccounts()
    return acc?._id
  }

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
    createAccount,
    removeAccount,
    reload: loadAccounts
  }
}
