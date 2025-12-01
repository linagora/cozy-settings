import { Q } from 'cozy-client'

import { joinRemotePath, extractName, build404Reason } from './pathUtils'

const NEXTCLOUD_FILES_DOCTYPE = 'io.cozy.remote.nextcloud.files'

export async function listAccounts(client) {
  const { data } = await client.query(
    Q('io.cozy.accounts').where({ account_type: 'nextcloud' }).limitBy(100)
  )
  return data || []
}

export async function listRemote(
  client,
  accountId,
  path = '/',
  { trashed = false } = {}
) {
  const clean = joinRemotePath(path)
  const collection = client.collection(NEXTCLOUD_FILES_DOCTYPE)
  const { data } = await collection.find({
    'cozyMetadata.sourceAccount': accountId,
    parentPath: clean,
    trashed
  })
  return data || []
}

export async function probePath(client, accountId, path = '/') {
  const clean = joinRemotePath(path)

  if (clean === '/') {
    const items = await listRemote(client, accountId, '/')
    return { kind: 'directory', items, name: '/' }
  }

  const parentPath = clean.split('/').slice(0, -1).join('/') || '/'
  const name = extractName(clean)

  let siblings
  try {
    siblings = await listRemote(client, accountId, parentPath)
  } catch (e) {
    const err = new Error(e?.message || 'Remote probe failed')
    err.status = e?.status
    err.path = clean
    throw err
  }

  const entry = siblings.find(child => {
    const childName = child?.name || child?.attributes?.name
    return childName === name
  })

  if (!entry) {
    const err = new Error(`${name} - 404, ${build404Reason(clean)}`)
    err.status = 404
    err.path = clean
    throw err
  }

  const type = entry?.type || entry?.attributes?.type || 'file'

  if (type === 'directory') {
    const items = await listRemote(client, accountId, clean)
    return { kind: 'directory', items, name }
  }

  return { kind: 'file', name, file: entry }
}
