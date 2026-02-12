import compose from 'lodash/flowRight'
import { connect } from 'react-redux'
import { translate } from 'twake-i18n'

import { withClient } from 'cozy-client'

import { fetchInfos } from '@/actions'
import { sendMessageToSupport } from '@/actions/email'
import { fetchClaudyInfos, createIntentService } from '@/actions/services'
import IntentView from '@/components/IntentView'

const mapStateToProps = state => ({
  claudy: state.claudy,
  service: state.service,
  emailStatus: state.emailStatus
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  createIntentService: (intent, window) => {
    dispatch(createIntentService(intent, window))
  },
  fetchClaudy: () => {
    dispatch(fetchClaudyInfos(ownProps.client))
  },
  fetchInfos: () => {
    dispatch(fetchInfos())
  },
  sendMessageToSupport: message => {
    dispatch(sendMessageToSupport(ownProps.client, message, ownProps.t))
  }
})

export default compose(
  translate(),
  withClient,
  connect(mapStateToProps, mapDispatchToProps)
)(IntentView)
