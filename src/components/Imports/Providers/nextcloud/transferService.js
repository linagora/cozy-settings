const NEXTCLOUD_FILES_DOCTYPE = 'io.cozy.remote.nextcloud.files'

export async function downstreamFile(
  client,
  file,
  targetDirId,
  { copy = true } = {}
) {
  const collection = client.collection(NEXTCLOUD_FILES_DOCTYPE)
  const to = { _id: targetDirId }
  try {
    await collection.moveToCozy(file, to, {
      copy,
      FailOnConflict: true
    })
    return true
  } catch (e) {
    if (e?.status === 409) return false
    throw e
  }
}
