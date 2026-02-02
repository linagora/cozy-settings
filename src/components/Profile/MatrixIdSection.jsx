import React from 'react'

import Stack from 'cozy-ui/transpiled/react/Stack'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import Input from '@/components/Input'

export const generateMatrixId = email => {
  if (!email?.includes('@')) {
    return ''
  }

  const [username, domain] = email.split('@')

  return `@${username}:${domain}`
}

const MatrixIdSection = ({ email }) => {
  const { t } = useI18n()

  const generatedMatrixId = generateMatrixId(email)

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
