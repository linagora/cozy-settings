import {
  SEND_EMAIL,
  SEND_EMAIL_SUCCESS,
  SEND_EMAIL_FAILURE
} from '../actions/email'
import emailStatusReducer from './emailStatus'

describe('emailStatus reducer', () => {
  it('should return the initial state', () => {
    expect(emailStatusReducer(undefined, {})).toEqual({
      error: null,
      isSending: false,
      isSent: false
    })
  })

  it('should send an email', () => {
    let state = emailStatusReducer(undefined, { type: SEND_EMAIL })
    expect(state).toEqual({
      error: null,
      isSending: true,
      isSent: false
    })

    state = emailStatusReducer(state, { type: SEND_EMAIL_SUCCESS })
    expect(state).toEqual({
      error: null,
      isSending: false,
      isSent: true
    })
  })

  it('should handle errors', () => {
    let state = emailStatusReducer(undefined, { type: SEND_EMAIL })
    expect(state).toEqual({
      error: null,
      isSending: true,
      isSent: false
    })

    state = emailStatusReducer(state, {
      type: SEND_EMAIL_FAILURE,
      error: 'No flux capacitator'
    })
    expect(state).toEqual({
      error: 'No flux capacitator',
      isSending: false,
      isSent: false
    })
  })
})
