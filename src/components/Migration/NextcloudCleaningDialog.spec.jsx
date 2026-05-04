import { render, screen } from '@testing-library/react'
import React from 'react'

import { NextcloudCleaningDialog } from './NextcloudCleaningDialog'
import AppLike from 'test/AppLike'

jest.mock('@/assets/icons/nextcloud-logo.svg', () => 'nextcloud-logo.svg')

const setup = (props = {}) =>
  render(
    <AppLike>
      <NextcloudCleaningDialog onClose={jest.fn()} {...props} />
    </AppLike>
  )

describe('NextcloudCleaningDialog', () => {
  it('shows the cleaning title', () => {
    setup()
    expect(screen.queryByText('Cleaning Nextcloud Drive')).toBeInTheDocument()
  })

  it('shows the cleaning description', () => {
    setup()
    expect(
      screen.queryByText(
        'Permanently deleting all data from your Nextcloud Drive…'
      )
    ).toBeInTheDocument()
  })

  it('shows a progress bar', () => {
    setup()
    expect(screen.queryByRole('progressbar')).toBeInTheDocument()
  })

  it('accepts an onClose prop without crashing', () => {
    const onClose = jest.fn()
    expect(() => setup({ onClose })).not.toThrow()
  })
})
