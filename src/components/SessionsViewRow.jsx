import {
  Icon,
  BrowserBrave,
  BrowserChrome,
  BrowserDuckduckgo,
  BrowserEdge,
  BrowserFirefox,
  BrowserIe,
  BrowserSafari,
  DeviceBrowser
} from '@linagora/twake-icons'
import React from 'react'
import { useI18n } from 'twake-i18n'
import { UAParser } from 'ua-parser-js'

import { TableRow, TableCell } from 'cozy-ui/transpiled/react/deprecated/Table'
import useBreakpoints from 'cozy-ui/transpiled/react/providers/Breakpoints'

import tableStyles from '@/styles/table.styl'

const getBrowserIcon = session => {
  const ua = UAParser(session.user_agent)

  if (ua.browser.name === 'Brave') {
    return BrowserBrave
  }
  if (ua.browser.name.startsWith('Chrom')) {
    return BrowserChrome
  }
  if (ua.browser.name === 'DuckDuckGo') {
    return BrowserDuckduckgo
  }
  if (ua.browser.name === 'Edge') {
    return BrowserEdge
  }
  if (ua.browser.name.startsWith('Firefox')) {
    return BrowserFirefox
  }
  if (ua.browser.name === 'IE') {
    return BrowserIe
  }
  if (ua.browser.name === 'Safari') {
    return BrowserSafari
  }
  return DeviceBrowser
}

const SessionsViewRow = ({ session, displayModal }) => {
  const { isMobile } = useBreakpoints()
  const { f, t } = useI18n()
  const ua = UAParser(session.user_agent)

  const callRow = () => {
    displayModal(session)
  }
  if (isMobile) {
    return (
      <TableRow className={tableStyles['row']} onClick={callRow}>
        <TableCell className={tableStyles['browser']}>
          <Icon icon={getBrowserIcon(session)} size={16} />
        </TableCell>
        <TableCell className={tableStyles['main']}>
          <span className={tableStyles['title']}>
            {`${ua.browser.name} · ${session.os}`}
          </span>
          <span className={tableStyles['subtitle']}>
            {f(
              new Date(session.created_at),
              t('SessionsView.sync_date_format')
            )}
          </span>
        </TableCell>
      </TableRow>
    )
  }
  return (
    <TableRow>
      <TableCell className={tableStyles['set-table-date']}>
        {f(new Date(session.created_at), t('SessionsView.sync_date_format'))}
      </TableCell>
      <TableCell className={tableStyles['set-table-os']}>
        {session.os}
      </TableCell>
      <TableCell className={tableStyles['set-table-browser']}>
        {ua.browser.name} {ua.browser.major}
      </TableCell>
      <TableCell className={tableStyles['set-table-ip']}>
        {session.ip}
      </TableCell>
    </TableRow>
  )
}

export default SessionsViewRow
