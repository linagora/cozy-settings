import React, { useState } from 'react'
import { useI18n } from 'twake-i18n'

import Buttons from 'cozy-ui/transpiled/react/Buttons'
import { IllustrationDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Typography from 'cozy-ui/transpiled/react/Typography'

import exportImage from '@/assets/images/export-cozy-mail.svg?url'
import ReactMarkdownWrapper from '@/components/ReactMarkdownWrapper'
import ExportDownload from '@/components/export/ExportDownload'
import { MoveButton } from '@/components/export/MoveButton'

const ExportSection = ({
  email,
  exportData,
  exportId,
  fetchExportData,
  parent,
  requestExport
}) => {
  const { t } = useI18n()

  const [displayModal, setDisplayModal] = useState(false)

  const toggleModal = () => {
    setDisplayModal(!displayModal)
  }

  const submitExport = () => {
    requestExport()
    toggleModal()
  }

  return (
    <div>
      <div>
        <Typography variant="h5" gutterBottom>
          {t('ProfileView.export.title')}
        </Typography>
        <MoveButton />
        <Typography variant="body1" gutterBottom>
          {t('ProfileView.export.label')}
        </Typography>
        <div className="u-mb-half">
          <Buttons
            onClick={toggleModal}
            label={t('ProfileView.export.link')}
            variant="secondary"
          />
        </div>
      </div>
      {displayModal && (
        <IllustrationDialog
          open
          onClose={toggleModal}
          title={
            <div className="u-flex u-flex-column u-flex-items-center">
              <img
                className="u-maw-4 u-mb-1"
                alt={t('ProfileView.export.modal.title')}
                src={exportImage}
              />
              {t('ProfileView.export.modal.title')}
            </div>
          }
          content={
            <>
              <ReactMarkdownWrapper
                source={t('ProfileView.export.modal.description', { email })}
              />
              {exportData.error && (
                <Typography variant="body1" className="u-error">
                  {t(exportData.error)}
                </Typography>
              )}
            </>
          }
          actions={
            <>
              <Buttons
                className="u-flex-grow-1"
                variant="secondary"
                onClick={toggleModal}
                label={t('ProfileView.export.modal.cancel')}
              />
              <Buttons
                className="u-flex-grow-1"
                onClick={submitExport}
                busy={exportData.submitting}
                disabled={exportData.submitting}
                label={t('ProfileView.export.modal.CTA')}
              />
            </>
          }
        />
      )}
      {exportId && (
        <ExportDownload
          exportData={exportData}
          exportId={exportId}
          fetchExportData={fetchExportData}
          parent={parent}
        />
      )}
    </div>
  )
}

export { ExportSection }
