import {
  CloudSync,
  Contract,
  Devices,
  Email,
  Globe,
  GraphCircle,
  Hand,
  HelpOutlined,
  Justice,
  LockScreen,
  Logout,
  Palette,
  People
} from '@linagora/twake-icons'
import React from 'react'
import { useI18n } from 'twake-i18n'

import { useInstanceInfo } from 'cozy-client'
import { makeDiskInfos } from 'cozy-client/dist/models/instance'
import { isFlagshipApp } from 'cozy-device-helper'
import flag from 'cozy-flags'
import Typography from 'cozy-ui/transpiled/react/Typography'

import styles from '@/components/Sidebar.styl'

import { SubscriptionMenuItem } from '@/components/Subscription/SubscriptionMenuItem'
import { MenuItemAnchor } from '@/components/menu/MenuItemAnchor'
import { MenuItemButton } from '@/components/menu/MenuItemButton'
import { MenuItemNavLink } from '@/components/menu/MenuItemNavLink'
import { MenuList } from '@/components/menu/MenuList'
import { routes } from '@/constants/routes'
import { useLogout } from '@/hooks/useLogout'

export const Sidebar = (): JSX.Element => {
  const logout = useLogout()

  const { t } = useI18n()

  const { isLoaded, instance, context, diskUsage } = useInstanceInfo()

  const percent = isLoaded
    ? makeDiskInfos(diskUsage.data.used, diskUsage.data.quota).percentUsage
    : ''

  return (
    <nav role="navigation" className={styles.Sidebar}>
      {(isFlagshipApp() || flag('settings.flagship-mode')) && (
        <MenuList title={t('Nav.header_flagship')}>
          <MenuItemNavLink
            to={routes.lockScreen}
            primary={t('Nav.primary_lock_screen')}
            icon={LockScreen}
          />
        </MenuList>
      )}

      <MenuList title={t('Nav.header_general')}>
        <MenuItemNavLink
          to={routes.profile}
          primary={t('Nav.profile')}
          icon={People}
        />
        <MenuItemNavLink
          to={routes.appearance}
          primary={t('Nav.appearance')}
          icon={Palette}
        />
        <SubscriptionMenuItem />
        <MenuItemNavLink
          to={routes.storage}
          primary={t('Nav.storage')}
          beforeEnd={
            percent ? (
              <Typography
                variant="body2"
                className="u-mr-half"
                style={{ color: 'var(--secondaryTextColor)' }}
              >
                {t('Nav.secondary_used', { percent })}
              </Typography>
            ) : null
          }
          icon={GraphCircle}
        />
        {flag('settings.migration.enabled') && (
          <MenuItemNavLink
            to={routes.migration}
            primary={t('Nav.migration')}
            icon={CloudSync}
          />
        )}
      </MenuList>

      <MenuList title={t('Nav.header_data')}>
        {flag('settings.permissions-dashboard') && (
          <MenuItemNavLink
            to={routes.appList}
            primary={t('Nav.permissions')}
            icon={Hand}
          />
        )}

        <MenuItemNavLink
          to={routes.connectedDevices}
          primary={t('Nav.connected_devices')}
          icon={Devices}
        />

        <MenuItemNavLink
          to={routes.sessions}
          primary={t('Nav.sessions')}
          icon={Globe}
        />
      </MenuList>

      <MenuList title={t('Nav.header_other')}>
        <MenuItemAnchor
          primary={t('Nav.primary_faq')}
          href={context?.data?.help_link}
          target="_blank"
          icon={HelpOutlined}
        />
        <MenuItemNavLink
          to={routes.support}
          primary={t('Nav.contact_support')}
          icon={Email}
        />
        {instance.data.legal_notice_url && (
          <MenuItemAnchor
            primary={t('Nav.legal_notice')}
            href={instance.data.legal_notice_url}
            target="_blank"
            icon={Justice}
          />
        )}
        <MenuItemAnchor
          primary={t('Nav.terms_of_service')}
          href={`https://files.cozycloud.cc/TOS${
            instance.data.tos ? `-${instance.data.tos}` : '-201711'
          }.pdf`}
          target="_blank"
          icon={Contract}
        />
        <MenuItemButton
          primary={t('Nav.primary_logout')}
          icon={Logout}
          onClick={(): void => void logout()}
        />
      </MenuList>
    </nav>
  )
}

export default Sidebar
