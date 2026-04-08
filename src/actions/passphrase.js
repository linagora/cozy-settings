import { WebVaultClient } from 'cozy-keys-lib'

import { cozyFetch } from '@/actions'

export const UPDATE_PASSPHRASE = 'UPDATE_PASSPHRASE'
export const UPDATE_PASSPHRASE_SUCCESS = 'UPDATE_PASSPHRASE_SUCCESS'
export const UPDATE_PASSPHRASE_FAILURE = 'UPDATE_PASSPHRASE_FAILURE'
export const RESET_PASSPHRASE_FIELD = 'RESET_PASSPHRASE_FIELD'

// hint
export const UPDATE_HINT = 'UPDATE_HINT'
export const UPDATE_HINT_SUCCESS = 'UPDATE_HINT_SUCCESS'
export const UPDATE_HINT_FAILURE = 'UPDATE_HINT_FAILURE'

const KDF_ITERATIONS = 650000

const invalidPassphraseErrorAction = {
  type: UPDATE_PASSPHRASE_FAILURE,
  errors: {
    currentPassphrase: 'PassphraseView.current_passphrase.wrong_passphrase'
  }
}

const defaultErrorAction = {
  type: UPDATE_PASSPHRASE_FAILURE,
  errors: { global: 'PassphraseView.server_error' }
}

export const getErrorDetails = error => {
  const vaultError = error && error.response && error.response.error
  const stackError = error?.reason?.errors?.[0]?.detail

  return vaultError || stackError
}

export const isInvalidPassphrase = errorDetails => {
  const potentialErrors = ['invalid password', 'Invalid passphrase']

  return potentialErrors.includes(errorDetails)
}

const updatePassphraseFailure = error => {
  const details = getErrorDetails(error)

  if (isInvalidPassphrase(details)) {
    return invalidPassphraseErrorAction
  }

  return defaultErrorAction
}

/**
 * @param {string} currentPassphrase
 * @param {string} newPassphrase
 * @param {string} instanceURL - Must be a string usable in the `URL()` constructor
 * @returns {Promise<void>}
 */
export const updatePassphrase = (
  client,
  currentPassphrase,
  newPassphrase,
  instanceURL
) => {
  const vaultClient = new WebVaultClient(instanceURL)

  return async dispatch => {
    dispatch({ type: UPDATE_PASSPHRASE })
    try {
      await vaultClient.login(currentPassphrase)

      const newHashAndKeys = await vaultClient.computeNewHashAndKeys(
        currentPassphrase,
        newPassphrase,
        KDF_ITERATIONS
      )
      await cozyFetch(client, 'PUT', '/settings/passphrase', {
        current_passphrase: newHashAndKeys.currentPasswordHash,
        new_passphrase: newHashAndKeys.newPasswordHash,
        key: newHashAndKeys.newEncryptionKey.encryptedString,
        iterations: newHashAndKeys.kdfIterations
      })
      dispatch({ type: UPDATE_PASSPHRASE_SUCCESS })
      dispatch({ type: RESET_PASSPHRASE_FIELD })
    } catch (error) {
      const action = updatePassphraseFailure(error)

      dispatch(action)
      throw error
    }
  }
}

export const updateHint = (client, hint) => {
  return async dispatch => {
    dispatch({ type: UPDATE_HINT })

    try {
      await cozyFetch(client, 'PUT', '/settings/hint', { hint })

      dispatch({ type: UPDATE_HINT_SUCCESS })
    } catch (err) {
      dispatch({
        type: UPDATE_HINT_FAILURE,
        errors: { global: 'PassphraseView.server_error' }
      })
      throw err
    }
  }
}
