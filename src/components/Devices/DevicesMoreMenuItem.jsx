import { Icon } from '@linagora/twake-icons'
import React from 'react'

import ActionsMenuItem from 'cozy-ui/transpiled/react/ActionsMenu/ActionsMenuItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import Typography from 'cozy-ui/transpiled/react/Typography'

const DevicesMoreMenuItem = ({ icon, color, text, ...props }) => (
  <ActionsMenuItem {...props}>
    <ListItemIcon>
      <Icon icon={icon} color={`var(--${color}Color)`} />
    </ListItemIcon>
    <Typography
      variant="body1"
      color={color}
      style={{
        textTransform: 'capitalize'
      }}
    >
      {text}
    </Typography>
  </ActionsMenuItem>
)

export { DevicesMoreMenuItem }
