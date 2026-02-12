import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import { useQuery, hasQueryBeenLoaded } from 'cozy-client'
import { useAlert } from 'cozy-ui/transpiled/react/providers/Alert'

import {
  BlockingSubscriptionModal,
  hasBlockingSubscription,
  getBlockingSubscriptionVendor
} from '@/components/BlockingSubscriptionModal'
import ConfirmModal from '@/components/DeleteAccount/ConfirmModal'
import EmailConfirmationModal from '@/components/DeleteAccount/EmailConfirmationModal'
import FormModal from '@/components/DeleteAccount/FormModal'
import { LoaderModal } from '@/components/DeleteAccount/LoaderModal'
import { useHasPassword } from '@/hooks/useHasPassword'
import { buildExternalTiesQuery } from '@/lib/queries'

const CONFIRMING = 'confirming'
const IDLE = 'idle'
const REQUESTING = 'requesting'
const EMAIL_CONFIRMATION = 'email_confirmation'

const DeleteAccount = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { hasPassword, isComputing } = useHasPassword()
  const externalTiesQuery = buildExternalTiesQuery()
  const externalTiesResult = useQuery(
    externalTiesQuery.definition,
    externalTiesQuery.options
  )

  const [status, setStatus] = useState(IDLE)
  const [isBlockingResumed, setBlockingResumed] = useState(false)
  const { showAlert } = useAlert()

  useEffect(() => {
    setStatus(hasPassword ? CONFIRMING : REQUESTING)
  }, [hasPassword])

  const onError = error => {
    setStatus(IDLE)
    console.error(error.message) // eslint-disable-line no-console
    showAlert({
      message: t('DeleteAccount.error.message'),
      type: 'error'
    })
  }

  const onRequested = ({ byEmailOnly }) => {
    if (byEmailOnly) {
      showAlert({
        message: t('DeleteAccount.byEmailOnly.success'),
        type: 'success'
      })
      handleClose()
    } else {
      setStatus(EMAIL_CONFIRMATION)
    }
  }

  const handleClose = () => {
    navigate('..')
  }

  const handleResume = () => {
    setBlockingResumed(true)
  }

  if (!hasQueryBeenLoaded(externalTiesResult) || isComputing) {
    return <LoaderModal />
  }

  if (hasBlockingSubscription(externalTiesResult) && !isBlockingResumed) {
    return (
      <BlockingSubscriptionModal
        onClose={handleClose}
        onResume={handleResume}
        vendor={getBlockingSubscriptionVendor(externalTiesResult)}
        reason="delete"
      />
    )
  }

  if (status === CONFIRMING) {
    return (
      <ConfirmModal
        onClose={handleClose}
        onSuccess={() => setStatus(REQUESTING)}
      />
    )
  }

  if (status === REQUESTING) {
    return (
      <FormModal
        onClose={handleClose}
        onError={onError}
        onSuccess={onRequested}
      />
    )
  }

  if (status === EMAIL_CONFIRMATION) {
    return <EmailConfirmationModal onClose={handleClose} />
  }

  return null
}

export { DeleteAccount }
