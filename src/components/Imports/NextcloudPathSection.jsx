import React from 'react'

import Button from 'cozy-ui/transpiled/react/Button'
import Stack from 'cozy-ui/transpiled/react/Stack'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

import styles from './imports.styl'

const NextcloudPathSection = ({
  title,
  helper,
  remotePath,
  busy,
  onChangeRemotePath,
  onImport,
  onListRemote,
  onStopImport,
  canStop
}) => {
  return (
    <Stack spacing="m">
      <Stack spacing="xs">
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body1">{helper}</Typography>
      </Stack>

      <div style={{ maxWidth: 520 }}>
        <TextField
          name="remotePath"
          fullWidth
          label="Remote path (Nextcloud)"
          placeholder="/ or /Documents or /file.pdf"
          disabled={busy}
          value={remotePath}
          onChange={e => onChangeRemotePath(e.target.value)}
        />
      </div>

      <div className={styles['ImportsNextcloudPathSection-actions']}>
        <Button
          variant="primary"
          disabled={busy || !remotePath}
          onClick={onImport}
        >
          {busy ? 'Importing…' : 'Import'}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={onListRemote}>
          {busy ? 'Working…' : 'List remote'}
        </Button>
        {canStop && (
          <Button variant="secondary" size="small" onClick={onStopImport}>
            Stop import
          </Button>
        )}
      </div>
    </Stack>
  )
}

export default NextcloudPathSection
