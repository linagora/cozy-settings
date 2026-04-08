import { combineReducers } from 'redux'

import {
  UPDATE_PASSPHRASE,
  UPDATE_PASSPHRASE_SUCCESS,
  UPDATE_PASSPHRASE_FAILURE,
  RESET_PASSPHRASE_FIELD,
  UPDATE_HINT,
  UPDATE_HINT_SUCCESS,
  UPDATE_HINT_FAILURE
} from '@/actions/passphrase'

const submitting = (state = false, action) => {
  switch (action.type) {
    case UPDATE_PASSPHRASE:
    case UPDATE_HINT:
      return true
    case UPDATE_PASSPHRASE_SUCCESS:
    case UPDATE_PASSPHRASE_FAILURE:
    case RESET_PASSPHRASE_FIELD:
      return false
    default:
      return state
  }
}

const saved = (state = false, action) => {
  switch (action.type) {
    case UPDATE_PASSPHRASE_SUCCESS:
      return true
    case RESET_PASSPHRASE_FIELD:
      return false
    default:
      return state
  }
}

const errors = (state = null, action) => {
  switch (action.type) {
    case UPDATE_PASSPHRASE:
    case UPDATE_PASSPHRASE_SUCCESS:
    case UPDATE_HINT_SUCCESS:
      return null
    case UPDATE_PASSPHRASE_FAILURE:
    case UPDATE_HINT_FAILURE:
      return action.errors
    default:
      return state
  }
}

const passphrase = combineReducers({
  submitting,
  saved,
  errors
})

export default passphrase
