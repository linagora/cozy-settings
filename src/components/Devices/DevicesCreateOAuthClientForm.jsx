import React, { useCallback } from 'react'

import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

import RedirectUriInput from '@/components/Devices/RedirectUriInput'

const DevicesCreateOAuthClientForm = ({
  t,
  errorMessage,
  clientName,
  onClientNameChange,
  redirectUris,
  onRedirectUrisChange,
  generateRedirectUriId,
  clientKind,
  onClientKindChange,
  softwareId,
  onSoftwareIdChange
}) => {
  const handleRedirectUriChange = useCallback(
    (id, value) => {
      onRedirectUrisChange(
        redirectUris.map(item =>
          item.id === id ? { ...item, uri: value } : item
        )
      )
    },
    [onRedirectUrisChange, redirectUris]
  )

  const handleAddRedirectUri = useCallback(() => {
    onRedirectUrisChange([
      ...redirectUris,
      { id: generateRedirectUriId(), uri: '' }
    ])
  }, [generateRedirectUriId, onRedirectUrisChange, redirectUris])

  const handleRemoveRedirectUri = useCallback(
    id => {
      onRedirectUrisChange(redirectUris.filter(item => item.id !== id))
    },
    [onRedirectUrisChange, redirectUris]
  )

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
        placeholder={t('createOAuthClient.client_name_placeholder')}
        onChange={event => onClientNameChange(event.target.value)}
        fullWidth
      />

      {redirectUris.map((item, index) => (
        <RedirectUriInput
          key={item.id}
          t={t}
          item={item}
          showRemove={showRemove}
          showAdd={index === 0}
          onChange={handleRedirectUriChange}
          onRemove={handleRemoveRedirectUri}
          onAdd={handleAddRedirectUri}
        />
      ))}

      <TextField
        className="u-mt-1"
        variant="outlined"
        label={t('createOAuthClient.client_kind')}
        value={clientKind}
        placeholder={t('createOAuthClient.client_kind_placeholder')}
        onChange={event => onClientKindChange(event.target.value)}
        fullWidth
      />

      <TextField
        className="u-mt-1"
        variant="outlined"
        label={t('createOAuthClient.software_id')}
        value={softwareId}
        placeholder={t('createOAuthClient.software_id_placeholder')}
        onChange={event => onSoftwareIdChange(event.target.value)}
        fullWidth
      />
    </>
  )
}

export default DevicesCreateOAuthClientForm
