// `/` may be percent-encoded when the URL is nested in a query param.
// The stack MAC is base64url of at least 40 bytes (8 of time, 32 of HMAC), so
// 40 chars is a safe lower bound that leaves other `exports/...` paths alone.
const SEP = '(?:\\/|%(?:25)*2F)'
const EXPORT_MAC_REGEX = new RegExp(
  `(exports${SEP}(?:data${SEP})?)[\\w=-]{40,}`,
  'gi'
)

const redact = value => {
  const json = JSON.stringify(value)
  const redacted = json.replace(EXPORT_MAC_REGEX, '$1[redacted]')
  return redacted === json ? value : JSON.parse(redacted)
}

/**
 * The export MAC (`#/exports/<mac>`, `/move/exports/<mac>`,
 * `/move/exports/data/<mac>`) is the only credential of the stack's export
 * download routes, so it must never leave the browser in a Sentry event.
 * Use as both `beforeSend` and `beforeSendTransaction`.
 */
export const scrubExportMac = event => {
  // sdkProcessingMetadata holds live SDK objects that do not survive JSON.
  // Only its dynamicSamplingContext is sent, as the envelope `trace` header.
  const { sdkProcessingMetadata, ...payload } = event
  const dsc = sdkProcessingMetadata?.dynamicSamplingContext
  const redactedPayload = redact(payload)
  const redactedDsc = dsc && redact(dsc)
  if (redactedPayload === payload && redactedDsc === dsc) return event

  return {
    ...redactedPayload,
    sdkProcessingMetadata: sdkProcessingMetadata && {
      ...sdkProcessingMetadata,
      dynamicSamplingContext: redactedDsc
    }
  }
}
