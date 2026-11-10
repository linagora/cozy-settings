import * as Sentry from '@sentry/react'

import { scrubExportMac } from './sentry'

const MAC = 'c2VjcmV0LW1hYw_-=='

describe('scrubExportMac', () => {
  it('should redact the MAC and keep the rest of the event', () => {
    const event = {
      request: { url: `http://localhost/#/exports/${MAC}` },
      breadcrumbs: [
        { data: { url: `/move/exports/data/${MAC}?cursor=1` } },
        { data: { url: '/move/exports' } }
      ],
      transaction: '/exports/:exportId'
    }

    expect(scrubExportMac(event)).toEqual({
      request: { url: 'http://localhost/#/exports/[redacted]' },
      breadcrumbs: [
        { data: { url: '/move/exports/data/[redacted]?cursor=1' } },
        { data: { url: '/move/exports' } }
      ],
      transaction: '/exports/:exportId',
      sdkProcessingMetadata: undefined
    })
  })

  it('should keep the MAC out of what Sentry really sends', async () => {
    const sent = []
    window.history.pushState({}, '', `/#/exports/${MAC}`)
    Sentry.addTracingExtensions() // done by the browser tracing integration in the app
    Sentry.init({
      dsn: 'https://key@sentry.invalid/1',
      tracesSampleRate: 1,
      beforeSend: scrubExportMac,
      beforeSendTransaction: scrubExportMac,

      transport: options =>
        Sentry.createTransport(options, async request => {
          sent.push(String(request.body))
          return { statusCode: 200 }
        })
    })

    Sentry.addBreadcrumb({
      category: 'fetch',
      data: { url: `/move/exports/${MAC}` }
    })
    Sentry.captureException(new Error('export failed'))
    Sentry.startSpan({ name: '/exports/:exportId', op: 'navigation' }, () => {
      Sentry.startSpan(
        { name: `GET /move/exports/data/${MAC}`, op: 'http.client' },
        () => null
      )
    })
    await Sentry.flush()

    const body = sent.join('\n')
    expect(body).toContain('"type":"transaction"')
    expect(body).toContain('export failed')
    expect(body).toContain('/move/exports/data/[redacted]')
    expect(body).toContain('#/exports/[redacted]')
    expect(body).not.toContain(MAC)
  })
})
