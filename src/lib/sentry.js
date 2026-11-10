const EXPORT_MAC_REGEX = /(exports\/(?:data\/)?)[\w=-]+/g

/**
 * The export MAC (`#/exports/<mac>`, `/move/exports/<mac>`,
 * `/move/exports/data/<mac>`) is the only credential of the stack's export
 * download routes, so it must never leave the browser in a Sentry event.
 * Use as both `beforeSend` and `beforeSendTransaction`.
 */
export const scrubExportMac = event => {
  // sdkProcessingMetadata holds live SDK objects that do not survive JSON, and is never sent
  const { sdkProcessingMetadata, ...payload } = event
  return {
    ...JSON.parse(
      JSON.stringify(payload).replace(EXPORT_MAC_REGEX, '$1[redacted]')
    ),
    sdkProcessingMetadata
  }
}
