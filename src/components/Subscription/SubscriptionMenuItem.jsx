import { Cloud } from '@linagora/twake-icons'
import React from 'react'
import { useI18n } from 'twake-i18n'

import flag from 'cozy-flags'

import { usePremium } from '@/components/Premium/PremiumProvider'
import { MenuItemAnchor } from '@/components/menu/MenuItemAnchor'
import { MenuItemNavLink } from '@/components/menu/MenuItemNavLink'
import { routes } from '@/constants/routes'

/**
 * Sidebar menu link for plan
 */
const SubscriptionMenuItem = () => {
  const { t } = useI18n()
  const { canOpenPremiumLink, premiumLink } = usePremium()

  if (flag('settings.subscription')) {
    return (
      <MenuItemNavLink
        to={routes.subscription}
        primary={t('Nav.primary_plan')}
        icon={Cloud}
      />
    )
  }

  if (canOpenPremiumLink) {
    return (
      <MenuItemAnchor
        primary={t('Nav.primary_plan')}
        href={premiumLink}
        target="_blank"
        icon={Cloud}
      />
    )
  }

  return null
}

export { SubscriptionMenuItem }
