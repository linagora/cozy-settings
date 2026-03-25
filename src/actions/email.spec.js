import { createMockClient } from 'cozy-client/dist/mock'

import { sendMessageToSupport } from './email'
import { cozyFetch } from './index'
import createStore from '../store'

jest.mock('./index', () => {
  const actions = jest.requireActual('./index')
  return {
    ...actions,
    cozyFetch: jest.fn()
  }
})

jest.mock('./domUtils', () => ({
  getStackDomain: () => 'http://cozy.tools:8080',
  getStackToken: () => 'fake-token'
}))

describe('send email', () => {
  const setup = () => {
    const client = createMockClient({
      uri: 'http://cozy.tools:8080'
    })
    const store = createStore(client)
    jest.spyOn(store, 'dispatch')
    return { store, client }
  }

  it('should send an email and wait for completion', async () => {
    const { store, client } = setup()

    cozyFetch.mockResolvedValue({
      data: {
        attributes: {
          state: 'done'
        }
      }
    })

    const mockJobCollection = {
      create: jest.fn().mockResolvedValue({
        data: { attributes: { _id: 'job-id-0' } }
      })
    }

    client.collection = type => {
      if (type === 'io.cozy.jobs') {
        return mockJobCollection
      } else {
        throw new Error(`${type} collection is not mocked in email.spec.js`)
      }
    }

    const t = key => key
    const message = 'Test'
    await store.dispatch(sendMessageToSupport(client, message, t))

    // Two jobs are created, one to send the email to the support and one
    // to acknowledge the support request to the user
    expect(mockJobCollection.create).toHaveBeenCalledTimes(2)
  })
})
