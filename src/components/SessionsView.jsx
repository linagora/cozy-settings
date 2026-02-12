import React, { useEffect, useState } from 'react'
import { useI18n } from 'twake-i18n'

import Buttons from 'cozy-ui/transpiled/react/Buttons'
import { ConfirmDialog } from 'cozy-ui/transpiled/react/CozyDialogs'
import Spinner from 'cozy-ui/transpiled/react/Spinner'
import Typography from 'cozy-ui/transpiled/react/Typography'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader
} from 'cozy-ui/transpiled/react/deprecated/Table'

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
            <TableHead>
              <TableRow>
                <TableHeader className={tableStyles['set-table-date']}>
                  Date
                </TableHeader>
                <TableHeader className={tableStyles['set-table-os']}>
                  OS
                </TableHeader>
                <TableHeader className={tableStyles['set-table-browser']}>
                  Browser
                </TableHeader>
                <TableHeader className={tableStyles['set-table-ip']}>
                  IP
                </TableHeader>
              </TableRow>
            </TableHead>
            <TableBody className={tableStyles['set-table-sessions']}>
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
