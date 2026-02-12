import React from 'react'
import { useI18n } from 'twake-i18n'

import { useQuery } from 'cozy-client'
import flag from 'cozy-flags'
import Alert from 'cozy-ui/transpiled/react/Alert'
import AlertTitle from 'cozy-ui/transpiled/react/AlertTitle'
import Button from 'cozy-ui/transpiled/react/Buttons'
import Stack from 'cozy-ui/transpiled/react/Stack'

import Input from '@/components/Input'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const PhoneNumberSection = () => {
  const { t } = useI18n()

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const signUpUrl = flag('signup.url')
  const isPhoneReadonly = flag('settings.phone.readonly') || !signUpUrl

  return (
    <Stack spacing="m">
      <Input
        name="phone_number"
        type="tel"
        title={t('ProfileView.phone_number.title')}
        label={t(`ProfileView.phone_number.label`)}
        value={instance?.phone}
        copyable={true}
        readOnly
      />
      <Button
        variant="secondary"
        size="medium"
        label={t('ProfileView.phone_number.change_button')}
        href={`${signUpUrl}/change-phone`}
        target="_blank"
        disabled={isPhoneReadonly}
      />
      {!isPhoneReadonly && !instance?.phone && (
        <Alert severity="warning">
          <AlertTitle>
            {t('ProfileView.phone_number.add_alert_title')}
          </AlertTitle>
          {t('ProfileView.phone_number.add_alert_description')}
        </Alert>
      )}
    </Stack>
  )
}

export { PhoneNumberSection }
