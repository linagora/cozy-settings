import { Icon, Gear, Sync, Trash } from '@linagora/twake-icons'
import React, { useCallback, useState } from 'react'
import { useI18n } from 'twake-i18n'

import ActionsMenuMobileHeader from 'cozy-ui/transpiled/react/ActionsMenu/ActionsMenuMobileHeader'
import ActionsMenuWrapper from 'cozy-ui/transpiled/react/ActionsMenu/ActionsMenuWrapper'
import ListItemIcon from 'cozy-ui/transpiled/react/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

import tableStyles from '@/styles/table.styl'

import { DevicesMoreButton } from '@/components/Devices/DevicesMoreButton'
import { DevicesMoreMenuItem } from '@/components/Devices/DevicesMoreMenuItem'
import {
  getDeviceIcon,
  canConfigureDevice,
  isNeverDisplayedDevice
} from '@/components/Devices/helpers'

const DevicesMoreMenu = ({ device, onRevoke, onConfigure, isMobile }) => {
  const { f, t } = useI18n()

  const [menuIsVisible, setMenuVisible] = useState(false)

  const openMenu = useCallback(() => setMenuVisible(true), [setMenuVisible])
  const closeMenu = useCallback(() => setMenuVisible(false), [setMenuVisible])
  const toggleMenu = useCallback(() => {
    if (menuIsVisible) return closeMenu()
    openMenu()
  }, [closeMenu, openMenu, menuIsVisible])
  return (
    <>
      <DevicesMoreButton deviceName={device.client_name} onClick={toggleMenu} />
      {isMobile && menuIsVisible ? (
        <ActionsMenuWrapper open onClose={closeMenu} autoClose>
          <ActionsMenuMobileHeader>
            <ListItemIcon>
              <Icon icon={getDeviceIcon(device)} size={32} />
            </ListItemIcon>
            <ListItemText
              primary={device.client_name}
              secondary={
                <>
                  <Icon
                    icon={Sync}
                    size={8}
                    color="var(--secondaryTextColor)"
                  />
                  <span className={tableStyles['more-menu-infos']}>
                    {device.synchronized_at
                      ? f(
                          device.synchronized_at,
                          t('DevicesView.sync_date_format')
                        )
                      : '-'}
                  </span>
                </>
              }
            />
          </ActionsMenuMobileHeader>
          {canConfigureDevice(device) ? (
            <DevicesMoreMenuItem
              onClick={onConfigure}
              icon={Gear}
              text={t('DevicesView.configure')}
            />
          ) : null}
          <DevicesMoreMenuItem
            onClick={() => {
              if (isNeverDisplayedDevice(device)) return
              onRevoke()
            }}
            icon={Trash}
            color="error"
            text={t('DevicesView.revoke')}
            disabled={isNeverDisplayedDevice(device)}
          />
        </ActionsMenuWrapper>
      ) : null}
    </>
  )
}

export { DevicesMoreMenu }
