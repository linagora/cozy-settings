import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { createMockClient } from 'cozy-client'

import NextcloudProgressDialog from './NextcloudProgressDialog'
import { computeRemainingSeconds } from './useMigration'
import AppLike from 'test/AppLike'

jest.mock('lottie-react', () => () => <div data-testid="lottie" />)

jest.mock('./useMigration', () => ({
  ...jest.requireActual('./useMigration'),
  useDriveUrl: jest.fn(() => null),
  computeRemainingSeconds: jest.fn(() => null)
}))

const mockClient = createMockClient({})
mockClient.getStackClient = () => ({ uri: 'https://test.mycozy.cloud' })
mockClient.getInstanceOptions = () => ({ subdomain: 'flat' })

const IN_PROGRESS = {
  files_imported: 300,
  files_total: 1500,
  bytes_imported: 1_000_000_000,
  bytes_total: 5_000_000_000
}

const DONE = {
  files_imported: 1500,
  files_total: 1500,
  bytes_imported: 5_000_000_000,
  bytes_total: 5_000_000_000
}

const defaultProps = {
  progress: IN_PROGRESS,
  startedAt: new Date(Date.now() - 30_000).toISOString(),
  onCloseAll: jest.fn(),
  cancelSuccess: false,
  cancelError: null
}

const setup = (props = {}) =>
  render(
    <AppLike client={mockClient}>
      <NextcloudProgressDialog {...defaultProps} {...props} />
    </AppLike>
  )

describe('NextcloudProgressDialog', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('in-progress state', () => {
    it('shows the progress title and subtitle', () => {
      setup()
      expect(screen.getByText('Transferring your data')).toBeInTheDocument()
      expect(
        screen.getByText(/Please wait while we migrate/)
      ).toBeInTheDocument()
    })

    it('shows the completion percentage', () => {
      setup()
      expect(screen.getByText('20% complete')).toBeInTheDocument()
    })

    it('shows the cancel button', () => {
      setup()
      expect(screen.getByText('Cancel transfer')).toBeInTheDocument()
    })

    it('does not show done state', () => {
      setup()
      expect(screen.queryByText('All done')).not.toBeInTheDocument()
    })

    it('shows remaining time when computable', () => {
      computeRemainingSeconds.mockReturnValue(45)
      setup()
      expect(screen.getByText(/45 second/)).toBeInTheDocument()
    })

    it('hides remaining time when not computable', () => {
      computeRemainingSeconds.mockReturnValue(null)
      setup()
      expect(screen.queryByText(/remaining/)).not.toBeInTheDocument()
    })
  })

  describe('done state', () => {
    it('shows the done title', () => {
      setup({ progress: DONE, status: 'completed' })
      expect(screen.getByText('All done')).toBeInTheDocument()
    })

    it('shows the open folder button', () => {
      setup({ progress: DONE, status: 'completed' })
      expect(screen.getByText('Open folder')).toBeInTheDocument()
    })

    it('does not show the cancel button', () => {
      setup({ progress: DONE, status: 'completed' })
      expect(screen.queryByText('Cancel transfer')).not.toBeInTheDocument()
    })
  })

  describe('cancel alerts', () => {
    it('shows success alert when cancelSuccess is true', () => {
      setup({ cancelSuccess: true })
      expect(
        screen.getByText(
          'Cancellation requested. The transfer will stop shortly.'
        )
      ).toBeInTheDocument()
    })

    it('does not show success alert when cancelSuccess is false', () => {
      setup({ cancelSuccess: false })
      expect(
        screen.queryByText(/Cancellation requested/)
      ).not.toBeInTheDocument()
    })

    it('shows error alert when cancelError is set', () => {
      setup({ cancelError: 'cancel_error' })
      expect(
        screen.getByText(
          'The cancellation could not be sent. Please try again.'
        )
      ).toBeInTheDocument()
    })

    it('does not show error alert when cancelError is null', () => {
      setup({ cancelError: null })
      expect(
        screen.queryByText(/cancellation could not be sent/)
      ).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = jest.fn()
      setup({ onCancel })
      fireEvent.click(screen.getByText('Cancel transfer'))
      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCloseAll when the close icon is clicked', () => {
      const onCloseAll = jest.fn()
      setup({ onCloseAll })
      fireEvent.click(screen.getByRole('button', { name: '' }))
      expect(onCloseAll).toHaveBeenCalledTimes(1)
    })
  })
})
