import { Icon, Previous } from '@linagora/twake-icons'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useQuery, isQueryLoading, hasQueryBeenLoaded } from 'cozy-client'
import useFetchJSON from 'cozy-client/dist/hooks/useFetchJSON'
import { getAppDisplayName } from 'cozy-client/dist/models/applications'
import IconButton from 'cozy-ui/transpiled/react/IconButton'
import NavigationList from 'cozy-ui/transpiled/react/NavigationList'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Typography from 'cozy-ui/transpiled/react/Typography'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'
import AppIcon from 'cozy-ui-plus/dist/AppIcon'

import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import { AboutButton } from '@/components/Permissions/AppPermissions/AboutButton'
import AccessRightsSection from '@/components/Permissions/AppPermissions/AccessRightsSection'
import LatestOutgoingDataHistory from '@/components/Permissions/AppPermissions/LatestOutgoingDataHistory'
import { OpenappButton } from '@/components/Permissions/AppPermissions/OpenappButton'
import { UninstallButton } from '@/components/Permissions/AppPermissions/UninstallButton'
import {
  filterPermissions,
  sortPermissionsByName,
  completeAppPermission,
  filterRemoteRequests
} from '@/components/Permissions/helpers/permissionsHelper'
import useAppsOrKonnectorsBySlug from '@/components/Permissions/hooks/useAppsOrKonnectorsBySlug'
import { buildRemoteRequestsQuery } from '@/lib/queries'
import withAllLocales from '@/lib/withAllLocales'

const styles = {
  actionButtons: {
    gap: '2em'
  }
}

const AppPermissions = ({ t }) => {
  const { slug: slugName } = useParams()
  const { isMobile, isTablet } = useBreakpoints()
  const { isResultLoading, hasQueryFailed, result } =
    useAppsOrKonnectorsBySlug(slugName)

  const { data: remoteDoctypes, ...queryResultRemoteDoctypes } = useFetchJSON(
    'GET',
    '/remote/_all_doctypes'
  )

  const { limitedRightAccess, exitRights } = useMemo(
    () => filterPermissions(remoteDoctypes, result),
    [remoteDoctypes, result]
  )

  const sortedLimitedRightAccessPermissionsByName = sortPermissionsByName(
    completeAppPermission,
    limitedRightAccess,
    t
  )
  const sortedExitPermissionsByName = sortPermissionsByName(
    completeAppPermission,
    exitRights,
    t
  )

  const isKonnector = type => type === 'io.cozy.konnectors'

  const remoteQuery = buildRemoteRequestsQuery()
  const queryResultRemoteRequests = useQuery(
    remoteQuery.definition,
    remoteQuery.options
  )

  const filteredRemoteRequests = filterRemoteRequests(
    queryResultRemoteRequests,
    slugName
  )

  return (
    <Page
      className={isMobile || isTablet ? '' : 'u-maw-7 u-mh-2'}
      withoutMargin={isMobile || isTablet}
    >
      {hasQueryFailed || queryResultRemoteDoctypes.fetchStatus === 'error' ? (
        <Typography variant="body1" className="u-mb-1-half">
          {t('Permissions.failedRequest')}
        </Typography>
      ) : isResultLoading ||
        (isQueryLoading(queryResultRemoteRequests) &&
          !hasQueryBeenLoaded(queryResultRemoteRequests)) ||
        (isQueryLoading(queryResultRemoteDoctypes) &&
          !hasQueryBeenLoaded(queryResultRemoteDoctypes)) ? (
        <Spinner size="large" className="u-flex u-flex-justify-center u-mt-1" />
      ) : (
        <div>
          <div
            className={
              isMobile || isTablet
                ? 'u-flex u-flex-column u-flex-items-center u-mt-1-half'
                : 'u-flex u-flex-justify-between'
            }
          >
            <div
              className={
                isMobile || isTablet ? '' : 'u-flex u-flex-items-center'
              }
            >
              {!isMobile && !isTablet && (
                <IconButton className="u-mr-half" href="#/permissions">
                  <Icon icon={Previous} size={16} />
                </IconButton>
              )}
              <div style={{ width: '48px' }}>
                <AppIcon app={slugName} />
              </div>
              <PageTitle
                className={isMobile || isTablet ? '' : 'u-mh-1'}
                backButtonPath="/permissions/slug"
              >
                {result.data.name
                  ? getAppDisplayName(result.data).toUpperCase()
                  : slugName.toUpperCase()}
              </PageTitle>
            </div>
            <div
              className={classNames('u-flex u-flex-row u-flex-items-center', {
                'u-mt-1': isMobile || isTablet
              })}
              style={styles.actionButtons}
            >
              <OpenappButton
                type={isKonnector(result.data.type) ? 'konnector' : 'app'}
                appData={result.data}
              />
              <AboutButton appData={result.data} />
              <UninstallButton appData={result.data} />
            </div>
          </div>
          <NavigationList
            className={isMobile || isTablet ? 'u-mt-1' : 'u-mv-1'}
          >
            {sortedLimitedRightAccessPermissionsByName.length > 0 && (
              <AccessRightsSection
                sortedPermissionsByName={
                  sortedLimitedRightAccessPermissionsByName
                }
                slugName={slugName}
                t={t}
                isRemoteDoctypes={false}
              />
            )}

            {sortedExitPermissionsByName.length > 0 && (
              <AccessRightsSection
                sortedPermissionsByName={sortedExitPermissionsByName}
                slugName={slugName}
                t={t}
                isRemoteDoctypes={true}
              />
            )}

            {filteredRemoteRequests?.length > 0 && (
              <LatestOutgoingDataHistory
                queryResultRemoteRequests={filteredRemoteRequests}
                slugName={slugName}
                t={t}
              />
            )}
          </NavigationList>
        </div>
      )}
    </Page>
  )
}

export default withAllLocales(AppPermissions)
