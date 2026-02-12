import compose from 'lodash/flowRight'
import { connect } from 'react-redux'
import { translate } from 'twake-i18n'

import { withClient } from 'cozy-client'
import Alerter from 'cozy-ui/transpiled/react/deprecated/Alerter'

import { fetchSessions, deleteOtherSessions } from '@/actions'
import SessionsView from '@/components/SessionsView'

const mapStateToProps = state => ({
  sessions: state.sessions,
  isFetching: state.ui.isFetching
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchSessions: () => {
    const { t, client } = ownProps
    dispatch(fetchSessions(client)).catch(() =>
      Alerter.error(t('SessionsView.infos.server_error'))
    )
  },
  deleteOtherSessions: async () => {
    const { t, client } = ownProps
    try {
      await dispatch(deleteOtherSessions(client))
      Alerter.success(t('SessionsView.infos.sessions_deleted'))
    } catch (error) {
      Alerter.error(t('SessionsView.infos.server_error'))
    }
  }
})

export default compose(
  translate(),
  withClient,
  connect(mapStateToProps, mapDispatchToProps)
)(SessionsView)
