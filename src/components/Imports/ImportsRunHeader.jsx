import React from 'react'

import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

const ImportsRunHeader = () => {
  const { t } = useI18n()

  return (
    <Stack spacing="s">
      <Typography variant="body1">{t('ImportsRun.helper')}</Typography>
    </Stack>
  )
}

export default ImportsRunHeader
