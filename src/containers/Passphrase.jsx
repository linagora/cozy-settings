import compose from 'lodash/flowRight'
import React from 'react'
import { connect } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { translate } from 'twake-i18n'

import { withClient } from 'cozy-client'
import Alerter from 'cozy-ui/transpiled/react/deprecated/Alerter'

import {
  updatePassphrase,
  updatePassphrase2FAFirst,
  updatePassphrase2FASecond,
  updateHint
} from '@/actions/passphrase'
import PassphraseView from '@/components/PassphraseView'

const mapStateToProps = state => ({
  passphrase: state.passphrase
})

const showSuccess = t => {
  Alerter.success(t('PassphraseView.success'))
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onPassphraseSimpleSubmit: async (currentPassphrase, newPassphrase, hint) => {
    try {
      await dispatch(updateHint(ownProps.client, hint))
      await dispatch(
        updatePassphrase(
          ownProps.client,
          currentPassphrase,
          newPassphrase,
          ownProps.client.getStackClient().uri
        )
      )
      showSuccess(ownProps.t)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  },
  onPassphrase2FAStep1: async currentPassphrase => {
    try {
      await dispatch(
        updatePassphrase2FAFirst(
          ownProps.client,
          currentPassphrase,
          ownProps.client.getStackClient().uri
        )
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  },
  onPassphrase2FAStep2: async (
    currentPassphrase,
    newPassphrase,
    twoFactorCode,
    twoFactorToken,
    hint
  ) => {
    try {
      await dispatch(updateHint(ownProps.client, hint))
      await dispatch(
        updatePassphrase2FASecond(
          ownProps.client,
          currentPassphrase,
          newPassphrase,
          twoFactorCode,
          twoFactorToken,
          ownProps.client.getStackClient().uri
        )
      )
      showSuccess(ownProps.t)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }
})

const ComposedPassphrase = compose(
  translate(),
  withClient,
  connect(mapStateToProps, mapDispatchToProps)
)(PassphraseView)

const PassphraseWithLocation = props => {
  const location = useLocation()
  return <ComposedPassphrase {...props} location={location} />
}

export default PassphraseWithLocation
