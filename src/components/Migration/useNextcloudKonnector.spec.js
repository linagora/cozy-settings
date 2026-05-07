import { renderHook, act } from '@testing-library/react'

import { useClient } from 'cozy-client'

import useNextcloudKonnector from './useNextcloudKonnector'

jest.mock('cozy-client', () => {
  const actual = jest.requireActual('cozy-client')

  return {
    ...actual,
    useClient: jest.fn()
  }
})

jest.mock('@/lib/logger', () => ({ error: jest.fn() }))

const buildMockClient = ({ query, save, launch, waitFor }) => ({
  query,
  save,
  collection: jest.fn(doctype => {
    if (doctype === 'io.cozy.triggers') {
      return { launch }
    }

    if (doctype === 'io.cozy.jobs') {
      return { waitFor }
    }

    throw new Error(`Unexpected doctype: ${doctype}`)
  })
})

describe('useNextcloudKonnector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('reuses an existing account when same url + login are found', async () => {
    const existingAccount = {
      _id: 'account-1',
      auth: { login: 'john', url: 'https://nc.example.com', password: 'old' }
    }

    const query = jest
      .fn()
      .mockResolvedValueOnce({ data: [existingAccount] })
      .mockResolvedValueOnce({ data: [] })
    const save = jest
      .fn()
      .mockResolvedValueOnce({ data: existingAccount })
      .mockResolvedValueOnce({ data: { _id: 'trigger-1' } })
    const launch = jest.fn().mockResolvedValue({
      data: { _id: 'job-1', state: 'queued' }
    })
    const waitFor = jest.fn().mockResolvedValue({ state: 'done' })

    useClient.mockReturnValue(buildMockClient({ query, save, launch, waitFor }))

    const { result } = renderHook(() => useNextcloudKonnector())

    await act(async () => {
      await result.current.start({
        url: 'https://nc.example.com',
        username: 'john',
        password: 'new-password'
      })
    })

    expect(save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _id: 'account-1',
        _type: 'io.cozy.accounts',
        auth: expect.objectContaining({
          login: 'john',
          url: 'https://nc.example.com',
          password: 'new-password'
        })
      })
    )
  })

  it('reuses the account matching the normalized url when multiple accounts share same login', async () => {
    const nonMatchingAccount = {
      _id: 'account-1',
      auth: { login: 'john', url: 'https://other.example.com', password: 'old' }
    }
    const matchingAccount = {
      _id: 'account-2',
      auth: { login: 'john', url: 'https://nc.example.com/', password: 'old' }
    }

    const query = jest
      .fn()
      .mockResolvedValueOnce({ data: [nonMatchingAccount, matchingAccount] })
      .mockResolvedValueOnce({ data: [] })
    const save = jest
      .fn()
      .mockResolvedValueOnce({ data: matchingAccount })
      .mockResolvedValueOnce({ data: { _id: 'trigger-1' } })
    const launch = jest.fn().mockResolvedValue({
      data: { _id: 'job-1', state: 'queued' }
    })
    const waitFor = jest.fn().mockResolvedValue({ state: 'done' })

    useClient.mockReturnValue(buildMockClient({ query, save, launch, waitFor }))

    const { result } = renderHook(() => useNextcloudKonnector())

    await act(async () => {
      await result.current.start({
        url: 'https://nc.example.com',
        username: 'john',
        password: 'new-password'
      })
    })

    expect(save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _id: 'account-2',
        _type: 'io.cozy.accounts'
      })
    )
  })

  it('reuses an existing trigger linked to the same account', async () => {
    const existingAccount = {
      _id: 'account-1',
      auth: { login: 'john', url: 'https://nc.example.com' }
    }
    const existingTrigger = { _id: 'trigger-existing' }

    const query = jest
      .fn()
      .mockResolvedValueOnce({ data: [existingAccount] })
      .mockResolvedValueOnce({ data: [existingTrigger] })
    const save = jest.fn().mockResolvedValueOnce({ data: existingAccount })
    const launch = jest.fn().mockResolvedValue({
      data: { _id: 'job-1', state: 'queued' }
    })
    const waitFor = jest.fn().mockResolvedValue({ state: 'done' })

    useClient.mockReturnValue(buildMockClient({ query, save, launch, waitFor }))

    const { result } = renderHook(() => useNextcloudKonnector())

    await act(async () => {
      await result.current.start({
        url: 'https://nc.example.com',
        username: 'john',
        password: 'new-password'
      })
    })

    expect(save).not.toHaveBeenCalledWith(
      expect.objectContaining({ _type: 'io.cozy.triggers' })
    )
    expect(launch).toHaveBeenCalledWith(existingTrigger)
  })

  it('returns success state when job ends as done', async () => {
    const createdAccount = { _id: 'account-2' }
    const createdTrigger = { _id: 'trigger-2' }

    const query = jest
      .fn()
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
    const save = jest
      .fn()
      .mockResolvedValueOnce({ data: createdAccount })
      .mockResolvedValueOnce({ data: createdTrigger })
    const launch = jest.fn().mockResolvedValue({
      data: { _id: 'job-2', state: 'queued' }
    })
    const waitFor = jest.fn().mockResolvedValue({ state: 'done' })

    useClient.mockReturnValue(buildMockClient({ query, save, launch, waitFor }))

    const { result } = renderHook(() => useNextcloudKonnector())

    let startResult
    await act(async () => {
      startResult = await result.current.start({
        url: 'https://new.example.com',
        username: 'alice',
        password: 'pwd'
      })
    })

    expect(startResult).toEqual(
      expect.objectContaining({ success: true, error: null })
    )
    expect(result.current.success).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.jobStatus).toBe('done')
  })

  it('returns errored state and message when job ends as errored', async () => {
    const existingAccount = {
      _id: 'account-3',
      auth: { login: 'john', url: 'https://nc.example.com' }
    }
    const existingTrigger = { _id: 'trigger-3' }

    const query = jest
      .fn()
      .mockResolvedValueOnce({ data: [existingAccount] })
      .mockResolvedValueOnce({ data: [existingTrigger] })
    const save = jest.fn().mockResolvedValueOnce({ data: existingAccount })
    const launch = jest.fn().mockResolvedValue({
      data: { _id: 'job-3', state: 'queued' }
    })
    const waitFor = jest
      .fn()
      .mockResolvedValue({ state: 'errored', error: 'LOGIN_FAILED' })

    useClient.mockReturnValue(buildMockClient({ query, save, launch, waitFor }))

    const { result } = renderHook(() => useNextcloudKonnector())

    let startResult
    await act(async () => {
      startResult = await result.current.start({
        url: 'https://nc.example.com',
        username: 'john',
        password: 'bad-password'
      })
    })

    expect(startResult).toEqual(
      expect.objectContaining({
        success: false,
        error: 'start_konnector_error',
        errorMessage: 'LOGIN_FAILED'
      })
    )
    expect(result.current.success).toBe(false)
    expect(result.current.error).toBe('start_konnector_error')
    expect(result.current.errorMessage).toBe('LOGIN_FAILED')
    expect(result.current.jobStatus).toBe('errored')
  })

  it('sanitizes unexpected backend errors to UNKNOWN code', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
    const save = jest
      .fn()
      .mockResolvedValueOnce({ data: { _id: 'account-4' } })
      .mockResolvedValueOnce({ data: { _id: 'trigger-4' } })
    const launch = jest
      .fn()
      .mockRejectedValue(new Error('SECRET_BACKEND_MESSAGE'))
    const waitFor = jest.fn()

    useClient.mockReturnValue(buildMockClient({ query, save, launch, waitFor }))

    const { result } = renderHook(() => useNextcloudKonnector())

    let startResult
    await act(async () => {
      startResult = await result.current.start({
        url: 'https://nc.example.com',
        username: 'john',
        password: 'bad-password'
      })
    })

    expect(startResult).toEqual(
      expect.objectContaining({
        success: false,
        error: 'start_konnector_error',
        errorMessage: 'UNKNOWN'
      })
    )
    expect(result.current.errorMessage).toBe('UNKNOWN')
  })

  it('handles nullish form values without crashing', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
    const save = jest
      .fn()
      .mockResolvedValueOnce({ data: { _id: 'account-5' } })
      .mockResolvedValueOnce({ data: { _id: 'trigger-5' } })
    const launch = jest.fn().mockResolvedValue({
      data: { _id: 'job-5', state: 'queued' }
    })
    const waitFor = jest.fn().mockResolvedValue({ state: 'done' })

    useClient.mockReturnValue(buildMockClient({ query, save, launch, waitFor }))

    const { result } = renderHook(() => useNextcloudKonnector())

    let startResult
    await act(async () => {
      startResult = await result.current.start({
        url: undefined,
        username: null,
        password: 'pwd'
      })
    })

    expect(startResult).toEqual(
      expect.objectContaining({ success: true, error: null })
    )
  })
})
