import { UAParser } from 'ua-parser-js'

/**
 * The OS stored by the stack is a raw token of the user agent on Apple
 * platforms ("CPU OS 18_5 like Mac OS X")
 */
export const getSessionOs = (session: {
  user_agent: string
  os: string
}): string => {
  const { name, version } = UAParser(session.user_agent).os

  return name ? `${name} ${version ?? ''}`.trim() : session.os
}
