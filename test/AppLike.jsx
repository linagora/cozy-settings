import React from 'react'
import { HashRouter } from 'react-router-dom'
import I18n from 'twake-i18n'

import CozyClient, { CozyProvider } from 'cozy-client'
import { WebviewIntentProvider } from 'cozy-intent'
import { BreakpointsProvider } from 'cozy-ui/transpiled/react/providers/Breakpoints'
import CozyTheme from 'cozy-ui/transpiled/react/providers/CozyTheme'

import en from '@/locales/en.json'

export const TestI18n = ({ children }) => {
  return (
    <I18n lang="en" dictRequire={() => en}>
      {children}
    </I18n>
  )
}

const defaultClient = new CozyClient()

const AppLike = ({ children, client }) => {
  return (
    <WebviewIntentProvider>
      <CozyProvider client={client || defaultClient}>
        <HashRouter>
          <BreakpointsProvider>
            <TestI18n>
              <CozyTheme>{children}</CozyTheme>
            </TestI18n>
          </BreakpointsProvider>
        </HashRouter>
      </CozyProvider>
    </WebviewIntentProvider>
  )
}

export default AppLike
