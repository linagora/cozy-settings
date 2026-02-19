import React from 'react'

import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

const DevicesCreateOAuthClientForm = ({
  t,
  errorMessage,
  clientName,
  onClientNameChange,
  redirectUri,
  onRedirectUriChange,
  clientKind,
  onClientKindChange,
  softwareId,
  onSoftwareIdChange
}) => {
  return (
    <>
      {errorMessage && (
        <div className="u-bg-errorBackground u-p-1 u-mb-1">
          <Typography variant="body2">{errorMessage}</Typography>
        </div>
      )}
      <Typography className="u-mb-1">
        {t('createOAuthClient.description')}
      </Typography>
      <TextField
        label={t('createOAuthClient.client_name')}
        value={clientName}
        placeholder="My App"
        onChange={event => onClientNameChange(event.target.value)}
        fullWidth
      />
      <TextField
        className="u-mt-1"
        label={t('createOAuthClient.redirect_uri')}
        value={redirectUri}
        placeholder="https://app.example.com/oauth/callback"
        onChange={event => onRedirectUriChange(event.target.value)}
        fullWidth
      />
      <TextField
        className="u-mt-1"
        label={t('createOAuthClient.client_kind')}
        value={clientKind}
        placeholder="web"
        onChange={event => onClientKindChange(event.target.value)}
        fullWidth
      />
      <TextField
        className="u-mt-1"
        label={t('createOAuthClient.software_id')}
        value={softwareId}
        placeholder="webapp"
        onChange={event => onSoftwareIdChange(event.target.value)}
        fullWidth
      />
    </>
  )
}

export default DevicesCreateOAuthClientForm
