import React from 'react'
import { NavLink as RouterLink } from 'react-router-dom'

import { useInstanceInfo } from 'cozy-client'
import { makeDiskInfos } from 'cozy-client/dist/models/instance'
import { isFlagshipApp } from 'cozy-device-helper'
import flag from 'cozy-flags'
import CloudIcon from 'cozy-ui/transpiled/react/Icons/Cloud'
import ConnectorIcon from 'cozy-ui/transpiled/react/Icons/Connector'
import ContractIcon from 'cozy-ui/transpiled/react/Icons/Contract'
import DevicesIcon from 'cozy-ui/transpiled/react/Icons/Devices'
import EmailIcon from 'cozy-ui/transpiled/react/Icons/Email'
import GlobeIcon from 'cozy-ui/transpiled/react/Icons/Globe'
import GraphCircle from 'cozy-ui/transpiled/react/Icons/GraphCircle'
import HandIcon from 'cozy-ui/transpiled/react/Icons/Hand'
import HelpOutlinedIcon from 'cozy-ui/transpiled/react/Icons/HelpOutlined'
import JusticeIcon from 'cozy-ui/transpiled/react/Icons/Justice'
import LockScreen from 'cozy-ui/transpiled/react/Icons/LockScreen'
import Logout from 'cozy-ui/transpiled/react/Icons/Logout'
import OpenwithIcon from 'cozy-ui/transpiled/react/Icons/Openwith'
import PaletteIcon from 'cozy-ui/transpiled/react/Icons/Palette'
import PeopleIcon from 'cozy-ui/transpiled/react/Icons/People'
import ListItem from 'cozy-ui/transpiled/react/ListItem'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'
import Nav, {
  NavItem,
  NavIcon,
  NavText,
  genNavLinkForV6
} from 'cozy-ui/transpiled/react/Nav'
import Sidebar from 'cozy-ui/transpiled/react/Sidebar'
import Typography from 'cozy-ui/transpiled/react/Typography'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import { usePremium } from '@/components/Premium/PremiumProvider'
import { routes } from '@/constants/routes'
import { useLogout } from '@/hooks/useLogout'

export const SidebarDesktop = () => {
  const { t } = useI18n()
  const logout = useLogout()
  const { isLoaded, instance, context, diskUsage } = useInstanceInfo()
  const { canOpenPremiumLink, premiumLink } = usePremium()

  const NavLink = genNavLinkForV6(RouterLink)
  const percent = isLoaded
    ? makeDiskInfos(diskUsage.data.used, diskUsage.data.quota).percentUsage
    : ''

  return (
    <Sidebar style={{ width: 360 }}>
      <Nav>
        {(isFlagshipApp() || flag('settings.flagship-mode')) && (
          <>
            <ListItem dense>
              <ListItemText
                className="u-uppercase"
                primary={t('Nav.header_flagship')}
              />
            </ListItem>
            <NavItem>
              <NavLink to={routes.lockScreen}>
                <NavIcon icon={LockScreen} />
                <NavText>{t('Nav.primary_lock_screen')}</NavText>
              </NavLink>
            </NavItem>
          </>
        )}

        <ListItem dense>
          <ListItemText
            className="u-uppercase"
            primary={t('Nav.header_general')}
          />
        </ListItem>
        <NavItem>
          <NavLink to={routes.profile}>
            <NavIcon icon={PeopleIcon} />
            <NavText>{t('Nav.profile')}</NavText>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={routes.appearance}>
            <NavIcon icon={PaletteIcon} />
            <NavText>{t('Nav.appearance')}</NavText>
          </NavLink>
        </NavItem>
        {flag('settings.subscription') ? (
          <NavItem>
            <NavLink to={routes.subscription}>
              <NavIcon icon={CloudIcon} />
              <NavText>{t('Nav.primary_plan')}</NavText>
            </NavLink>
          </NavItem>
        ) : canOpenPremiumLink ? (
          <NavItem>
            <NavLink to={premiumLink} target="_blank">
              <NavIcon icon={CloudIcon} />
              <NavText className="u-flex-grow-1">
                {t('Nav.primary_plan')}
              </NavText>
              <NavIcon icon={OpenwithIcon} />
            </NavLink>
          </NavItem>
        ) : null}
        <NavItem>
          <NavLink to={routes.storage}>
            <NavIcon icon={GraphCircle} />
            <NavText className="u-flex-grow-1">{t('Nav.storage')}</NavText>
            {percent && (
              <NavText>
                <Typography
                  className="u-mr-half"
                  variant="body2"
                  color="textSecondary"
                >
                  {t('Nav.secondary_used', { percent })}
                </Typography>
              </NavText>
            )}
          </NavLink>
        </NavItem>

        <ListItem dense>
          <ListItemText
            className="u-uppercase"
            primary={t('Nav.header_data')}
          />
        </ListItem>
        {flag('settings.permissions-dashboard') && (
          <NavItem>
            <NavLink to={routes.appList}>
              <NavIcon icon={HandIcon} />
              <NavText>{t('Nav.permissions')}</NavText>
            </NavLink>
          </NavItem>
        )}
        <NavItem>
          <NavLink to={routes.connectedDevices}>
            <NavIcon icon={DevicesIcon} />
            <NavText>{t('Nav.connected_devices')}</NavText>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={routes.sessions}>
            <NavIcon icon={GlobeIcon} />
            <NavText>{t('Nav.sessions')}</NavText>
          </NavLink>
        </NavItem>
        {flag('settings.imports') && (
          <NavItem>
            <NavLink to={routes.imports}>
              <NavIcon icon={ConnectorIcon} />
              <NavText className="u-flex-grow-1">
                {t('ImportsView.title')}
              </NavText>
            </NavLink>
          </NavItem>
        )}
        <ListItem dense>
          <ListItemText
            className="u-uppercase"
            primary={t('Nav.header_other')}
          />
        </ListItem>
        <NavItem>
          <NavLink to={context?.data?.help_link} target="_blank">
            <NavIcon icon={HelpOutlinedIcon} />
            <NavText className="u-flex-grow-1">{t('Nav.primary_faq')}</NavText>
            <NavIcon icon={OpenwithIcon} />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={routes.support}>
            <NavIcon icon={EmailIcon} />
            <NavText>{t('Nav.contact_support')}</NavText>
          </NavLink>
        </NavItem>
        {instance.data.legal_notice_url && (
          <NavItem>
            <NavLink to={instance.data.legal_notice_url} target="_blank">
              <NavIcon icon={JusticeIcon} />
              <NavText className="u-flex-grow-1">
                {t('Nav.legal_notice')}
              </NavText>
              <NavIcon icon={OpenwithIcon} />
            </NavLink>
          </NavItem>
        )}
        <NavItem>
          <NavLink
            to={`https://files.cozycloud.cc/TOS${
              instance.data.tos ? `-${instance.data.tos}` : '-201711'
            }.pdf`}
            target="_blank"
          >
            <NavIcon icon={ContractIcon} />
            <NavText className="u-flex-grow-1">
              {t('Nav.terms_of_service')}
            </NavText>
            <NavIcon icon={OpenwithIcon} />
          </NavLink>
        </NavItem>
        <NavItem onClick={() => logout()}>
          <NavLink to="" reloadDocument>
            <NavIcon icon={Logout} />
            <NavText>{t('Nav.primary_logout')}</NavText>
          </NavLink>
        </NavItem>
      </Nav>
    </Sidebar>
  )
}

export default SidebarDesktop
