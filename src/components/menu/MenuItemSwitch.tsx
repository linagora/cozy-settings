import { Icon } from '@linagora/twake-icons'
import React from 'react'

import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import Switch from 'cozy-ui/transpiled/react/Switch'

interface MenuItemSwitchProps {
  checked?: boolean
  disabled?: boolean
  icon: () => JSX.Element
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  primary: string
  secondary?: string
}

export const MenuItemSwitch = ({
  checked,
  disabled,
  icon,
  onClick,
  primary,
  secondary
}: MenuItemSwitchProps): JSX.Element => (
  <ListItem button onClick={onClick} disabled={disabled} ellipsis={false}>
    <ListItemIcon>
      <Icon icon={icon} />
    </ListItemIcon>

    <ListItemText primary={primary} secondary={secondary} />

    <Switch checked={checked} color="primary" />
  </ListItem>
)
