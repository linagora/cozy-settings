import { Icon, CozyLock, CozyRelease, Right } from '@linagora/twake-icons'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import Divider from 'cozy-ui/transpiled/react/Divider'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon, {
  mediumSize,
  largeSize
} from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import { NavigationListSection } from 'cozy-ui/transpiled/react/NavigationList'
import Typography from 'cozy-ui/transpiled/react/Typography'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import withAllLocales from '../../../lib/withAllLocales'
import {
  displayPermissions,
  getPermissionIconName
} from '../helpers/permissionsHelper'

const AccessRightsSection = ({
  sortedPermissionsByName,
  t,
  isRemoteDoctypes
}) => {
  const { isDesktop } = useBreakpoints()
  const navigate = useNavigate()

  const openModal = permissionType => {
    navigate(`./details/${permissionType}`)
  }

  if (!sortedPermissionsByName || sortedPermissionsByName.length < 1) {
    return
  }
  return (
    <>
      {!isDesktop && (
        <Divider
          style={{
            height: '0.75rem',
            backgroundColor: 'var(--defaultBackgroundColor)'
          }}
        />
      )}
      <NavigationListSection>
        <ListItem ellipsis={false}>
          <ListItemIcon>
            <Icon
              icon={isRemoteDoctypes ? CozyRelease : CozyLock}
              size={largeSize}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography type="body2" style={{ fontWeight: 'bold' }}>
                {isRemoteDoctypes
                  ? t('Permissions.exit_rights')
                  : t('Permissions.limited_right_access')}
              </Typography>
            }
            secondary={
              isRemoteDoctypes
                ? t('Permissions.exit_rights_secondary')
                : t('Permissions.limited_right_access_secondary')
            }
          />
        </ListItem>
        <Divider />
        {sortedPermissionsByName.map(({ name, title, verbs, type }, index) => {
          const iconName = getPermissionIconName(type)
          return (
            <div key={name}>
              <ListItem button onClick={() => openModal(type)} ellipsis={false}>
                <ListItemIcon>
                  <Icon
                    icon={require('@linagora/twake-icons')[iconName]}
                    size={mediumSize}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={title}
                  secondary={t(displayPermissions(verbs))}
                />
                <Icon icon={Right} />
              </ListItem>
              {index !== sortedPermissionsByName.length - 1 && (
                <Divider variant="inset" />
              )}
            </div>
          )
        })}
      </NavigationListSection>
    </>
  )
}

export default withAllLocales(AccessRightsSection)
