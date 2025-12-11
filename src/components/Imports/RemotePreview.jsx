import React from 'react'

import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

const RemotePreview = ({ items }) => {
  const { t } = useI18n()

  if (!items || items.length === 0) return null

  return (
    <Stack spacing="xs">
      <Typography variant="subtitle2" gutterBottom>
        {t('ImportsRun.sections.preview.title', {
          _: 'Preview (first 10)'
        })}
      </Typography>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((name, idx) => (
          <li key={`${name}-${idx}`} style={{ fontSize: 12 }}>
            {name}
          </li>
        ))}
      </ul>
    </Stack>
  )
}

export default RemotePreview
