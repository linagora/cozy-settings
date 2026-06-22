import { screen, render } from '@testing-library/react'
import React from 'react'

import { ApplicativeAccountsSection } from '@/components/Profile/ApplicativeAccountsSection'
import AppLike from '@/test/AppLike'

jest.mock('cozy-flags', () => jest.fn())

const flag = require('cozy-flags')

describe('ApplicativeAccountsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    flag.mockImplementation(() => null)
  })

  const setup = ({ url = null } = {}) => {
    flag.mockImplementation(flagName => {
      if (flagName === 'settings.applicative-accounts.url') return url
      return null
    })
    render(
      <AppLike>
        <ApplicativeAccountsSection />
      </AppLike>
    )
  }

  it('should render the title and description', () => {
    setup({ url: 'https://example.com/accounts' })
    expect(screen.getByText('External mail client')).toBeTruthy()
    expect(
      screen.getByText(
        'Connect your Twake mailbox to any email client using a dedicated application account.'
      )
    ).toBeTruthy()
  })

  it('should render the CTA as an enabled external link to the url flag', () => {
    setup({ url: 'https://example.com/accounts' })
    const link = screen.getByText('Manage application accounts').closest('a')
    expect(link).toHaveAttribute('href', 'https://example.com/accounts')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).not.toHaveAttribute('disabled')
  })

  it('should disable the CTA when no url flag is set', () => {
    setup({ url: null })
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
