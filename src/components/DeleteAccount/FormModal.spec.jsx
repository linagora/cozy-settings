'use strict'

/* eslint-env jest */

import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import I18n from 'twake-i18n'

import { useQuery } from 'cozy-client'
import { BreakpointsProvider } from 'cozy-ui/transpiled/react/providers/Breakpoints'

import FormModal from './FormModal'

import langEn from '@/locales/en.json'

jest.mock('cozy-client', () => ({
  ...jest.requireActual('cozy-client'),
  useQuery: jest.fn()
}))

jest.mock('@/actions/domUtils', () => ({
  getStackDomain: () => 'http://cozy.tools:8080',
  getStackToken: () => 'fake-token'
}))

jest.mock('@/actions/email', () => ({
  sendDeleteAccountReasonEmail: jest.fn()
}))

const TestI18n = ({ children }) => {
  return (
    <I18n lang="en" dictRequire={() => langEn}>
      {children}
    </I18n>
  )
}

describe('FormModal component', () => {
  const mockDomain = 'cozy.tools:8080'
  // set the DOM data filled by cozy-stack
  beforeAll(() => {
    document.body.innerHTML = `<div role="application" data-cozy-domain="${mockDomain}" />`
  })

  afterAll(() => {
    document.body.innerHTML = ''
  })

  it('should read correctly Cozy Domain on send action ', async () => {
    const { sendDeleteAccountReasonEmail } = require('@/actions/email')
    useQuery.mockReturnValue({
      data: {
        email: 'test@example.com'
      }
    })

    const root = render(
      <BreakpointsProvider>
        <TestI18n>
          <FormModal onClose={jest.fn()} />
        </TestI18n>
      </BreakpointsProvider>
    )

    fireEvent.click(root.getByText('Send'))

    expect(sendDeleteAccountReasonEmail.mock.calls[0][1]).toEqual(
      expect.stringContaining(mockDomain)
    )
    jest.dontMock('@/actions/email')
  })
})
