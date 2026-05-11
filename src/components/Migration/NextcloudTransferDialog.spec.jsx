import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import NextcloudTransferDialog from './NextcloudTransferDialog'
import AppLike from 'test/AppLike'

const mockUseMigration = jest.fn()

jest.mock('./useMigration', () => {
  const actual = jest.requireActual('./useMigration')

  return {
    ...actual,
    __esModule: true,
    default: (...args) => mockUseMigration(...args)
  }
})

jest.mock('./NextcloudProgressDialog', () => ({
  __esModule: true,
  default: () => <div>progress-dialog</div>
}))

const setupUseMigration = (override = {}) => {
  const base = {
    start: jest.fn(),
    cancel: jest.fn(),
    migrationId: null,
    startedAt: null,
    progress: null,
    isLoading: false,
    isCanceling: false,
    cancelSuccess: false,
    error: null,
    setError: jest.fn(),
    status: 'running'
  }

  const value = { ...base, ...override }
  mockUseMigration.mockReturnValue(value)

  return value
}

const renderDialog = () =>
  render(
    <AppLike>
      <NextcloudTransferDialog onCloseAll={jest.fn()} />
    </AppLike>
  )

describe('NextcloudTransferDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders transfer form', () => {
    setupUseMigration()
    renderDialog()

    expect(
      screen.getByText('Transfer your data from Nextcloud')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nextcloud URL')).toBeInTheDocument()
    expect(screen.getByLabelText('Username or Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('keeps submit disabled until all fields are filled', () => {
    setupUseMigration()
    renderDialog()

    const submitButton = screen.getByRole('button', { name: 'Next' })
    expect(submitButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Nextcloud URL'), {
      target: { value: 'https://example.nextcloud.com' }
    })
    fireEvent.change(screen.getByLabelText('Username or Email'), {
      target: { value: 'john' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' }
    })

    expect(submitButton).not.toBeDisabled()
  })

  it('submits expected payload', () => {
    const { start } = setupUseMigration()
    renderDialog()

    fireEvent.change(screen.getByLabelText('Nextcloud URL'), {
      target: { value: 'https://example.nextcloud.com' }
    })
    fireEvent.change(screen.getByLabelText('Username or Email'), {
      target: { value: 'john' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(start).toHaveBeenCalledWith({
      nextcloud_url: 'https://example.nextcloud.com',
      nextcloud_login: 'john',
      nextcloud_app_password: 'password',
      target_dir: '/Nextcloud imported files'
    })
  })

  it('renders progress dialog when migrationId is available', () => {
    setupUseMigration({ migrationId: 'migration-id' })
    renderDialog()

    expect(screen.getByText('progress-dialog')).toBeInTheDocument()
  })
})
