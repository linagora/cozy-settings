import { Icon } from '@linagora/twake-icons'
import React from 'react'

import Typography from 'cozy-ui/transpiled/react/Typography'
import { ActionMenuItem } from 'cozy-ui/transpiled/react/deprecated/ActionMenu'

const DevicesMoreMenuItem = ({ onClick, icon, color, text, className }) => (
  <ActionMenuItem
    className={className}
    onClick={onClick}
    left={<Icon icon={icon} color={`var(--${color}Color)`} />}
  >
    <Typography
      variant="body1"
      color={color}
      style={{
        textTransform: 'capitalize'
      }}
      className="u-ml-half"
    >
      {text}
    </Typography>
  </ActionMenuItem>
)

export { DevicesMoreMenuItem }
