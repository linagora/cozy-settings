require('@babel/polyfill')

import '@testing-library/jest-dom'

process.env.USE_REACT = true

window.__DEVELOPMENT__ = false

jest.mock('cozy-intent', () => ({
  WebviewIntentProvider: ({ children }) => children,
  useWebviewIntent: () => ({ call: () => {} })
}))

jest.mock('../../src/actions/domUtils.js', () => ({
  getStackDomain: () => 'http://test.mycozy.cloud',
  getStackToken: () => 'http://test.mycozy.cloud'
}))

jest.mock('cozy-dataproxy-lib', () => ({
  DataProxyProvider: ({ children }) => children
}))

jest.mock('cozy-search', () => ({
  AssistantDialog: ({ children }) => children
}))

// polyfill for requestAnimationFrame
/* istanbul ignore next */
global.requestAnimationFrame = cb => {
  setTimeout(cb, 0)
}

window.cozy = {
  bar: {
    BarCenter: ({ children }) => children,
    BarLeft: ({ children }) => children,
    BarRight: ({ children }) => children
  }
}
