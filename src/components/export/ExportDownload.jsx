import compose from 'lodash/flowRight'
import React, { Component } from 'react'
import { useNavigate } from 'react-router-dom'
import { translate } from 'twake-i18n'

import { withClient } from 'cozy-client'
import { Dialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Typography from 'cozy-ui/transpiled/react/Typography'
import ButtonAction from 'cozy-ui/transpiled/react/deprecated/ButtonAction'

class ExportDownload extends Component {
  componentDidMount() {
    this.props.fetchExportData()
  }

  download(cursor) {
    const { exportId, client } = this.props
    const dataUrl = `${client.stackClient.uri}/move/exports/data/${exportId}`
    const url = cursor ? `${dataUrl}?cursor=${cursor}` : dataUrl
    this.downloadFrame.src = url
  }

  closeModal() {
    const { navigate, parent } = this.props
    navigate(parent)
  }

  render() {
    const { t, exportData } = this.props
    const exportDoc =
      exportData && exportData.data && exportData.data.attributes
    const cursors = exportDoc && exportDoc.parts_cursors
    const firstElementName =
      cursors && cursors.length
        ? t('ProfileView.export.download.CTA_part', { number: 0 })
        : t('ProfileView.export.download.CTA')

    return (
      <Dialog
        open
        onClose={() => this.closeModal()}
        title={t('ProfileView.export.download.title')}
        content={
          exportData.isFetching ? (
            <Spinner size="xlarge" />
          ) : (
            <div>
              <iframe
                style={{ display: 'none' }}
                ref={frame => {
                  this.downloadFrame = frame
                }}
              />
              {exportData.error ? (
                <Typography variant="body1" className="u-error">
                  {t(exportData.error)}
                </Typography>
              ) : (
                <div>
                  {t('ProfileView.export.download.description')}
                  <ButtonAction
                    label={firstElementName}
                    rightIcon="download"
                    onClick={() => this.download()}
                  />
                  {cursors && cursors.length
                    ? cursors.map((cursor, index) => {
                        return (
                          <ButtonAction
                            label={t('ProfileView.export.download.CTA_part', {
                              number: index + 1
                            })}
                            rightIcon="download"
                            onClick={() => this.download(cursor)}
                            key={index}
                          />
                        )
                      })
                    : null}
                </div>
              )}
            </div>
          )
        }
      />
    )
  }
}

const ComposedExportDownload = compose(withClient, translate())(ExportDownload)

const ExportDownloadWithHistory = props => {
  const navigate = useNavigate()
  return <ComposedExportDownload {...props} navigate={navigate} />
}

export default ExportDownloadWithHistory
