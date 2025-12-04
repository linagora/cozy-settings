import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from 'cozy-ui/transpiled/react/Button'
import Switch from 'cozy-ui/transpiled/react/Switch'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import styles from './imports.styl'
import { routes } from '../../constants/routes'

import { useImports } from '@/components/Imports/ImportsContext'
import Page from '@/components/Page'
import { PageHeader } from '@/components/PageHeader'

const Imports = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { enabled, setEnabled } = useImports()

  const onSwitchChange = useCallback(
    ev => {
      const next = !!ev?.target?.checked
      setEnabled(next)
    },
    [setEnabled]
  )

  return (
    <Page>
      <PageHeader title={t('ImportsView.title')} />

      <Typography variant="subtitle1" gutterBottom>
        {t('ImportsView.subtitle')}
      </Typography>

      <Typography variant="body2" gutterBottom>
        {t('ImportsView.helper')}
      </Typography>

      <div className={styles['ImportsView-switchRow']}>
        <Switch checked={enabled} onChange={onSwitchChange} />
        <Typography variant="body1">{t('ImportsView.toggle')}</Typography>
      </div>

      <div className={styles['ImportsView-actionsRow']}>
        <Button
          variant="primary"
          disabled={!enabled}
          onClick={() => navigate(routes.importsRun)}
        >
          {t('ImportsView.action_run')}
        </Button>
        <Button
          variant="secondary"
          disabled={!enabled}
          onClick={() => navigate(routes.importsHistory)}
        >
          {t('ImportsView.action_history')}
        </Button>
      </div>
    </Page>
  )
}

export { Imports }
export default Imports
