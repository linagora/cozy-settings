import React from 'react'
import { useI18n } from 'twake-i18n'

import { useInstanceInfo } from 'cozy-client'
import Stack from 'cozy-ui/transpiled/react/Stack'

import Input from '@/components/Input'

const MatrixIdSection = ({ matrixId, isChatAppInstalled }) => {
  const { t } = useI18n()
  const {
    instance: { data: instanceData }
  } = useInstanceInfo()

  if (!matrixId) {
    return null
  }

  const showTag = !!instanceData?.org_id && !isChatAppInstalled

  return (
    <Stack spacing="m">
      <Input
        name="matrix_id"
        type="text"
        title={t('ProfileView.matrix_id.title')}
        label={t(`ProfileView.matrix_id.label`)}
        tag={showTag ? t('ProfileView.matrix_id.tag') : null}
        value={matrixId}
        copyable={true}
        readOnly
      />
    </Stack>
  )
}

export { MatrixIdSection }
