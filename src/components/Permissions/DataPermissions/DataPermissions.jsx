import { Icon, Previous, Right } from '@linagora/twake-icons'
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Divider from 'cozy-ui/transpiled/react/Divider'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemIcon, {
  smallSize,
  mediumSize
} from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemSecondaryAction from 'cozy-ui/transpiled/react/ListItemSecondaryAction'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import NavigationList, {
  NavigationListSection
} from 'cozy-ui/transpiled/react/NavigationList'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Typography from 'cozy-ui/transpiled/react/Typography'
import AppIcon from 'cozy-ui-plus/dist/AppIcon'

import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import {
  getPermissionsVerbsByType,
  completePermission,
  displayPermissions,
  getPermissionIconName
} from '@/components/Permissions/helpers/permissionsHelper'
import useAppsOrKonnectors from '@/components/Permissions/hooks/useAppsOrKonnectors'
import withAllLocales from '@/lib/withAllLocales'

const DataPermissions = ({ t }) => {
  const { permissionType } = useParams()
  const navigate = useNavigate()

  const { isResultLoading, hasQueryFailed, appsResult, konnectorsResult } =
    useAppsOrKonnectors()

  // Compute permissions
  const appsAndKonnectorsSlugs = completePermission(
    appsResult,
    konnectorsResult
  )[permissionType]

  const appsAndKonnectors = []

  if (appsAndKonnectorsSlugs?.length > 0) {
    for (let i = 0; i < appsAndKonnectorsSlugs.length; i++) {
      const appToAdd = appsResult.data.find(
        app => app.slug === appsAndKonnectorsSlugs[i]
      )
      if (appToAdd) {
        appsAndKonnectors.push(appToAdd)
      }

      const konnectorToAdd = konnectorsResult.data.find(
        konnector => konnector.slug === appsAndKonnectorsSlugs[i]
      )
      if (konnectorToAdd) {
        appsAndKonnectors.push(konnectorToAdd)
      }
    }
  }

  const iconName = getPermissionIconName(permissionType)

  const openModal = slug => {
    navigate(`./details/${slug}`)
  }

  return (
    <Page narrow>
      {isResultLoading ? (
        <Spinner size="large" className="u-flex u-flex-justify-center u-mt-1" />
      ) : hasQueryFailed ? (
        <Typography variant="body1" className="u-mb-1-half">
          {t('Permissions.failedRequest')}
        </Typography>
      ) : (
        <>
          <IconButton className="u-mr-half" href="#/permissions/data">
            <Icon icon={Previous} size={16} />
          </IconButton>
          <div style={{ textAlign: 'center' }}>
            <Icon
              icon={require('@linagora/twake-icons')[iconName]}
              size={mediumSize}
            />
            <PageTitle backButtonPath="/permissions/data">
              {t('CozyPermissions.' + permissionType).toUpperCase()}
            </PageTitle>
            <Typography variant="body1" className="u-mb-1-half">
              {t('Permissions.access') +
                ' ' +
                t('CozyPermissions.' + permissionType).toLowerCase()}
            </Typography>
          </div>
          <NavigationList>
            <NavigationListSection>
              {appsAndKonnectors
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((appOrKonnector, index) => {
                  return (
                    <div key={appOrKonnector.name}>
                      <ListItem
                        button
                        onClick={() => openModal(appOrKonnector.slug)}
                        ellipsis={false}
                      >
                        <ListItemIcon>
                          <AppIcon app={appOrKonnector} />
                        </ListItemIcon>
                        <ListItemText
                          primary={appOrKonnector.name}
                          secondary={t(
                            displayPermissions(
                              getPermissionsVerbsByType(
                                appOrKonnector.permissions,
                                permissionType
                              )
                            )
                          )}
                        />
                        <ListItemSecondaryAction>
                          <Icon
                            icon={Right}
                            size={smallSize}
                            className="u-mr-1"
                            style={{ color: 'var(--secondaryTextColor)' }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index !== appsAndKonnectors.length - 1 && (
                        <Divider variant="inset" />
                      )}
                    </div>
                  )
                })}
            </NavigationListSection>
          </NavigationList>
        </>
      )}
    </Page>
  )
}

export default withAllLocales(DataPermissions)
