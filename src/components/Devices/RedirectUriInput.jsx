import React from 'react'

import Icon from 'cozy-ui/transpiled/react/Icon'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import PlusIcon from 'cozy-ui/transpiled/react/Icons/Plus'
import TrashIcon from 'cozy-ui/transpiled/react/Icons/Trash'
import TextField from 'cozy-ui/transpiled/react/TextField'

const RedirectUriInput = ({
  t,
  item,
  showRemove,
  showAdd,
  onChange,
  onRemove,
  onAdd
}) => {
  return (
    <div className="u-mt-1 u-flex u-flex-items-start">
      <div className="u-flex-grow-1">
        <TextField
          variant="outlined"
          label={t('createOAuthClient.redirect_uri')}
          value={item.uri}
          placeholder="https://app.example.com/oauth/callback"
          onChange={event => onChange(item.id, event.target.value)}
          fullWidth
        />
      </div>

      <div className="u-pt-half u-ml-half u-flex u-flex-justify-center">
        {showRemove && (
          <IconButton
            color="error"
            aria-label={t('createOAuthClient.remove_redirect_uri')}
            onClick={() => onRemove(item.id)}
          >
            <Icon icon={TrashIcon} />
          </IconButton>
        )}
      </div>

      <div className="u-pt-half u-ml-half u-flex u-flex-justify-center">
        {showAdd && (
          <IconButton
            color="primary"
            aria-label={t('createOAuthClient.add_redirect_uri')}
            onClick={onAdd}
          >
            <Icon icon={PlusIcon} />
          </IconButton>
        )}
      </div>
    </div>
  )
}

export default RedirectUriInput
