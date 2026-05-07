import { useCallback, useEffect, useRef, useState } from 'react'

import { Q, models, useClient } from 'cozy-client'

import logger from '@/lib/logger'

const ACCOUNTS_DOCTYPE = 'io.cozy.accounts'
const TRIGGERS_DOCTYPE = 'io.cozy.triggers'
const NEXTCLOUD_WAIT_FOR_JOB_TIMEOUT_MS = 2 * 60 * 1000
const WAIT_FOR_JOB_TIMEOUT_ERROR = 'Timeout for JobCollection::waitFor'
const NEXTCLOUD_ERROR_CODES = {
  LOGIN_FAILED: 'LOGIN_FAILED',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
}
const ERROR_CODE_TO_UI_ERROR = {
  [NEXTCLOUD_ERROR_CODES.LOGIN_FAILED]: 'start_konnector_error',
  [NEXTCLOUD_ERROR_CODES.TIMEOUT]: 'start_konnector_timeout',
  [NEXTCLOUD_ERROR_CODES.UNKNOWN]: 'start_konnector_error'
}

const NEXTCLOUD_KONNECTOR = {
  slug: 'nextcloud',
  fields: {
    login: { type: 'text' },
    password: { type: 'password' },
    url: { type: 'text' }
  }
}

const normalizeFormValue = value => String(value ?? '').trim()
const normalizeNextcloudUrl = url => normalizeFormValue(url).replace(/\/+$/, '')

const hasSameNextcloudAccountCredentials = (account, { url, username }) =>
  normalizeNextcloudUrl(account?.auth?.url ?? '') === url &&
  normalizeFormValue(account?.auth?.login ?? '') === username

const findExistingNextcloudAccount = async (client, { url, username }) => {
  const { data: accounts } = await client.query(
    Q(ACCOUNTS_DOCTYPE)
      .where({
        account_type: NEXTCLOUD_KONNECTOR.slug,
        'auth.login': username
      })
      .indexFields(['account_type', 'auth.login'])
  )

  // We intentionally filter url in-memory after query because stored auth.url can
  // have legacy formatting differences (trailing slash/spaces). We normalize both
  // sides to avoid creating duplicate accounts for the same Nextcloud instance.
  return (
    (accounts ?? []).find(account =>
      hasSameNextcloudAccountCredentials(account, { url, username })
    ) ?? null
  )
}

const saveNextcloudAccount = async (client, { url, username, password }) => {
  const existingAccount = await findExistingNextcloudAccount(client, {
    url,
    username
  })

  if (existingAccount) {
    const { data: account } = await client.save({
      ...existingAccount,
      _type: ACCOUNTS_DOCTYPE,
      auth: {
        ...existingAccount.auth,
        login: username,
        password,
        url
      }
    })

    return account
  }

  const accountData = models.account.buildAccount(NEXTCLOUD_KONNECTOR, {
    login: username,
    password,
    url
  })
  const { data: account } = await client.save({
    ...accountData,
    _type: ACCOUNTS_DOCTYPE
  })

  return account
}

const getAccountId = account => account?._id ?? account?.id ?? null

const findExistingNextcloudTrigger = async (client, account) => {
  const accountId = getAccountId(account)

  if (!accountId) return null

  const { data: triggers } = await client.query(
    Q(TRIGGERS_DOCTYPE)
      .where({
        'message.account': accountId,
        'message.konnector': NEXTCLOUD_KONNECTOR.slug,
        worker: 'konnector'
      })
      .indexFields(['message.account', 'message.konnector', 'worker'])
      .limitBy(1)
  )

  return triggers[0] ?? null
}

const saveNextcloudTrigger = async (client, account) => {
  const existingTrigger = await findExistingNextcloudTrigger(client, account)

  if (existingTrigger) return existingTrigger

  const triggerData = models.trigger.triggers.buildTriggerAttributes({
    account,
    konnector: NEXTCLOUD_KONNECTOR
  })
  const { data: trigger } = await client.save({
    ...triggerData,
    _type: TRIGGERS_DOCTYPE
  })

  return trigger
}

const getJobId = job => job?._id ?? job?.id ?? null

const buildNextcloudJobSnapshot = ({
  launchedJob,
  nextJobState,
  launchedJobId
}) => ({
  ...(launchedJob ?? {}),
  ...(nextJobState ?? {}),
  _id: launchedJobId
})

const launchNextcloudJob = async (client, trigger) => {
  const { data: launchedJob } = await client
    .collection(TRIGGERS_DOCTYPE)
    .launch(trigger)
  const launchedJobId = getJobId(launchedJob)

  if (!launchedJobId) {
    throw new Error('Missing job id after trigger launch')
  }

  return { launchedJob, launchedJobId }
}

const waitForNextcloudJob = async (client, launchedJobId, onUpdate) =>
  client.collection('io.cozy.jobs').waitFor(launchedJobId, {
    delay: 1000,
    timeout: NEXTCLOUD_WAIT_FOR_JOB_TIMEOUT_MS,
    onUpdate
  })

const isKnownKonnectorErrorCode = errorCode =>
  errorCode === NEXTCLOUD_ERROR_CODES.LOGIN_FAILED

const sanitizeKonnectorErrorCode = errorCode =>
  isKnownKonnectorErrorCode(errorCode)
    ? errorCode
    : NEXTCLOUD_ERROR_CODES.UNKNOWN

