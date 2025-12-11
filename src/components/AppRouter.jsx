import * as Sentry from '@sentry/react'
import React from 'react'
import { Route, Navigate, Routes, Outlet } from 'react-router-dom'

import { BarRoutes } from 'cozy-bar'
import flag from 'cozy-flags'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import { DeleteAccount } from '@/components/DeleteAccount'
import ChangeEmail from '@/components/Email/ChangeEmail'
import History from '@/components/Imports/History'
import Imports from '@/components/Imports/Imports'
import Run from '@/components/Imports/Run'
import PermissionsApplication from '@/components/Permissions/AppPermissions/AppPermissions'
import DataPermissions from '@/components/Permissions/DataPermissions/DataPermissions'
import PermissionDetails from '@/components/Permissions/PermissionDetails/PermissionDetails'
import PermissionsTab from '@/components/Permissions/PermissionsTab'
import { Storage } from '@/components/Storage/Storage'
import { Subscription } from '@/components/Subscription/Subscription'
import Support from '@/components/Support/Support'
import { LockScreen } from '@/components/pages/LockScreen'
import { Menu } from '@/components/pages/Menu'
import { routes } from '@/constants/routes'
import Appearance from '@/containers/Appearance'
import Devices from '@/containers/Devices'
import Passphrase from '@/containers/Passphrase'
import Profile from '@/containers/Profile'
import Sessions from '@/containers/Sessions'
import IntentRedirect from '@/services/IntentRedirect'

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes)

const OutletWrapper = ({ Component }) => (
  <>
    <Component />
    <Outlet />
  </>
)

const AppRouter = () => {
  const { isMobile, isTablet } = useBreakpoints()
  const isSmallView = isMobile || isTablet

  return (
    <SentryRoutes>
      {isSmallView && <Route path="/menu" element={<Menu />} />}
      <Route path="/redirect" element={<IntentRedirect />} />
      <Route path="/profile" element={<Profile />}>
        <Route path="/profile/email" element={<ChangeEmail />} />
        <Route path="/profile/delete" element={<DeleteAccount />} />
      </Route>
      <Route path="/profile/password" element={<Passphrase />} />
      <Route path="/appearance" element={<Appearance />} />
      <Route path="/connectedDevices/*" element={<Devices />} />
      <Route path="/connectedDevices/:deviceId" element={<Devices />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/storage" element={<Storage />} />

      {flag('settings.imports') && (
        <>
          <Route path={routes.imports} element={<Imports />} />
          <Route path={routes.importsRun} element={<Run />} />
          <Route path={routes.importsHistory} element={<History />} />
        </>
      )}
      <Route path={routes.lockScreen} element={<LockScreen />} />
      <Route path="/permissions/:page" element={<PermissionsTab />} />
      <Route
        path="/permissions/slug/:slug"
        element={<OutletWrapper Component={PermissionsApplication} />}
      >
        <Route path="details/:permissionType" element={<PermissionDetails />} />
      </Route>
      <Route path="/exports/:exportId" element={<Profile />} />
      <Route
        path="/permissions"
        element={<Navigate to="/permissions/slug" replace />}
      />
      <Route
        path="/permissions/data/:permissionType"
        element={<OutletWrapper Component={DataPermissions} />}
      >
        <Route path="details/:slug" element={<PermissionDetails />} />
      </Route>
      <Route path="/support" element={<Support />} />
      {flag('settings.subscription') && (
        <Route path="/subscription" element={<Subscription />} />
      )}
      {BarRoutes.map(BarRoute => BarRoute)}
      <Route
        path="*"
        element={<Navigate to={isSmallView ? '/menu' : '/profile'} replace />}
      />
    </SentryRoutes>
  )
}

export { AppRouter }
