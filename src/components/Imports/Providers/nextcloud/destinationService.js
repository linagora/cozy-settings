import { Q } from 'cozy-client'

export async function findChildDirByName(client, parentId, name) {
  const { data } = await client.query(
    Q('io.cozy.files')
      .where({ dir_id: parentId, name, type: 'directory' })
      .limitBy(1)
  )
  return data && data[0] ? data[0] : null
}

export async function createChildDir(client, parentId, name) {
  const qs = new URLSearchParams({ Type: 'directory', Name: name })
  const url = `/files/${encodeURIComponent(parentId)}?${qs.toString()}`
  const res = await client.stackClient.fetch('POST', url, null, {
    headers: { Accept: 'application/vnd.api+json' }
  })

  if (res.status >= 200 && res.status < 300) {
    const json = await res.json().catch(() => ({}))
    return json?.data || json
  }

  if (res.status === 409) {
    const existing = await findChildDirByName(client, parentId, name)
    if (existing) return existing
  }

  const txt = await res.text().catch(() => '')
  throw new Error(txt || `Create directory failed: HTTP ${res.status}`)
}

export async function ensureChildDir(client, parentId, name) {
  const existing = await findChildDirByName(client, parentId, name)
  if (existing) return existing
  return createChildDir(client, parentId, name)
}

export async function ensureImportsDestination(
  client,
  providerLabel = 'Nextcloud',
  login = ''
) {
  const safeLogin = String(login || 'unknown').replace(/[/\\]/g, '_')
  const files = client.collection('io.cozy.files')
  const path = `Imports/${providerLabel}/${safeLogin}`
  const dirId = await files.ensureDirectoryExists(path)
  return dirId
}
