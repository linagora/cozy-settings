import { useCallback, useEffect, useRef, useState } from 'react'

const MOCK_FILES_TOTAL = 1500
const MOCK_BYTES_TOTAL = 5_368_709_120
const MOCK_FILES_STEP = 30
const MOCK_BYTES_STEP = 112_220_160 // ~107 Mo
const MOCK_INTERVAL_MS = 267

const useMigrationMock = ({
  migrationId: externalId = null,
  startedAt: externalStartedAt = null,
  cancelFails = false
} = {}) => {
  const [migrationId, setMigrationId] = useState(externalId)
  const [startedAt, setStartedAt] = useState(externalStartedAt)
  const [progress, setProgress] = useState(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const canceledRef = useRef(false)

  const start = useCallback(() => {
    canceledRef.current = false
    setCancelSuccess(false)
    setError(null)
    setStartedAt(new Date().toISOString())
    setMigrationId('mock-migration')
  }, [])

  const cancel = useCallback(() => {
    if (cancelFails) {
      setError('cancel_unavailable')
      return
    }
    canceledRef.current = true
    clearInterval(intervalRef.current)
    setProgress(null)
    setMigrationId(null)
    setCancelSuccess(true)
  }, [cancelFails])

  useEffect(() => {
    if (!migrationId) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (!prev) {
          return {
            files_imported: 0,
            files_total: MOCK_FILES_TOTAL,
            bytes_imported: 0,
            bytes_total: MOCK_BYTES_TOTAL
          }
        }
        if (prev.files_imported >= prev.files_total) {
          clearInterval(intervalRef.current)
          return prev
        }
        return {
          ...prev,
          files_imported: Math.min(
            prev.files_imported + MOCK_FILES_STEP,
            prev.files_total
          ),
          bytes_imported: Math.min(
            prev.bytes_imported + MOCK_BYTES_STEP,
            prev.bytes_total
          )
        }
      })
    }, MOCK_INTERVAL_MS)

    return () => clearInterval(intervalRef.current)
  }, [migrationId])

  return {
    start,
    cancel,
    migrationId,
    startedAt,
    progress,
    isLoading: false,
    isCanceling: false,
    cancelSuccess,
    error
  }
}

export default useMigrationMock
