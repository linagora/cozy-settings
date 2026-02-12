import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { translate } from 'twake-i18n'

import Icon from 'cozy-ui/transpiled/react/Icon'
import CrossIcon from 'cozy-ui/transpiled/react/Icons/Cross'

import ClaudyAction from '@/services/ClaudyAction'

const MOBILE_CLIENT_KIND = 'mobile'
const DESKTOP_CLIENT_KIND = 'desktop'

const CLAUDY_ACTION_GATHER = 'gather'

export class Claudy extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openedAction: null,
      selectedAction: null,
      alreadyResized: false,
      alert: null
    }

    this.getIcon = this.getIcon.bind(this)
    this.computeSelectedActionUrl = this.computeSelectedActionUrl.bind(this)
    this.selectAction = this.selectAction.bind(this)
    this.goBack = this.goBack.bind(this)

    this.checkIcon = require('@/assets/services/icon-check.svg')
  }

  getIcon(iconName) {
    return require(`@/assets/services/claudyActions/${iconName}`)
  }

  computeSelectedActionUrl(selectedAction) {
    if (!selectedAction || !selectedAction.link) return null
    const action = selectedAction
    const { t, claudyInfos } = this.props
    if (action.link.type === 'apps' && action.link.appSlug) {
      if (!claudyInfos.apps || !claudyInfos.apps.length) {
        // eslint-disable-next-line no-console
        console.warn('No apps found on the Cozy')
        return null
      }
      const app = claudyInfos.apps.find(
        a => a.attributes.slug === action.link.appSlug
      )
      if (app && app.links && app.links.related) {
        const appUrl = `${app.links.related}${action.link.path || ''}`
        return appUrl
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `No app with slug '${action.link.appSlug}' found on the Cozy.`
        )
        return null
      }
    } else if (action.link.type === 'external') {
      const url = t(`claudy.actions.${action.slug}.link`)
      return url
    } else {
      return null
    }
  }

  consolidateActions(claudyInfos) {
    return claudyInfos.actions.map(action => {
      switch (action.slug) {
        case DESKTOP_CLIENT_KIND:
          action.complete = !!claudyInfos.devices.find(
            d => d.client_kind === DESKTOP_CLIENT_KIND
          )
          break
        case MOBILE_CLIENT_KIND:
          action.complete = !!claudyInfos.devices.find(
            d => d.client_kind === MOBILE_CLIENT_KIND
          )
          break
        case CLAUDY_ACTION_GATHER:
          action.complete = !!claudyInfos.accounts.length
          break
        default:
          action.complete = false
          break
      }
      return action
    })
  }

  selectAction(action) {
    if (
      this.state.selectedAction &&
      this.state.selectedAction.slug === action.slug
    ) {
      this.setState({ openedAction: true })
    } else {
      this.setState({ selectedAction: action, openedAction: true })
    }
  }

  goBack(alert) {
    this.setState({ openedAction: false })

    if (alert) {
      this.setState({ alert })
      // In case of alert, we reset it after 30" to make it disappear
      setTimeout(() => {
        this.setState({ alert: null })
        this.resizeDefaultClaudy()
      }, 30 * 1000)
    }
  }

  resizeClaudy(height) {
    const { service } = this.props
    const { alert } = this.state // to add automatically extra size for alert
    service.instance &&
      typeof service.instance.resizeClient === 'function' &&
      service.instance.resizeClient(
        {
          height: height + (alert ? 44 : 0)
        },
        '.2s ease-out'
      )
  }

  resizeDefaultClaudy() {
    const { claudyInfos } = this.props
    const actionsLength = claudyInfos.actions.length
    // actions.length * action{height} (64px) + header{height} (56px) + content{padding} (2 * 8px)
    this.resizeClaudy(
      (actionsLength <= 5 ? actionsLength : 5) * 64 + 56 + 2 * 8
    )
  }

  render() {
    const {
      t,
      claudyInfos,
      onClose,
      emailStatus,
      sendMessageToSupport,
      service
    } = this.props
    const { selectedAction, openedAction, alreadyResized, alert } = this.state
    const selectedActionUrl = this.computeSelectedActionUrl(selectedAction)
    const claudyActions = this.consolidateActions(claudyInfos)
    let SelectedActionComponent = null
    if (selectedAction && selectedAction.component) {
      SelectedActionComponent =
        require(`./ClaudyActionComponents${selectedAction.component}.jsx`).default
    }
    if (!alreadyResized && claudyInfos.actions.length && service.instance) {
      this.resizeDefaultClaudy() // very first resizing
      this.setState({ alreadyResized: true })
    }
    return (
      <div
        className={`coz-service-claudy ${
          openedAction ? 'coz-claudy-menu--action-selected' : ''
        }`}
      >
        <header className="coz-claudy-menu-header">
          <h2 className="coz-claudy-menu-title">{t('claudy.title')}</h2>
          <button className="coz-btn-close" onClick={onClose}>
            <Icon icon={CrossIcon} color="#95999D" width="24" height="24" />
          </button>
          <button
            className="coz-claudy-menu-header-back-button"
            onClick={() => this.goBack()}
          />
        </header>
        {alert && (
          <div
            key="coz-claudy-menu-action-description-success"
            className="coz-claudy-menu-action-description-success"
          >
            {alert}
          </div>
        )}
        <div className="coz-claudy-menu-content-wrapper">
          <div
            className="coz-claudy-menu-content"
            ref={container => {
              this.claudyContainer = container
            }}
          >
            <div className="coz-claudy-menu-actions-list">
              {claudyActions.map((action, index) => (
                <a
                  className="coz-claudy-menu-action"
                  data-complete={action.complete}
                  onClick={() => this.selectAction(action)}
                  key={index}
                >
                  <img
                    className="coz-claudy-menu-action-icon"
                    src={this.getIcon(action.icon)}
                  />
                  <p className="coz-claudy-menu-action-title">
                    {t(`claudy.actions.${action.slug}.title`)}
                  </p>
                  {action.complete && action.slug !== CLAUDY_ACTION_GATHER && (
                    <img
                      className="coz-claudy-menu-action-check"
                      src={this.checkIcon}
                    />
                  )}
                  {action.complete && action.slug === CLAUDY_ACTION_GATHER && (
                    <div className="coz-claudy-menu-action-count-wrapper">
                      <span className="coz-claudy-menu-action-count">
                        {claudyInfos.accounts.length}
                      </span>
                    </div>
                  )}
                </a>
              ))}
            </div>
            {selectedAction && !SelectedActionComponent && (
              <ClaudyAction
                action={selectedAction}
                iconSrc={this.getIcon(selectedAction.icon)}
                url={selectedActionUrl}
              />
            )}
            {SelectedActionComponent && (
              <SelectedActionComponent
                action={selectedAction}
                iconSrc={this.getIcon(selectedAction.icon)}
                url={selectedActionUrl}
                onSuccess={this.goBack}
                container={this.claudyContainer}
                resizeIntent={height => this.resizeClaudy(height)}
                resizeIntentDefault={() => this.resizeDefaultClaudy()}
                opened={openedAction}
                emailStatus={emailStatus}
                sendMessageToSupport={sendMessageToSupport}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

Claudy.propTypes = {
  claudyInfos: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  sendMessageToSupport: PropTypes.func
}

export default translate()(Claudy)
