import React from 'react'
import { useI18n } from 'twake-i18n'

import { useQuery } from 'cozy-client'

import Input from '@/components/Input'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const EmailReadOnlySection = ({ isMailAppInstalled }) => {
  const { t } = useI18n()

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  if (instance == null) {
    return null
  }

  const showTag = !!instance.org_id && !isMailAppInstalled

  return (
    <Input
      name="email"
      type="email"
      title={t('EmailReadOnlySection.title')}
      label={t('EmailReadOnlySection.subtitle')}
      tag={showTag ? t('EmailReadOnlySection.tag') : null}
      value={instance.email}
      copyable={true}
      readOnly
    />
  )
}

export default EmailReadOnlySection
