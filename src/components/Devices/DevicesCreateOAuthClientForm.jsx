import React from 'react'

import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import PlusIcon from 'cozy-ui/transpiled/react/Icons/Plus'
import TrashIcon from 'cozy-ui/transpiled/react/Icons/Trash'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

const DevicesCreateOAuthClientForm = ({
  t,
  errorMessage,
  clientName,
  onClientNameChange,
  redirectUris,
  onRedirectUrisChange,
  clientKind,
  onClientKindChange,
  softwareId,
  onSoftwareIdChange
}) => {
  const handleRedirectUriChange = (index, value) => {
    const next = [...redirectUris]
    next[index] = value
    onRedirectUrisChange(next)
  }

  const handleAddRedirectUri = () => {
    onRedirectUrisChange([...redirectUris, ''])
  }

  const handleRemoveRedirectUri = index => {
    if (redirectUris.length <= 1) return
    onRedirectUrisChange(redirectUris.filter((_, i) => i !== index))
  }

  const showRemove = redirectUris.length > 1

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
        variant="outlined"
        label={t('createOAuthClient.client_name')}
        value={clientName}
        placeholder="My App"
        onChange={event => onClientNameChange(event.target.value)}
        fullWidth
      />

      {redirectUris.map((uri, index) => (
        <div
          key={index}
          className="u-mt-1"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 40px 40px',
            columnGap: '4px',
            alignItems: 'start',
            width: '100%'
          }}
        >
          <TextField
            variant="outlined"
            label={t('createOAuthClient.redirect_uri')}
            value={uri}
            placeholder="https://app.example.com/oauth/callback"
            onChange={event =>
              handleRedirectUriChange(index, event.target.value)
            }
            fullWidth
          />

          <div
            style={{ paddingTop: '6px' }}
            className="u-flex u-flex-justify-center"
          >
            {showRemove ? (
              <IconButton
                color="error"
                aria-label={t('createOAuthClient.remove_redirect_uri')}
                onClick={() => handleRemoveRedirectUri(index)}
              >
                <Icon icon={TrashIcon} />
              </IconButton>
            ) : null}
          </div>

          <div
            style={{ paddingTop: '6px' }}
            className="u-flex u-flex-justify-center"
          >
            {index === 0 ? (
              <IconButton
                color="primary"
                aria-label={t('createOAuthClient.add_redirect_uri')}
                onClick={handleAddRedirectUri}
              >
                <Icon icon={PlusIcon} />
              </IconButton>
            ) : null}
          </div>
        </div>
      ))}

      <TextField
        className="u-mt-1"
        variant="outlined"
        label={t('createOAuthClient.client_kind')}
        value={clientKind}
        placeholder="web"
        onChange={event => onClientKindChange(event.target.value)}
        fullWidth
      />

      <TextField
        className="u-mt-1"
        variant="outlined"
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
