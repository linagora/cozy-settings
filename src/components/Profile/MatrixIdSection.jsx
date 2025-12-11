import React from 'react'

import { useClient } from 'cozy-client'
import Stack from 'cozy-ui/transpiled/react/Stack'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import Input from '@/components/Input'

// FIXME: Currently, Matrix ID may not be generated correctly for some domains, like for nested domains.
// We will later get more data to generate it correctly (in front end or back end) when the admin panel
// project will be operational. In the meantime, we can hide this section with a flag when it is not displayed correctly.
export const generateMatrixId = domain => {
  if (!domain) {
    return ''
  }

  const firstDotIndex = domain.indexOf('.')

  if (firstDotIndex === -1) {
    return ''
  }

  return `@${domain.substring(0, firstDotIndex)}:${domain.substring(
    firstDotIndex + 1
  )}`
}

const MatrixIdSection = () => {
  const { t } = useI18n()

  const client = useClient()
  const { domain } = client.getInstanceOptions()
  const generatedMatrixId = generateMatrixId(domain)

  return (
    <Stack spacing="m">
      <Input
        name="matrix_id"
        type="text"
        title={t('ProfileView.matrix_id.title')}
        label={t(`ProfileView.matrix_id.label`)}
        value={generatedMatrixId}
        copyable={true}
        readOnly
      />
    </Stack>
  )
}

export { MatrixIdSection }
