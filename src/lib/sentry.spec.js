import * as Sentry from '@sentry/react'

import { scrubExportMac } from './sentry'

// Same shape as a stack MAC: base64url, longer than 40 chars
const MAC = 'AAAAAGkRo3oxZjJlM2Q0YzViNmE3ZjhlOWQwYzFiMmEzZjRlNWQ_-abc=='

describe('scrubExportMac', () => {
  afterEach(async () => {
    await Sentry.close()
    window.history.pushState({}, '', '/')
  })

  it('should redact the MAC wherever it appears in the event', () => {
    const capturedSpanScope = {}
    const event = {
      request: { url: `http://localhost/#/exports/${MAC}` },
      breadcrumbs: [
        { data: { url: `/move/exports/data/${MAC}?cursor=1` } },
        { data: { url: `/auth?redirect=%23%2Fexports%2F${MAC}` } },
        { data: { url: `/auth?redirect=%2523%252Fexports%252F${MAC}` } },
        { data: { url: `/move/exports/%41${MAC.replace(/-/g, '%2D')}` } }
      ],
      sdkProcessingMetadata: {
        capturedSpanScope,
        dynamicSamplingContext: { transaction: `/exports/${MAC}` }
      }
    }

    const scrubbed = scrubExportMac(event)

    expect(scrubbed).toEqual({
      request: { url: 'http://localhost/#/exports/[redacted]' },
      breadcrumbs: [
        { data: { url: '/move/exports/data/[redacted]?cursor=1' } },
        { data: { url: '/auth?redirect=%23%2Fexports%2F[redacted]' } },
        { data: { url: '/auth?redirect=%2523%252Fexports%252F[redacted]' } },
        { data: { url: '/move/exports/[redacted]' } }
      ],
      sdkProcessingMetadata: {
        capturedSpanScope,
        dynamicSamplingContext: { transaction: '/exports/[redacted]' }
      }
    })
    expect(scrubbed.sdkProcessingMetadata.capturedSpanScope).toBe(
      capturedSpanScope
    )
  })

  it('should return the event itself when there is no MAC', () => {
    const event = {
      request: { url: 'http://localhost/#/profile' },
      breadcrumbs: [
        { data: { url: '/move/exports' } },
        { data: { url: '/move/exports/data' } },
        { data: { url: '/exports/:exportId' } }
      ],
      sdkProcessingMetadata: {
        dynamicSamplingContext: { transaction: '/exports/:exportId' }
      }
    }

    expect(scrubExportMac(event)).toBe(event)
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
    // A custom-named transaction puts its name in the envelope `trace` header
    Sentry.startSpan({ name: `/exports/${MAC}`, op: 'navigation' }, () => {
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
    expect(body).toContain('"transaction":"/exports/[redacted]"')
    expect(body).not.toContain(MAC)
  })
})
