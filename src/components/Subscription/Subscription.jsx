import cx from 'classnames'
import React from 'react'
import { useI18n } from 'twake-i18n'

import flag from 'cozy-flags'
import PaperIcon from 'cozy-ui/transpiled/react/Icons/Paper'
import List from 'cozy-ui/transpiled/react/List'
import Paper from 'cozy-ui/transpiled/react/Paper'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Typography from 'cozy-ui/transpiled/react/Typography'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import { SubscriptionAccountsItem } from './SubscriptionAccountsItem'
import styles from './subscription.styl'

import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import { PremiumLink } from '@/components/Premium/PremiumLink'
import { usePremium } from '@/components/Premium/PremiumProvider'
import { SubscriptionDevicesItem } from '@/components/Subscription/SubscriptionDevicesItem'
import { SubscriptionFlagItem } from '@/components/Subscription/SubscriptionFlagItem'
import { SubscriptionNotesItem } from '@/components/Subscription/SubscriptionNotesItem'
import { SubscriptionOnlyOfficeItem } from '@/components/Subscription/SubscriptionOnlyOfficeItem'
import { SubscriptionPasswordsItem } from '@/components/Subscription/SubscriptionPasswordsItem'
import { SubscriptionStorageItem } from '@/components/Subscription/SubscriptionStorageItem'
import { SubscriptionStoreItem } from '@/components/Subscription/SubscriptionStoreItem'
import { SubscriptionSupportItem } from '@/components/Subscription/SubscriptionSupportItem'

/**
 * Page showing the features included in the user plan
 */
const Subscription = () => {
  const { t } = useI18n()
  const { isLoaded, canOpenPremiumLink, premiumLink } = usePremium()
  const { isDesktop } = useBreakpoints()

  return (
    <Page fullHeight>
      <PageTitle className="u-mb-2">{t('Subscription.title')}</PageTitle>
      {isLoaded ? (
        <div
          className={cx(
            'u-flex',
            'u-flex-justify-center',
            isDesktop && styles['subscription-background']
          )}
        >
          <Paper
            elevation={20}
            className={cx('u-bdrs-8', 'u-p-1', styles['subscription'])}
          >
            <Typography
              variant="h5"
              className="u-ph-1 u-pt-1 u-pb-half u-ta-center"
            >
              {t('Subscription.included.title')}
            </Typography>
            <PremiumLink label={t('Subscription.action')} />
            <List dense disabledGutters>
              <SubscriptionStorageItem />
              <SubscriptionSupportItem />
              <SubscriptionPasswordsItem />
              {flag('drive.office.enabled') && <SubscriptionOnlyOfficeItem />}
              <SubscriptionNotesItem />
              <SubscriptionStoreItem />
              <SubscriptionDevicesItem />
              <SubscriptionAccountsItem />
              <SubscriptionFlagItem
                icon={PaperIcon}
                name="mespapiers.papers.max"
                hideWithoutFlag
              />
            </List>
            {canOpenPremiumLink && premiumLink && (
              <div className="u-flex u-flex-justify-center">
                <Typography variant="caption" className="u-mt-1 u-mb-2">
                  {t('Subscription.can_be_canceled')}
                </Typography>
              </div>
            )}
          </Paper>
        </div>
      ) : (
        <Spinner
          className="u-pos-fixed-s"
          middle
          size="xxlarge"
          loadingType="loading"
        />
      )}
    </Page>
  )
}

export { Subscription }
