import 'cozy-ui/transpiled/react/stylesheet.css'
import 'cozy-ui/dist/cozy-ui.utils.min.css'
import 'cozy-bar/dist/stylesheet.css'

import { captureConsoleIntegration } from '@sentry/integrations'
import * as Sentry from '@sentry/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes
} from 'react-router-dom'

import CozyClient from 'cozy-client'
import flag from 'cozy-flags'
import { RealtimePlugin } from 'cozy-realtime'
import 'cozy-search/dist/stylesheet.css'
import 'cozy-ui-plus/dist/stylesheet.css'

import manifest from '../../../manifest.webapp'

import App from '@/components/App'

import createStore from '../../store'

import '@/styles/index.styl'

import { AppProviders } from '@/components/AppProviders'

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[role=application]')
  const root = createRoot(container)
  const data = JSON.parse(container.dataset.cozy)
  const protocol = window.location.protocol
  const cozyClient = new CozyClient({
    uri: `${protocol}//${data.domain}`,
    token: data.token,
    useCustomStore: true,
    autoHydrate: true
  })

  const store = createStore(cozyClient)
  cozyClient.setStore(store)
  cozyClient.registerPlugin(flag.plugin)
  cozyClient.registerPlugin(RealtimePlugin)

  Sentry.init({
    dsn: 'https://b97751b58d0d3e5e7e3d80a396b51cd9@errors.cozycloud.cc/72',
    environment: process.env.NODE_ENV,
    release: manifest.version,
    integrations: [
      captureConsoleIntegration({ levels: ['error'] }), // We also want to capture the `console.error` to, among other things, report the logs present in the `try/catch`
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      })
    ],
    tracesSampleRate: 0.1,
    // React log these warnings(bad Proptypes), in a console.error, it is not relevant to report this type of information to Sentry
    ignoreErrors: [/^Warning: /]
  })

  root.render(
    <AppProviders client={cozyClient} store={store}>
      <App />
    </AppProviders>
  )
})
