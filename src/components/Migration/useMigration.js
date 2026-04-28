import { useCallback, useEffect, useState } from 'react'

import { useClient, generateWebLink } from 'cozy-client'

import useMigrationMock from './useMigrationMock'

export const NEXTCLOUD_IMPORTED_FILES_DIR_NAME = '/Nextcloud imported files'

export const computeRemainingSeconds = (progress, startedAt) => {
  if (!progress || !progress.bytes_imported || !progress.bytes_total)
    return null
  const elapsedMs = Date.now() - new Date(startedAt).getTime()
  if (elapsedMs <= 0 || progress.bytes_imported <= 0) return null
  const speed = progress.bytes_imported / (elapsedMs / 1000)
  const remainingBytes = progress.bytes_total - progress.bytes_imported
  return remainingBytes / speed
}

export const isMigrationDone = status => status === 'completed'

export const computeProgressPercent = progress =>
  progress && progress.bytes_total > 0
    ? Math.round((progress.bytes_imported / progress.bytes_total) * 100)
    : 0

export const useDriveUrl = (isDone, client, subDomainType) => {
  const [driveUrl, setDriveUrl] = useState(null)
  useEffect(() => {
    if (!isDone || driveUrl) return

    const fetchDriveUrl = async () => {
      const baseLink = {
        cozyUrl: client.getStackClient().uri,
        slug: 'drive',
        subDomainType
      }
      try {
        const { data: folder } = await client
          .collection('io.cozy.files')
          .statByPath(NEXTCLOUD_IMPORTED_FILES_DIR_NAME)
        setDriveUrl(
          generateWebLink({ ...baseLink, hash: `folder/${folder._id}` })
        )
      } catch {
        setDriveUrl(generateWebLink({ ...baseLink, hash: '' }))
      }
    }

    fetchDriveUrl()
  }, [isDone, client, subDomainType, driveUrl])

  return driveUrl
}

const useMigration = ({
  mock = false,
  mockOptions = {},
  migrationId: externalId = null,
  startedAt: externalStartedAt = null
} = {}) => {
  const mockResult = useMigrationMock({
    migrationId: externalId,
    startedAt: externalStartedAt,
    ...mockOptions
  })

  const client = useClient()
  const [migrationId, setMigrationId] = useState(externalId)
  const [startedAt, setStartedAt] = useState(externalStartedAt)
  const [progress, setProgress] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)

  const start = useCallback(
    async (credentials = {}) => {
      setError(null)
      setCancelSuccess(false)
      setIsLoading(true)
      try {
        const result = await client
          .getStackClient()
          .fetchJSON('POST', '/remote/nextcloud/migration', credentials)
        setStartedAt(result.data.started_at || new Date().toISOString())
        setProgress(result.data.progress || null)
        setStatus(result.data.status)
        setMigrationId(result.data.id)
      } catch {
        setError('start_error')
      } finally {
        setIsLoading(false)
      }
    },
    [client]
  )

  const cancel = useCallback(async () => {
    if (!migrationId) return
    setIsCanceling(true)
    try {
      await client
        .getStackClient()
        .fetchJSON('POST', `/remote/nextcloud/migration/${migrationId}/cancel`)
      setCancelSuccess(true)
    } catch (e) {
      if (e.status !== 409) setError('cancel_error')
      // 409 means already terminal: not an error from the user's perspective
    } finally {
      setIsCanceling(false)
    }
  }, [client, migrationId])

  useEffect(() => {
    if (!migrationId) return

    const handleUpdate = doc => {
      setProgress(doc.progress || null)
      setStatus(doc.status)
    }

    client.plugins.realtime.subscribe(
      'updated',
      'io.cozy.nextcloud.migrations',
      migrationId,
      handleUpdate
    )

    return () => {
      client.plugins.realtime.unsubscribe(
        'updated',
        'io.cozy.nextcloud.migrations',
        migrationId,
        handleUpdate
      )
    }
  }, [client, migrationId])

  if (mock) return mockResult

  return {
    start,
    cancel,
    migrationId,
    startedAt,
    progress,
    isLoading,
    isCanceling,
    cancelSuccess,
    error,
    setError,
    status
  }
}

export default useMigration
