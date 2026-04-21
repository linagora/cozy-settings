import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'

import { createMockClient } from 'cozy-client'

import MigrationProgressBanner from './MigrationProgressBanner'
import AppLike from 'test/AppLike'

import logger from '@/lib/logger'

jest.mock('@/lib/logger', () => ({ error: jest.fn() }))

const RUNNING_DOC = {
  _id: 'migration-1',
  status: 'running',
  progress: {
    files_imported: 10,
    files_total: 100,
    bytes_imported: 1_000_000,
    bytes_total: 5_000_000
  }
}

const buildMockClient = ({ runningMigration = null, fetchJSON } = {}) => {
  const client = createMockClient({})
  client.query = jest.fn().mockResolvedValue({
    data: runningMigration ? [runningMigration] : []
  })
  const subscribers = {}
  const keyOf = (event, doctype, idOrHandler) =>
    typeof idOrHandler === 'string'
      ? `${event}:${doctype}:${idOrHandler}`
      : `${event}:${doctype}`
  client.plugins = {
    realtime: {
      subscribe: jest.fn((event, doctype, idOrHandler, handler) => {
        const key = keyOf(event, doctype, idOrHandler)
        subscribers[key] = handler || idOrHandler
      }),
      unsubscribe: jest.fn((event, doctype, idOrHandler) => {
        delete subscribers[keyOf(event, doctype, idOrHandler)]
      })
    }
  }
  client.__emit = (event, doctype, doc) => {
    const handler =
      subscribers[`${event}:${doctype}:${doc._id}`] ||
      subscribers[`${event}:${doctype}`]
    if (handler) handler(doc)
  }
  client.getStackClient = () => ({
    fetchJSON: fetchJSON || jest.fn().mockResolvedValue({})
  })
  return client
}

const setup = clientOpts => {
  const client = buildMockClient(clientOpts)
  const utils = render(
    <AppLike client={client}>
      <MigrationProgressBanner />
    </AppLike>
  )
  return { client, ...utils }
}

describe('MigrationProgressBanner', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('idle state', () => {
    it('does not render the banner when no migration is running', async () => {
      setup()
      await waitFor(() =>
        expect(
          screen.queryByTestId('migration-progress-banner')
        ).not.toBeInTheDocument()
      )
    })
  })

  describe('running state', () => {
    it('renders the banner when a migration is running on mount', async () => {
      setup({ runningMigration: RUNNING_DOC })
      expect(
        await screen.findByTestId('migration-progress-banner')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('migration-progress-banner-percent')
      ).toHaveTextContent('20% complete')
      expect(
        screen.getByTestId('migration-progress-banner-importing')
      ).toHaveTextContent('100 files')
    })

    it('shows the banner when a created event arrives', async () => {
      const { client } = setup()
      await waitFor(() =>
        expect(client.plugins.realtime.subscribe).toHaveBeenCalledWith(
          'created',
          'io.cozy.nextcloud.migrations',
          expect.any(Function)
        )
      )
      act(() =>
        client.__emit('created', 'io.cozy.nextcloud.migrations', RUNNING_DOC)
      )
      expect(
        await screen.findByTestId('migration-progress-banner')
      ).toBeInTheDocument()
    })

    it('updates progress when an updated event arrives', async () => {
      const { client } = setup({ runningMigration: RUNNING_DOC })
      await screen.findByTestId('migration-progress-banner')
      act(() =>
        client.__emit('updated', 'io.cozy.nextcloud.migrations', {
          ...RUNNING_DOC,
          progress: { ...RUNNING_DOC.progress, bytes_imported: 2_500_000 }
        })
      )
      expect(
        screen.getByTestId('migration-progress-banner-percent')
      ).toHaveTextContent('50% complete')
    })
  })

  describe('terminal states', () => {
    it('hides the banner and shows the snackbar on completed', async () => {
      const { client } = setup({ runningMigration: RUNNING_DOC })
      await screen.findByTestId('migration-progress-banner')
      act(() =>
        client.__emit('updated', 'io.cozy.nextcloud.migrations', {
          ...RUNNING_DOC,
          status: 'completed'
        })
      )
      expect(
        screen.queryByTestId('migration-progress-banner')
      ).not.toBeInTheDocument()
      expect(
        await screen.findByTestId('migration-progress-banner-done')
      ).toBeInTheDocument()
    })

    it('hides the banner without snackbar on cancelled', async () => {
      const { client } = setup({ runningMigration: RUNNING_DOC })
      await screen.findByTestId('migration-progress-banner')
      act(() =>
        client.__emit('updated', 'io.cozy.nextcloud.migrations', {
          ...RUNNING_DOC,
          status: 'cancelled'
        })
      )
      expect(
        screen.queryByTestId('migration-progress-banner')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('migration-progress-banner-done')
      ).not.toBeInTheDocument()
    })

    it('hides the banner without snackbar on error', async () => {
      const { client } = setup({ runningMigration: RUNNING_DOC })
      await screen.findByTestId('migration-progress-banner')
      act(() =>
        client.__emit('updated', 'io.cozy.nextcloud.migrations', {
          ...RUNNING_DOC,
          status: 'error'
        })
      )
      expect(
        screen.queryByTestId('migration-progress-banner')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('migration-progress-banner-done')
      ).not.toBeInTheDocument()
    })
  })

  describe('cancel', () => {
    it('calls the cancel endpoint when the cancel button is clicked', async () => {
      const fetchJSON = jest.fn().mockResolvedValue({})
      setup({ runningMigration: RUNNING_DOC, fetchJSON })
      await screen.findByTestId('migration-progress-banner')
      fireEvent.click(screen.getByTestId('migration-progress-banner-cancel'))
      await waitFor(() =>
        expect(fetchJSON).toHaveBeenCalledWith(
          'POST',
          '/remote/nextcloud/migration/migration-1/cancel'
        )
      )
    })

    it('silently ignores a 409 response', async () => {
      const fetchJSON = jest.fn().mockRejectedValue({ status: 409 })
      setup({ runningMigration: RUNNING_DOC, fetchJSON })
      await screen.findByTestId('migration-progress-banner')
      fireEvent.click(screen.getByTestId('migration-progress-banner-cancel'))
      await waitFor(() => expect(fetchJSON).toHaveBeenCalled())
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('logs other errors', async () => {
      const fetchJSON = jest.fn().mockRejectedValue({ status: 500 })
      setup({ runningMigration: RUNNING_DOC, fetchJSON })
      await screen.findByTestId('migration-progress-banner')
      fireEvent.click(screen.getByTestId('migration-progress-banner-cancel'))
      await waitFor(() => expect(logger.error).toHaveBeenCalled())
    })
  })
})
