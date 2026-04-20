import { renderHook, act } from '@testing-library/react'

import { generateWebLink } from 'cozy-client'

import { computeRemainingSeconds, useDriveUrl } from './useMigration'

jest.mock('cozy-client', () => ({
  generateWebLink: jest.fn(() => 'https://drive.example.com')
}))

describe('computeRemainingSeconds', () => {
  const baseProgress = {
    bytes_imported: 500_000_000,
    bytes_total: 1_000_000_000,
    files_imported: 50,
    files_total: 100
  }

  it('returns null if progress is missing', () => {
    expect(computeRemainingSeconds(null, new Date().toISOString())).toBeNull()
  })

  it('returns null if bytes_imported is 0', () => {
    expect(
      computeRemainingSeconds(
        { ...baseProgress, bytes_imported: 0 },
        new Date().toISOString()
      )
    ).toBeNull()
  })

  it('returns null if bytes_total is 0', () => {
    expect(
      computeRemainingSeconds(
        { ...baseProgress, bytes_total: 0 },
        new Date().toISOString()
      )
    ).toBeNull()
  })

  it('returns null if startedAt is in the future', () => {
    const future = new Date(Date.now() + 10_000).toISOString()
    expect(computeRemainingSeconds(baseProgress, future)).toBeNull()
  })

  it('returns the estimated remaining time in seconds', () => {
    const startedAt = new Date(Date.now() - 10_000).toISOString() // 10s elapsed
    // 500MB imported in 10s → speed 50MB/s → 500MB remaining → ~10s
    const result = computeRemainingSeconds(baseProgress, startedAt)
    expect(result).toBeCloseTo(10, 0)
  })

  it('returns 0 when everything is imported', () => {
    const startedAt = new Date(Date.now() - 5_000).toISOString()
    const result = computeRemainingSeconds(
      { ...baseProgress, bytes_imported: baseProgress.bytes_total },
      startedAt
    )
    expect(result).toBe(0)
  })
})

describe('useDriveUrl', () => {
  const mockClient = {
    getStackClient: () => ({ uri: 'https://cozy.example.com' }),
    collection: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null while isDone is false', () => {
    const { result } = renderHook(() => useDriveUrl(false, mockClient, 'flat'))
    expect(result.current).toBeNull()
    expect(mockClient.collection).not.toHaveBeenCalled()
  })

  it('fetches the /Nextcloud folder URL when isDone becomes true', async () => {
    const folderId = 'folder-abc123'
    mockClient.collection.mockReturnValue({
      statByPath: jest.fn().mockResolvedValue({ data: { _id: folderId } })
    })

    const { result, rerender } = renderHook(
      ({ isDone }) => useDriveUrl(isDone, mockClient, 'flat'),
      { initialProps: { isDone: false } }
    )

    await act(async () => rerender({ isDone: true }))

    expect(mockClient.collection).toHaveBeenCalledWith('io.cozy.files')
    expect(generateWebLink).toHaveBeenCalledWith(
      expect.objectContaining({ hash: `folder/${folderId}`, slug: 'drive' })
    )
    expect(result.current).toBe('https://drive.example.com')
  })

  it('falls back to drive root if folder fetch fails', async () => {
    mockClient.collection.mockReturnValue({
      statByPath: jest.fn().mockRejectedValue(new Error('not found'))
    })

    const { result, rerender } = renderHook(
      ({ isDone }) => useDriveUrl(isDone, mockClient, 'flat'),
      { initialProps: { isDone: false } }
    )

    await act(async () => rerender({ isDone: true }))

    expect(generateWebLink).toHaveBeenCalledWith(
      expect.objectContaining({ hash: '', slug: 'drive' })
    )
    expect(result.current).toBe('https://drive.example.com')
  })

  it('does not re-fetch if isDone toggles back to true', async () => {
    const statByPath = jest
      .fn()
      .mockResolvedValue({ data: { _id: 'folder-id' } })
    mockClient.collection.mockReturnValue({ statByPath })

    const { rerender } = renderHook(
      ({ isDone }) => useDriveUrl(isDone, mockClient, 'flat'),
      { initialProps: { isDone: true } }
    )

    await act(async () => rerender({ isDone: false }))
    await act(async () => rerender({ isDone: true }))

    expect(statByPath).toHaveBeenCalledTimes(1)
  })
})
