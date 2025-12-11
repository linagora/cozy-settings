import React from 'react'

import Stack from 'cozy-ui/transpiled/react/Stack'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

const ImportErrors = ({ error, failedItems }) => {
  const { t } = useI18n()

  if (!error && (!failedItems || failedItems.length === 0)) {
    return null
  }

  return (
    <Stack spacing="xs">
      {error && (
        <Typography variant="caption" color="error">
          {String(error)}
        </Typography>
      )}

      {failedItems && failedItems.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {failedItems.map((item, idx) => {
            const path =
              item.path || item.name || t('ImportsRun.errors.unknown_path')
            const statusCode =
              typeof item.status === 'number'
                ? item.status
                : t('ImportsRun.errors.status_na')
            const reason = item.reason || ''
            const line = reason
              ? `${path} - ${statusCode} (${reason})`
              : `${path} - ${statusCode}`

            return (
              <li key={idx} style={{ fontSize: 11 }}>
                {line}
              </li>
            )
          })}
        </ul>
      )}
    </Stack>
  )
}

export default ImportErrors
