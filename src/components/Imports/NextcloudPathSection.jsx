import React from 'react'

import Button from 'cozy-ui/transpiled/react/Button'
import Stack from 'cozy-ui/transpiled/react/Stack'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

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
  const { t } = useI18n()

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
          label={t('ImportsRun.sections.path.label')}
          placeholder={t('ImportsRun.sections.path.placeholder')}
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
          {busy
            ? t('ImportsRun.sections.path.importing')
            : t('ImportsRun.sections.path.import')}
        </Button>

        <Button variant="secondary" disabled={busy} onClick={onListRemote}>
          {busy
            ? t('ImportsRun.sections.path.working')
            : t('ImportsRun.sections.path.list')}
        </Button>

        {canStop && (
          <Button variant="secondary" size="small" onClick={onStopImport}>
            {t('ImportsRun.sections.path.stop')}
          </Button>
        )}
      </div>
    </Stack>
  )
}

export default NextcloudPathSection
