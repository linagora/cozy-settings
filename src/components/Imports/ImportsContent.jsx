import React from 'react'

import Box from 'cozy-ui/transpiled/react/Box'
import Button from 'cozy-ui/transpiled/react/Buttons'
import Circle from 'cozy-ui/transpiled/react/Circle'
import Icon from 'cozy-ui/transpiled/react/Icon'
import CloudRainbowIcon from 'cozy-ui/transpiled/react/Icons/CloudRainbow'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useBreakpoints } from 'cozy-ui/transpiled/react/providers/Breakpoints'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

const ImportsContent = () => {
  const { t } = useI18n()
  const { isMobile } = useBreakpoints()

  const onStartImport = () => {}

  return (
    <Box
      className="u-flex u-flex-column u-flex-items-center u-mh-auto u-mv-0"
      maxWidth={600}
    >
      <Circle size={100} backgroundColor="var(--defaultBackgroundColor)">
        <Icon icon={CloudRainbowIcon} size={48} />
      </Circle>

      <Typography className="u-mt-1-half u-mb-2" variant="h3" align="center">
        {t('ImportsView.subtitle')}
      </Typography>

      <Typography className="u-mb-2" align="center">
        {t('ImportsView.helper')}
      </Typography>

      <Button
        theme="primary"
        onClick={onStartImport}
        className={isMobile ? 'u-w-100' : ''}
      >
        {t('ImportsView.cta')}
      </Button>
    </Box>
  )
}

export default ImportsContent
