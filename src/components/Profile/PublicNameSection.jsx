import React, { useMemo, useState } from 'react'
import { useI18n } from 'twake-i18n'

import { useQuery, useMutation } from 'cozy-client'

import Input from '@/components/Input'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const PublicNameSection = () => {
  const { t } = useI18n()

  const { mutate, mutationStatus } = useMutation()
  const [formError, setFormError] = useState()

  const instanceQuery = buildSettingsInstanceQuery()
  const { data: instance } = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const handleBlur = (_, value) => {
    if (value !== '') {
      mutate({
        _rev: instance.meta.rev,
        ...instance,
        attributes: {
          ...instance.attributes,
          public_name: value
        }
      })
    }
  }

  const errors = useMemo(() => {
    if (mutationStatus === 'failed') {
      return ['ProfileView.infos.server_error']
    }
    if (formError) {
      return [formError]
    }
    return undefined
  }, [mutationStatus, formError])

  const handleChange = (_, value) => {
    setFormError(value === '' ? 'ProfileView.infos.empty' : undefined)
  }

  return (
    <Input
      name="public_name"
      type="text"
      title={t('ProfileView.public_name.title')}
      label={t(`ProfileView.public_name.label`)}
      value={instance?.public_name}
      onBlur={handleBlur}
      onChange={handleChange}
      submitting={mutationStatus === 'loading'}
      saved={mutationStatus === 'loaded'}
      errors={errors}
      copyable={true}
    />
  )
}

export { PublicNameSection }
