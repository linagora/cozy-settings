import React from 'react'
import { useI18n } from 'twake-i18n'

import { useQuery } from 'cozy-client'

import Input from '@/components/Input'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const EmailReadOnlySection = () => {
  const { t } = useI18n()

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  if (instance == null) {
    return null
  }

  return (
    <Input
      name="email"
      type="email"
      title={t('EmailReadOnlySection.title')}
      label={t('EmailReadOnlySection.subtitle')}
      value={instance.email}
      copyable={true}
      readOnly
    />
  )
}

export default EmailReadOnlySection
