import React, { Component } from 'react'
import { translate } from 'twake-i18n'

import Button from 'cozy-ui/transpiled/react/Buttons'
import Checkbox from 'cozy-ui/transpiled/react/Checkbox'
import Icon from 'cozy-ui/transpiled/react/Icon'
import PaperplaneIcon from 'cozy-ui/transpiled/react/Icons/Paperplane'

export class Support extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hideContent: false, // to avoid scrollbar in actions list view
      message: '',
      consent: false
    }
    this.sendMessage = this.sendMessage.bind(this)
    this.handleConsentChange = this.handleConsentChange.bind(this)
  }

  componentDidMount() {
    this.onOpen()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.opened !== this.props.opened) {
      nextProps.opened ? this.onOpen() : this.onReturn()
    }

    // if message successfully sent
    if (
      nextProps.emailStatus.isSent &&
      this.props.emailStatus.isSending &&
      !this.props.emailStatus.isSent
    ) {
      this.setState({ message: '', consent: false })
      // usually go back on success
      this.props.onSuccess(this.props.t('claudy.actions.support.success'))
    }
  }

  onOpen() {
    this.props.resizeIntent(32 * 16) // 32em
    this.setState({ hideContent: false })
    const listenerToFocus = e => {
      if (e.propertyName === 'transform') {
        if (this.messageInput && this.messageInput.focus)
          this.messageInput.focus()
        e.target.removeEventListener('transitionend', listenerToFocus)
      }
    }
    this.props.container.addEventListener(
      'transitionend',
      listenerToFocus,
      false
    )
  }

  onReturn() {
    this.props.resizeIntentDefault()
    const listenerToHide = e => {
      if (e.propertyName === 'transform') {
        this.setState({ hideContent: true })
        e.target.removeEventListener('transitionend', listenerToHide)
      }
    }
    this.props.container.addEventListener(
      'transitionend',
      listenerToHide,
      false
    )
  }

  sendMessage() {
    const message = `${this.state.message}\n\n${
      this.state.consent
        ? this.props.t('support.response_email.allowConsent')
        : ''
    }`
    this.props.sendMessageToSupport(message)
  }

  handleConsentChange() {
    this.setState({ consent: !this.state.consent })
  }

  render() {
    const { t, iconSrc, emailStatus } = this.props
    const { hideContent, message } = this.state
    const { isSent, isSending, error } = emailStatus
    return (
      <div className="coz-claudy-menu-action-description coz-claudy-menu-action--support">
        <div className="coz-claudy-menu-action-description-header">
          <img className="coz-claudy-menu-action-icon" src={iconSrc} />
          <p className="coz-claudy-menu-action-title">
            {t(`claudy.actions.support.description`)}
          </p>
        </div>
        {!hideContent && (
          <div className="coz-claudy-menu-action-description-content coz-form">
            <label className="coz-form-label">
              {t('claudy.actions.support.fields.message.title')}
              <textarea
                className="set-services-claudy-textarea"
                value={message}
                ref={input => {
                  this.messageInput = input
                }}
                placeholder={t(
                  'claudy.actions.support.fields.message.placeholder'
                )}
                onChange={e => {
                  this.setState({ message: e.target.value })
                }}
              />
            </label>
            <Checkbox
              checked={this.state.consent}
              className="u-mt-1"
              label={t('support.fields.consent.label')}
              onChange={this.handleConsentChange}
            />
            {((!isSent && !isSending && !error) ||
              (isSent && !isSending && !error)) && (
              <p className="coz-claudy-menu-action-description-detail">
                {t('claudy.actions.support.emailDetail')}
              </p>
            )}
            {!isSending && error && (
              <p className="coz-claudy-menu-action-description-error">
                {error.i18n && `${t(error.i18n)}`}
                {error.message &&
                  `${t('claudy.actions.support.error')} : ${error.message}`}
                {!error.i18n &&
                  !error.message &&
                  t('claudy.actions.support.error')}
              </p>
            )}
            {isSending && (
              <p className="coz-claudy-menu-action-description-detail">
                {t('claudy.actions.support.sending')}
              </p>
            )}
            <Button
              onClick={() => this.sendMessage()}
              disabled={!message}
              busy={isSending}
              startIcon={<Icon icon={PaperplaneIcon} />}
              label={t('claudy.actions.support.button')}
            />
          </div>
        )}
      </div>
    )
  }
}

export default translate()(Support)
