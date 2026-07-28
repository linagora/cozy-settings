import { Icon } from '@linagora/twake-icons'
import React from 'react'

import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

interface MenuItemButtonProps {
  icon: () => JSX.Element
  onClick: () => void
  primary: string
  secondary?: string
}

export const MenuItemButton = ({
  icon,
  primary,
  secondary,
  onClick
}: MenuItemButtonProps): JSX.Element => (
  <ListItem button onClick={onClick}>
    <ListItemIcon>
      <Icon icon={icon} />
    </ListItemIcon>

    <ListItemText ellipsis={false} primary={primary} secondary={secondary} />
  </ListItem>
)
