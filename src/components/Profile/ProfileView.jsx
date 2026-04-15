import React from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { useI18n } from 'twake-i18n'

import { hasQueryBeenLoaded, useQuery } from 'cozy-client'
import flag from 'cozy-flags'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Stack from 'cozy-ui/transpiled/react/Stack'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

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
import { buildSettingsInstanceQuery, buildAppsQuery } from '@/lib/queries'

const ProfileView = ({
  exportData,
  fetchExportData,
  requestExport,
  importData,
  precheckImport,
  submitImport,
  instanceData,
  appsData
}) => {
  const { exportId } = useParams()

  const isChatAppInstalled = appsData.some(app => app.slug === 'chat')
  const isMailAppInstalled = appsData.some(app => app.slug === 'mail')

  const isTwoFAEnabled = flag('settings.2fa.enabled')
  const isMatrixEnabled = flag('settings.matrix.enabled')
  const isPhoneEnabled = flag('settings.phone.enabled')
  const isDeleteEnabled = flag('settings.delete.enabled')
  const isEmailReadOnly = flag('settings.email.readonly')
  const isSignupEnabled = flag('signup.url')

  return (
    <>
      <Stack spacing="l">
        <div className="u-mv-1-half">
          <AvatarSection />
        </div>
        <PublicNameSection />
        {isEmailReadOnly ? (
          <EmailReadOnlySection isMailAppInstalled={isMailAppInstalled} />
        ) : (
          <EmailSection />
        )}
        {isMatrixEnabled && (
          <MatrixIdSection
            email={instanceData.email}
            isChatAppInstalled={isChatAppInstalled}
          />
        )}
        {isPhoneEnabled && <PhoneNumberSection />}
        {isTwoFAEnabled && isSignupEnabled && <TwoFA />}
        <PasswordSection />
        <LanguageSection />
        <DefaultRedirectionSection />
        <div>
          <ExportSection
            email={instanceData.email}
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
  )
}

const ProfileViewWithQueries = ({
  exportData,
  fetchExportData,
  requestExport,
  importData,
  precheckImport,
  submitImport
}) => {
  const { t } = useI18n()
  const { isMobile } = useBreakpoints()
  const instanceQuery = buildSettingsInstanceQuery()
  const instanceResult = useQuery(
    instanceQuery.definition,
    instanceQuery.options
  )
  const isInstanceLoaded = hasQueryBeenLoaded(instanceResult)

  const appsQuery = buildAppsQuery()
  const appsResult = useQuery(appsQuery.definition, appsQuery.options)
  const isAppsLoaded = hasQueryBeenLoaded(appsResult)

  return (
    <Page narrow>
      <PageTitle className={!isMobile ? 'u-mb-1' : ''}>
        {t('ProfileView.title')}
      </PageTitle>
      {!isInstanceLoaded || !isAppsLoaded ? (
        <Spinner
          className="u-pos-fixed-s"
          middle
          size="xxlarge"
          loadingType="loading"
        />
      ) : (
        <ProfileView
          exportData={exportData}
          fetchExportData={fetchExportData}
          requestExport={requestExport}
          importData={importData}
          precheckImport={precheckImport}
          submitImport={submitImport}
          instanceData={instanceResult.data}
          appsData={appsResult.data}
        />
      )}
      <Outlet />
    </Page>
  )
}

export default ProfileViewWithQueries
