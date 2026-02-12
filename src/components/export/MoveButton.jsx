import React, { useRef, useState } from 'react'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import flag from 'cozy-flags'
import Buttons from 'cozy-ui/transpiled/react/Buttons'
import Typography from 'cozy-ui/transpiled/react/Typography'

import { STACK_DOMAIN } from '@/actions'
import {
  BlockingSubscriptionModal,
  getBlockingSubscriptionVendor,
  hasBlockingSubscription
} from '@/components/BlockingSubscriptionModal'
import { buildExternalTiesQuery } from '@/lib/queries'

const MoveButton = () => {
  const { t } = useI18n()
  const client = useClient()
  const externalTiesQuery = buildExternalTiesQuery()

  const [isBlockingDisplayed, setBlockingDisplayed] = useState(false)
  const [blockingSubscriptionVendor, setBlockingSubscriptionVendor] =
    useState(null)
  const form = useRef(null)

  const handleSubmit = async () => {
    const externalTiesResult = await client.query(
      externalTiesQuery.definition(),
      externalTiesQuery.options
    )
    if (hasBlockingSubscription(externalTiesResult)) {
      setBlockingDisplayed(true)
      setBlockingSubscriptionVendor(
        getBlockingSubscriptionVendor(externalTiesResult)
      )
    } else {
      form.current.submit()
    }
  }

  const handleClose = () => {
    setBlockingDisplayed(false)
  }

  const handleResume = () => {
    form.current.submit()
    setBlockingDisplayed(false)
  }

  if (flag('settings.moving-cozy')) {
    return (
      <form
        action={STACK_DOMAIN + '/move/initialize'}
        method="post"
        target="_blank"
        className="u-mv-half"
        ref={form}
      >
        <Typography variant="body1" gutterBottom>
          {t('ProfileView.move.label')}
        </Typography>
        <Buttons
          label={t('ProfileView.move.button')}
          variant="secondary"
          onClick={handleSubmit}
        />
        {isBlockingDisplayed ? (
          <BlockingSubscriptionModal
            onClose={handleClose}
            onResume={handleResume}
            vendor={blockingSubscriptionVendor}
            reason="move"
          />
        ) : null}
      </form>
    )
  }

  return null
}

export { MoveButton }
