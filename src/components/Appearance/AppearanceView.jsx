import React, { useEffect } from 'react'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import { isFlagshipApp } from 'cozy-device-helper'
import { useWebviewIntent } from 'cozy-intent'
import MenuItem from 'cozy-ui/transpiled/react/MenuItem'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useBreakpoints } from 'cozy-ui/transpiled/react/providers/Breakpoints'
import { useTheme } from 'cozy-ui/transpiled/react/styles'
import { useCozyTheme } from 'cozy-ui-plus/dist/providers/CozyTheme'

import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'

const AppearanceView = ({ instance }) => {
  const { isMobile } = useBreakpoints()
  const { t } = useI18n()
  const client = useClient()
  const webviewIntent = useWebviewIntent()
  const theme = useTheme()
  const { isLight } = useCozyTheme()

  const colorSchemeValue = instance?.colorScheme || 'auto'

  const options = [
    {
      value: 'light',
      label: t('AppearanceView.light')
    },
    {
      value: 'dark',
      label: t('AppearanceView.dark')
    },
    {
      value: 'auto',
      label: t('AppearanceView.auto')
    }
  ]

  const handleChange = async ev => {
    const newColorScheme = ev.target.value

    await client.save({
      _rev: instance.meta.rev,
      ...instance,
      attributes: {
        ...instance.attributes,
        colorScheme: newColorScheme
      }
    })
  }

  useEffect(() => {
    const updateThemeOnFlagshipApp = async () => {
      const isColorSchemeAvailable = await webviewIntent.call(
        'isAvailable',
        'colorScheme'
      )

      if (isColorSchemeAvailable) {
        await webviewIntent.call('setColorScheme', colorSchemeValue)
        await webviewIntent.call('setFlagshipUI', {
          bottomTheme: isLight ? 'dark' : 'light',
          bottomBackground: theme.palette.background.paper,
          topTheme: isLight ? 'dark' : 'light',
          topBackground: theme.palette.background.paper
        })
      }
    }

    if (isFlagshipApp()) {
      updateThemeOnFlagshipApp()
    }
  }, [webviewIntent, colorSchemeValue, isLight, theme])

  return (
    <Page narrow>
      <PageTitle className={!isMobile ? 'u-mb-1' : ''}>
        {t('AppearanceView.title')}
      </PageTitle>
      <Typography variant="h5" className="u-mb-half">
        {t('AppearanceView.subtitle')}
      </Typography>
      <TextField
        variant="outlined"
        value={colorSchemeValue}
        options={options}
        select
        fullWidth
        onChange={handleChange}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Page>
  )
}

export default AppearanceView
