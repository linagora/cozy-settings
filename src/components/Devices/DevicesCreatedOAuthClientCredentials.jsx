import React from 'react'

import Typography from 'cozy-ui/transpiled/react/Typography'

import Input from '@/components/Input'

const DevicesCreatedOAuthClientCredentials = ({ t, created }) => {
  return (
    <>
      <Typography className="u-mb-1">
        {t('createOAuthClient.success_description')}
      </Typography>

      <Input
        name="client_id"
        type="client_id"
        title={t('createOAuthClient.client_id')}
        value={created.clientId}
        copyable={true}
        readOnly
      />

      {created.clientSecret && (
        <Input
          name="client_secret"
          type="client_secret"
          title={t('createOAuthClient.client_secret')}
          value={created.clientSecret}
          copyable={true}
          readOnly
        />
      )}
    </>
  )
}

export default DevicesCreatedOAuthClientCredentials
