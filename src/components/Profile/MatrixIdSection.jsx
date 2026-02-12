import React from 'react'
import { useI18n } from 'twake-i18n'

import Stack from 'cozy-ui/transpiled/react/Stack'

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
