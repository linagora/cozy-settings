export async function ensureImportsDestination(
  client,
  providerLabel = 'Nextcloud',
  login = ''
) {
  const safeLogin = String(login || 'unknown').replace(/[/\\]/g, '_')
  const files = client.collection('io.cozy.files')
  const path = `Imports/${providerLabel}/${safeLogin}`
  const dirId = await files.ensureDirectoryExists(path)

  return { dirId, path }
}
