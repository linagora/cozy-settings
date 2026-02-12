import 'cozy-ui/transpiled/react/stylesheet.css'
import 'cozy-ui-plus/dist/stylesheet.css'

import createStore from '../../store'

import '@/styles/services/index.styl'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import CozyClient, { CozyProvider } from 'cozy-client'
import flag from 'cozy-flags'

import I18n from 'twake-i18n'

import { BreakpointsProvider } from 'cozy-ui/transpiled/react/providers/Breakpoints'
import CozyTheme from 'cozy-ui/transpiled/react/providers/CozyTheme'
import Sprite from 'cozy-ui/transpiled/react/Icon/Sprite'

import IntentService from '@/containers/IntentService'

import {
  StylesProvider,
  createGenerateClassName
} from '@material-ui/core/styles'

const lang = document.documentElement.getAttribute('lang') || 'en'

/*
With MUI V4, it is possible to generate deterministic class names.
In the case of multiple react roots, it is necessary to disable this
feature. Since we have the cozy-bar root, we need to disable the
feature.
https://material-ui.com/styles/api/#stylesprovider
*/
const generateClassName = createGenerateClassName({
  disableGlobal: true
})

document.addEventListener('DOMContentLoaded', () => {
  let container = document.querySelector('[role=application]')
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

  cozyClient.registerPlugin(flag.plugin)

  root.render(
    <StylesProvider generateClassName={generateClassName}>
      <CozyProvider client={cozyClient}>
        <Provider store={store}>
          <I18n lang={lang} dictRequire={lang => require(`@/locales/${lang}`)}>
            <BreakpointsProvider>
              <CozyTheme className="u-w-100">
                <div className="set-services">
                  <IntentService window={window} />
                  <Sprite />
                </div>
              </CozyTheme>
            </BreakpointsProvider>
          </I18n>
        </Provider>
      </CozyProvider>
    </StylesProvider>
  )
})
