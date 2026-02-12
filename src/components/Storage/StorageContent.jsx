import React from 'react'
import { useI18n } from 'twake-i18n'

import { useInstanceInfo } from 'cozy-client'
import { makeDiskInfos } from 'cozy-client/dist/models/instance'
import Alert from 'cozy-ui/transpiled/react/Alert'
import Box from 'cozy-ui/transpiled/react/Box'
import Circle from 'cozy-ui/transpiled/react/Circle'
import Icon from 'cozy-ui/transpiled/react/Icon'
import CloudRainbowIcon from 'cozy-ui/transpiled/react/Icons/CloudRainbow'
import { LinearProgress } from 'cozy-ui/transpiled/react/Progress'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useBreakpoints } from 'cozy-ui/transpiled/react/providers/Breakpoints'

import { PremiumLink } from '@/components/Premium/PremiumLink'

const StorageContent = () => {
  const { isMobile } = useBreakpoints()
  const { t } = useI18n()
  const { diskUsage } = useInstanceInfo()

  const { humanDiskUsage, humanDiskQuota, percentUsage } = makeDiskInfos(
    diskUsage.data?.used,
    diskUsage.data?.quota
  )
  const showQuotaAlert = parseInt(percentUsage) > 75

  return (
    <Box
      className="u-flex u-flex-column u-flex-items-center u-mh-auto u-mv-0"
      maxWidth={600}
    >
      <Circle size={100} backgroundColor="var(--defaultBackgroundColor)">
        <Icon icon={CloudRainbowIcon} size={48} />
      </Circle>
      <Typography className="u-mt-1-half u-mb-2" variant="h3" align="center">
        {t('StorageView.storage_title')}
      </Typography>
      <Box
        className="u-w-100 u-flex u-flex-justify-between u-flex-items-baseline"
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <div>
          <Typography variant="h2" display="inline">
            {t('StorageView.storage_used', { humanDiskUsage })}
          </Typography>
          <Typography display="inline">
            {t('StorageView.storage_total', { humanDiskQuota })}
          </Typography>
        </div>
        <Typography display="inline">
          {t('StorageView.storage_available', {
            spaceAvailable: humanDiskQuota - humanDiskUsage
          })}
        </Typography>
      </Box>
      <LinearProgress
        className="u-mv-half u-w-100 u-h-half u-bdrs-6"
        variant="determinate"
        value={parseInt(percentUsage)}
      />

      {showQuotaAlert && (
        <Alert className="u-mt-half" severity="warning">
          {t('StorageView.storage_warning')}
        </Alert>
      )}

      <PremiumLink
        className="u-mt-2"
        label={t('StorageView.see_offer')}
        fullWidth={false}
      />
    </Box>
  )
}

export default StorageContent
