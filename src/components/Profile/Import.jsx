import React, { Component } from 'react'
import { translate } from 'twake-i18n'

import Buttons from 'cozy-ui/transpiled/react/Buttons'
import {
  IllustrationDialog,
  ConfirmDialog
} from 'cozy-ui/transpiled/react/CozyDialogs'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

import { STACK_DOMAIN } from '@/actions'
import importImage from '@/assets/images/import-cozy.svg?url'
import ReactMarkdownWrapper from '@/components/ReactMarkdownWrapper'

class Import extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayModal: false,
      displayConfirmation: false,
      url: ''
    }
    this.toggleModal = this.toggleModal.bind(this)
    this.toggleConfirmation = this.toggleConfirmation.bind(this)
    this.setURL = this.setURL.bind(this)
    this.precheckImport = this.precheckImport.bind(this)
    this.submitImport = this.submitImport.bind(this)
  }

  toggleModal() {
    this.setState(currentState => ({
      displayModal: !currentState.displayModal
    }))
  }

  toggleConfirmation() {
    this.setState(currentState => ({
      displayConfirmation: !currentState.displayConfirmation
    }))
  }

  setURL(event) {
    this.setState({ url: event.target.value })
  }

  async precheckImport() {
    try {
      await this.props.precheckImport(this.state.url)
      this.setState({ displayConfirmation: true })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  async submitImport() {
    try {
      let redirect = await this.props.submitImport(this.state.url)
      window.location = redirect
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  render() {
    const { t, importData } = this.props
    const { displayModal, displayConfirmation } = this.state
    return (
      <>
        <div>
          <Buttons
            onClick={this.toggleModal}
            label={t('ProfileView.import.link')}
            variant="secondary"
          />
        </div>
        {displayModal && (
          <IllustrationDialog
            open={displayModal}
            onClose={this.toggleModal}
            title={
              <div className="u-flex u-flex-column u-flex-items-center">
                <img
                  className="u-maw-4 u-mb-1"
                  alt={t('ProfileView.import.modal.title')}
                  src={importImage}
                />
                {t('ProfileView.import.modal.title')}
              </div>
            }
            content={
              <>
                <ReactMarkdownWrapper
                  source={t('ProfileView.import.modal.description')}
                />
                <TextField
                  required
                  error={!!importData.error}
                  autoFocus
                  onChange={this.setURL}
                  label={t('ProfileView.import.url.label')}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                {importData.error && (
                  <Typography variant="body1" className="u-error">
                    {t(importData.error)}
                  </Typography>
                )}
              </>
            }
            actions={
              <>
                <Buttons
                  variant="secondary"
                  theme="secondary"
                  onClick={this.toggleModal}
                  label={t('ProfileView.import.modal.cancel')}
                />
                <Buttons
                  theme="primary"
                  onClick={this.precheckImport}
                  busy={importData.checking}
                  disabled={importData.checking}
                  label={t('ProfileView.import.modal.CTA')}
                />
              </>
            }
          />
        )}

        {displayConfirmation && (
          <ConfirmDialog
            title={t('ProfileView.import.confirmation.title')}
            open={displayConfirmation}
            onClose={this.toggleConfirmation}
            content={
              <>
                <ReactMarkdownWrapper
                  source={t('ProfileView.import.confirmation.description', {
                    url: STACK_DOMAIN.replace('//', '')
                  })}
                />
                {importData.error && (
                  <Typography variant="body1" className="u-error">
                    {t(importData.error)}
                  </Typography>
                )}
              </>
            }
            actions={
              <>
                <Buttons
                  variant="secondary"
                  onClick={this.toggleConfirmation}
                  label={t('ProfileView.import.confirmation.cancel')}
                />
                <Buttons
                  color="error"
                  onClick={this.submitImport}
                  busy={importData.submitting}
                  disabled={importData.submitting}
                  label={t('ProfileView.import.confirmation.CTA')}
                />
              </>
            }
          />
        )}
      </>
    )
  }
}

export default translate()(Import)
