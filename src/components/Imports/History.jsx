import React from 'react'
import { useSelector } from 'react-redux'

import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import Page from '@/components/Page'

const History = () => {
  const { t } = useI18n()
  const enabled = useSelector(state => state.importData?.enabled ?? false)

  return (
    <Page>
      <Typography variant="h3" gutterBottom>
        {t('ImportsHistory.title')}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {enabled
          ? t('ImportsHistory.helper')
          : t('ImportsHistory.disabled_helper')}
      </Typography>

      <div style={{ opacity: 0.7 }}>
        <Typography variant="caption">
          {t('ImportsHistory.placeholder')}
        </Typography>
      </div>
    </Page>
  )
}

export default History
