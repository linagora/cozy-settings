import React, { useEffect, useState } from 'react'
import { useI18n } from 'twake-i18n'

import Buttons from 'cozy-ui/transpiled/react/Buttons'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Table from 'cozy-ui/transpiled/react/Table'
import TableBody from 'cozy-ui/transpiled/react/TableBody'
import TableCell from 'cozy-ui/transpiled/react/TableCell'
import TableHead from 'cozy-ui/transpiled/react/TableHead'
import TableRow from 'cozy-ui/transpiled/react/TableRow'
import Typography from 'cozy-ui/transpiled/react/Typography'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import tableStyles from '@/styles/table.styl'

import Page from '@/components/Page'
import PageTitle from '@/components/PageTitle'
import SessionDialog from '@/components/SessionsView/SessionDialog'
import SessionsViewRow from '@/components/SessionsViewRow'

const SessionsView = ({
  fetchSessions,
  isFetching,
  sessions,
  deleteOtherSessions
}) => {
  const { t } = useI18n()
  const { isMobile } = useBreakpoints()
  const [sessionDetails, setSessionDetails] = useState(undefined)

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const displayModal = session => setSessionDetails(session)

  const hideModal = () => setSessionDetails(undefined)

  return (
    <Page>
      <PageTitle>{t('SessionsView.title')}</PageTitle>
      <Typography variant="body1" className="u-mb-1-half">
        <Buttons
          className="u-ml-0"
          color="error"
          onClick={deleteOtherSessions}
          label={t('SessionsView.delete')}
        />
      </Typography>
      {isFetching && (
        <Spinner
          className="u-pos-fixed-s"
          middle
          size="xxlarge"
          loadingType="loading"
        />
      )}
      {!isFetching && sessions && (
        <>
          <Table className={tableStyles['coz-table']}>
            {!isMobile && (
              <TableHead>
                <TableRow>
                  <TableCell>{t('SessionsView.head_date')}</TableCell>
                  <TableCell>{t('SessionsView.head_os')}</TableCell>
                  <TableCell>{t('SessionsView.head_browser')}</TableCell>
                  <TableCell>{t('SessionsView.head_ip')}</TableCell>
                </TableRow>
              </TableHead>
            )}
            <TableBody>
              {sessions
                .sort(function (a, b) {
                  // Turn your strings into dates, and then subtract them
                  // to get a value that is either negative, positive, or zero.
                  return new Date(b.created_at) - new Date(a.created_at)
                })
                .map((session, index) => (
                  <SessionsViewRow
                    displayModal={displayModal}
                    session={session}
                    key={index}
                  />
                ))}
            </TableBody>
          </Table>
          <ConfirmDialog
            open={!!sessionDetails}
            onClose={hideModal}
            title={t('SessionsView.modal_title')}
            content={<SessionDialog session={sessionDetails} />}
          />
        </>
      )}
    </Page>
  )
}

export default SessionsView
