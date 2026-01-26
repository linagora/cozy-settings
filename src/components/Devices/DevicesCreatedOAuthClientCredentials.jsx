import React from 'react'

import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import CheckIcon from 'cozy-ui/transpiled/react/Icons/Check'
import CopyIcon from 'cozy-ui/transpiled/react/Icons/Copy'
import TextField from 'cozy-ui/transpiled/react/TextField'
import Typography from 'cozy-ui/transpiled/react/Typography'

const DevicesCreatedOAuthClientCredentials = ({
  t,
  created,
  copiedField,
  onCopy
}) => {
  return (
    <>
      <Typography className="u-mb-1">
        {t('createOAuthClient.success_description')}
      </Typography>

      <div className="u-flex u-flex-items-center u-mb-1">
        <div className="u-flex-grow-1">
          <TextField
            label={t('createOAuthClient.client_id')}
            value={created.clientId}
            readOnly
            fullWidth
          />
        </div>
        <IconButton
          className={
            'u-ml-half u-mt-1' +
            (copiedField === 'clientId' ? ' u-bg-successBackground' : '')
          }
          size="small"
          onClick={() => onCopy('clientId', created.clientId)}
        >
          <Icon icon={copiedField === 'clientId' ? CheckIcon : CopyIcon} />
        </IconButton>
      </div>

      {created.clientSecret && (
        <div className="u-flex u-flex-items-center">
          <div className="u-flex-grow-1">
            <TextField
              className="u-mt-1"
              label={t('createOAuthClient.client_secret')}
              value={created.clientSecret}
              readOnly
              fullWidth
            />
          </div>
          <IconButton
            className={
              'u-ml-half u-mt-1' +
              (copiedField === 'clientSecret' ? ' u-bg-successBackground' : '')
            }
            size="small"
            onClick={() => onCopy('clientSecret', created.clientSecret)}
          >
            <Icon
              icon={copiedField === 'clientSecret' ? CheckIcon : CopyIcon}
            />
          </IconButton>
        </div>
      )}
    </>
  )
}

export default DevicesCreatedOAuthClientCredentials
