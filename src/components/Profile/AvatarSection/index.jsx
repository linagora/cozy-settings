import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import { useClient } from 'cozy-client'
import Avatar from 'cozy-ui/transpiled/react/Avatar'
import EditBadge from 'cozy-ui/transpiled/react/EditBadge'

import { uploadAvatar, deleteAvatar } from './helpers'

const AvatarSection = () => {
  const client = useClient()
  const { t } = useI18n()
  const rootURL = client.getStackClient().uri
  const [deletedAt, setDeletedAt] = useState(Date.now)

  const getAvatarSrc = timestamp =>
    `${rootURL}/public/avatar?t=${timestamp}&fallback=initials`

  const handleDelete = async () => {
    await deleteAvatar(client)
    setDeletedAt(Date.now())
  }

  return (
    <EditBadge
      src={getAvatarSrc}
      onUpload={file => uploadAvatar(client, file)}
      onDelete={handleDelete}
      componentsProps={{
        button: { 'aria-label': t('Accessibility.edit_avatar') }
      }}
    >
      {/* EditBadge gives no src once deleted, but the stack serves the initials */}
      <Avatar size={94} alt="Avatar" src={getAvatarSrc(deletedAt)} />
    </EditBadge>
  )
}

export default AvatarSection
