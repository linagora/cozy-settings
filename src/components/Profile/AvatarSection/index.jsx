import React from 'react'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import Avatar from 'cozy-ui/transpiled/react/Avatar'
import EditBadge from 'cozy-ui/transpiled/react/EditBadge'

import { uploadAvatar, deleteAvatar } from './helpers'

const AvatarSection = () => {
  const client = useClient()
  const { t } = useI18n()
  const rootURL = client.getStackClient().uri

  return (
    <EditBadge
      src={timestamp =>
        `${rootURL}/public/avatar?t=${timestamp}&fallback=initials`
      }
      onUpload={file => uploadAvatar(client, file)}
      onDelete={() => deleteAvatar(client)}
      componentsProps={{
        button: { 'aria-label': t('Accessibility.edit_avatar') }
      }}
    >
      <Avatar size={94} alt="Avatar" />
    </EditBadge>
  )
}

export default AvatarSection
