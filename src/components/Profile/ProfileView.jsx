import React from 'react'
import { Outlet, useParams } from 'react-router-dom'

import { hasQueryBeenLoaded, useQuery } from 'cozy-client'
import flag from 'cozy-flags'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Stack from 'cozy-ui/transpiled/react/Stack'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'
import { useI18n } from 'cozy-ui/transpiled/react/providers/I18n'

import TwoFA from '@/components/2FA'
import EmailReadOnlySection from '@/components/Email/EmailReadOnlySection'
import EmailSection from '@/components/Email/EmailSection'
import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import AvatarSection from '@/components/Profile/AvatarSection'
import DefaultRedirectionSection from '@/components/Profile/DefaultRedirectionSection'
import { DeleteSection } from '@/components/Profile/DeleteSection'
import Import from '@/components/Profile/Import'
import LanguageSection from '@/components/Profile/LanguageSection'
import { MatrixIdSection } from '@/components/Profile/MatrixIdSection'
import PasswordSection from '@/components/Profile/PasswordSection'
import { PhoneNumberSection } from '@/components/Profile/PhoneNumberSection'
import { PublicNameSection } from '@/components/Profile/PublicNameSection'
import { ExportSection } from '@/components/export/ExportSection'
import { buildSettingsInstanceQuery } from '@/lib/queries'

const ProfileView = ({
  exportData,
  fetchExportData,
  requestExport,
  importData,
  precheckImport,
  submitImport
}) => {
  const { t } = useI18n()
  const { isMobile } = useBreakpoints()
  const { exportId } = useParams()

  const instanceQuery = buildSettingsInstanceQuery()
  const instanceResult = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )

  const isTwoFAEnabled = flag('settings.2fa.enabled')
  const isMatrixEnabled = flag('settings.matrix.enabled')
  const isPhoneEnabled = flag('settings.phone.enabled')
  const isDeleteEnabled = flag('settings.delete.enabled')
  const isEmailReadOnly = flag('settings.email.readonly')

  return (
    <Page narrow>
      <PageTitle className={!isMobile ? 'u-mb-1' : ''}>
        {t('ProfileView.title')}
      </PageTitle>
      {hasQueryBeenLoaded(instanceResult) ? (
        <>
          <Stack spacing="l">
            <div className="u-mv-1-half">
              <AvatarSection />
            </div>
            <PublicNameSection />
            {isEmailReadOnly ? <EmailReadOnlySection /> : <EmailSection />}
            {isMatrixEnabled && (
              <MatrixIdSection email={instanceResult.data.email} />
            )}
            {isPhoneEnabled && <PhoneNumberSection />}
            <PasswordSection />
            {isTwoFAEnabled && <TwoFA />}
            <LanguageSection />
            <DefaultRedirectionSection />
            <div>
              <ExportSection
                email={instanceResult.data.email}
                exportData={exportData}
                exportId={exportId}
                requestExport={requestExport}
                fetchExportData={() => fetchExportData(exportId)}
                parent="/profile"
              />
              <Import
                importData={importData}
                precheckImport={precheckImport}
                submitImport={submitImport}
              />
            </div>
          </Stack>
          {isDeleteEnabled && <DeleteSection />}
        </>
      ) : (
        <Spinner
          className="u-pos-fixed-s"
          middle
          size="xxlarge"
          loadingType="loading"
        />
      )}
      <Outlet />
    </Page>
  )
}

export default ProfileView
