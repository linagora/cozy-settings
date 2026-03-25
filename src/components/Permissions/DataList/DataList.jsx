import React from 'react'

import Divider from 'cozy-ui/transpiled/react/Divider'
import Icon from 'cozy-ui/transpiled/react/Icon'
import RightIcon from 'cozy-ui/transpiled/react/Icons/Right'
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

import { sortPermissionsByName } from '@/components/Permissions/DataList/DataListHelpers'
import {
  completePermission,
  getPermissionIconName
} from '@/components/Permissions/helpers/permissionsHelper'
import useAppsOrKonnectors from '@/components/Permissions/hooks/useAppsOrKonnectors'
import { routes } from '@/constants/routes'
import withAllLocales from '@/lib/withAllLocales'

const DataList = ({ t }) => {
  const { isResultLoading, hasQueryFailed, appsResult, konnectorsResult } =
    useAppsOrKonnectors()

  const permissionsToDisplay = completePermission(appsResult, konnectorsResult)

  return (
    <>
      {isResultLoading ? (
        <Spinner size="large" className="u-flex u-flex-justify-center u-mt-1" />
      ) : hasQueryFailed ? (
        <Typography variant="body1" className="u-mb-1-half">
          {t('Permissions.failedRequest')}
        </Typography>
      ) : (
        <NavigationList>
          <NavigationListSection>
            {sortPermissionsByName(permissionsToDisplay, t).map(
              ([key, slugs]) => {
                const iconName = getPermissionIconName(key)
                return (
                  <React.Fragment key={key}>
                    <ListItem
                      button
                      component="a"
                      href={`/#${routes.dataList}/${key}`}
                      ellipsis={false}
                    >
                      <ListItemIcon>
                        <Icon
                          icon={
                            require(
                              `cozy-ui/transpiled/react/Icons/${iconName}`
                            ).default
                          }
                          size={mediumSize}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('CozyPermissions.' + key)}
                        secondary={t('Permissions.numberOfApplications', {
                          smart_count: slugs.length
                        })}
                      />
                      <ListItemSecondaryAction>
                        <Icon
                          icon={RightIcon}
                          size={smallSize}
                          className="u-mr-1"
                          style={{ color: 'var(--secondaryTextColor)' }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" />
                  </React.Fragment>
                )
              }
            )}
          </NavigationListSection>
        </NavigationList>
      )}
    </>
  )
}

export default withAllLocales(DataList)
