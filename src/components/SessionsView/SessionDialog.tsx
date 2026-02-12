import React from 'react'
import { useI18n } from 'twake-i18n'
import { UAParser } from 'ua-parser-js'

import tableStyles from '@/styles/table.styl'

interface Session {
  user_agent: string
  created_at: string
  os: string
  browser: { name: string; major: string }
  ip: string
}

interface Prop {
  session: Session
}

const SessionDialog = ({ session }: Prop): JSX.Element => {
  const { f, t } = useI18n()
  const ua = UAParser(session.user_agent)
  return (
    <span className={tableStyles['dialog-container']}>
      <p className={tableStyles['dialog-paragraph']}>
        {t('SessionsView.modal_date')}{' '}
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call*/}
        {f(new Date(session.created_at), t('SessionsView.sync_date_format'))}
      </p>
      <p className={tableStyles['dialog-paragraph']}>
        {t('SessionsView.modal_os')} {session.os}
      </p>
      <p className={tableStyles['dialog-paragraph']}>
        {t('SessionsView.modal_browser')} {ua.browser.name} {ua.browser.major}
      </p>
      <p className={tableStyles['dialog-paragraph']}>
        {t('SessionsView.modal_ip')} {session.ip}
      </p>
    </span>
  )
}

export default SessionDialog