const getKonnectorErrorCodeFromException = error => {
  if (error?.message === WAIT_FOR_JOB_TIMEOUT_ERROR) {
    return NEXTCLOUD_ERROR_CODES.TIMEOUT
  }

  return sanitizeKonnectorErrorCode(error?.message)
}

const getUiErrorFromErrorCode = errorCode =>
  ERROR_CODE_TO_UI_ERROR[errorCode] ?? 'start_konnector_error'

const runNextcloudConnection = async ({
  client,
  url,
  username,
  password,
  onJobStateChange
}) => {
  const normalizedUrl = normalizeNextcloudUrl(url)
  const normalizedUsername = normalizeFormValue(username)
  const account = await saveNextcloudAccount(client, {
    url: normalizedUrl,
    username: normalizedUsername,
    password
  })

  const trigger = await saveNextcloudTrigger(client, account)

  const { launchedJob, launchedJobId } = await launchNextcloudJob(
    client,
    trigger
  )

  onJobStateChange({
    job: buildNextcloudJobSnapshot({
      launchedJob,
      nextJobState: null,
      launchedJobId
    }),
    status: launchedJob?.state ?? null
  })

  const finalJob = await waitForNextcloudJob(
    client,
    launchedJobId,
    updatedJob => {
      onJobStateChange({
        job: buildNextcloudJobSnapshot({
          launchedJob,
          nextJobState: updatedJob,
          launchedJobId
        }),
        status: updatedJob?.state ?? null
      })
    }
  )

  const nextcloudJob = buildNextcloudJobSnapshot({
    launchedJob,
    nextJobState: finalJob,
    launchedJobId
  })

  onJobStateChange({
    job: nextcloudJob,
    status: finalJob?.state ?? null
  })

  if (finalJob?.state === 'errored') {
    return {
      success: false,
      job: nextcloudJob,
      errorCode: sanitizeKonnectorErrorCode(finalJob?.error)
    }
  }

  return {
    success: true,
    errorCode: null,
    job: nextcloudJob
  }
}

const useNextcloudKonnector = () => {
  const client = useClient()
  const isMountedRef = useRef(true)
  const inFlightStartRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [job, setJob] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)

  useEffect(
    () => () => {
      isMountedRef.current = false
    },
    []
  )

  const setStateIfMounted = useCallback(callback => {
    if (!isMountedRef.current) return

    callback()
  }, [])

  const resetRunState = useCallback(() => {
    setStateIfMounted(() => {
      setSuccess(false)
      setError(null)
      setErrorMessage(null)
      setJob(null)
      setJobStatus(null)
      setIsLoading(true)
    })
  }, [setStateIfMounted])

  const setRunErrorState = useCallback(
    ({ uiError, errorCode, nextJobStatus = 'errored' }) => {
      setStateIfMounted(() => {
        setError(uiError)
        setErrorMessage(errorCode)
        setJobStatus(nextJobStatus)
      })
    },
    [setStateIfMounted]
  )

  const setRunSuccessState = useCallback(() => {
    setStateIfMounted(() => {
      setSuccess(true)
    })
  }, [setStateIfMounted])

  const setRunLoadingState = useCallback(
    isRunLoading => {
      setStateIfMounted(() => {
        setIsLoading(isRunLoading)
      })
    },
    [setStateIfMounted]
  )

  const start = useCallback(
    async ({ url, username, password }) => {
      if (inFlightStartRef.current) return inFlightStartRef.current

      const startPromise = (async () => {
        resetRunState()

        try {
          const runResult = await runNextcloudConnection({
            client,
            url,
            username,
            password,
            onJobStateChange: ({
              job: nextcloudJob,
              status: nextJobStatus
            }) => {
              setStateIfMounted(() => {
                setJob(nextcloudJob)
                setJobStatus(nextJobStatus)
              })
            }
          })

          if (!runResult.success) {
            const uiError = getUiErrorFromErrorCode(runResult.errorCode)

            setRunErrorState({
              uiError,
              errorCode: runResult.errorCode,
              nextJobStatus: 'errored'
            })

            return {
              success: false,
              error: uiError,
              errorMessage: runResult.errorCode,
              job: runResult.job
            }
          }

          setRunSuccessState()

          return {
            success: true,
            error: null,
            errorMessage: null,
            job: runResult.job
          }
        } catch (err) {
          logger.error('Failed to start Nextcloud konnector', err)
          const errorCode = getKonnectorErrorCodeFromException(err)
          const uiError = getUiErrorFromErrorCode(errorCode)

          setRunErrorState({ uiError, errorCode })

          return {
            success: false,
            error: uiError,
            errorMessage: errorCode,
            job: null
          }
        } finally {
          setRunLoadingState(false)
        }
      })()

      inFlightStartRef.current = startPromise

      try {
        return await startPromise
      } finally {
        inFlightStartRef.current = null
      }
    },
    [
      client,
      resetRunState,
      setRunErrorState,
      setRunLoadingState,
      setRunSuccessState,
      setStateIfMounted
    ]
  )

  return {
    start,
    isLoading,
    success,
    error,
    errorMessage,
    setError,
    setErrorMessage,
    job,
    jobStatus
  }
}

export default useNextcloudKonnector
