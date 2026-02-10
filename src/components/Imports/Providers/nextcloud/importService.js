import { joinRemotePath, extractName } from './pathUtils'
import { probePath } from './remoteService'
import { downstreamFile } from './transferService'

export function createLimiter(max = 3, isAborted) {
  let active = 0
  const queue = []

  const run = fn =>
    new Promise((resolve, reject) => {
      const task = async () => {
        if (isAborted?.()) {
          const err = new Error('Aborted')
          err.isAborted = true
          reject(err)
          return
        }

        active += 1
        try {
          const result = await fn()
          resolve(result)
        } catch (e) {
          reject(e)
        } finally {
          active -= 1
          const next = queue.shift()
          if (next) next()
        }
      }

      if (active < max) task()
      else queue.push(task)
    })

  return run
}

function buildCozyPath(baseCozyPath, remotePath) {
  const cleanRemote = joinRemotePath(remotePath)
  if (cleanRemote === '/') return baseCozyPath
  return `${baseCozyPath}${cleanRemote}`
}

export async function importPathRecursive(
  client,
  accountId,
  remotePath = '/',
  targetDirId,
  opts = {}
) {
  const {
    copy = true,
    maxDepth = 50,
    _depth = 0,
    onDiscovered,
    onProcessed,
    isAborted,
    _limiter,
    baseCozyPath
  } = opts

  const limiter = _limiter || createLimiter(3, isAborted)

  const summary = { filesCopied: 0, foldersCreated: 0, errors: [] }

  if (_depth > maxDepth) {
    const path = joinRemotePath(remotePath)
    summary.errors.push({
      path,
      name: extractName(path),
      status: null,
      reason: 'Max depth reached'
    })
    return summary
  }

  const path = joinRemotePath(remotePath)
  let probe

  try {
    probe = await probePath(client, accountId, path)
  } catch (e) {
    summary.errors.push({
      path,
      name: extractName(path),
      status: e?.status || null,
      reason:
        e?.status === 404
          ? 'Folder not found on remote provider'
          : String(e?.message || e)
    })
    return summary
  }

  if (probe.kind === 'file') {
    onDiscovered?.({ files: 1, path })

    const fileDoc = probe.file

    const task = limiter(async () => {
      try {
        if (!isAborted?.()) {
          const copied = await downstreamFile(client, fileDoc, targetDirId, {
            copy
          })
          if (copied) summary.filesCopied += 1
        }
      } catch (e) {
        summary.errors.push({
          path,
          name: extractName(path),
          status: e?.status || null,
          reason:
            e?.status === 404
              ? 'File not found on remote provider'
              : String(e?.message || e)
        })
      } finally {
        onProcessed?.({ path })
      }
    })

    try {
      await task
    } catch (e) {
      if (e?.isAborted) {
        return summary
      }
      throw e
    }

    return summary
  }

  const isRoot = path === '/' && _depth === 0
  let destId = targetDirId

  if (!isRoot) {
    if (!baseCozyPath) {
      throw new Error('baseCozyPath is required to import directories')
    }

    const filesCollection = client.collection('io.cozy.files')
    const cozyPath = buildCozyPath(baseCozyPath, path)
    const destDirId = await filesCollection.ensureDirectoryExists(cozyPath)
    destId = destDirId
    summary.foldersCreated += 1
  }

  const children = probe.items || []

  const filesInThisDir = children.reduce((count, child) => {
    const type = child?.type || child?.attributes?.type
    return type === 'directory' ? count : count + 1
  }, 0)

  if (filesInThisDir > 0) {
    onDiscovered?.({ files: filesInThisDir, path })
  }

  const tasks = []

  for (const child of children) {
    if (isAborted?.()) break

    const name = child?.name || child?.attributes?.name
    const type = child?.type || child?.attributes?.type
    const childPath =
      child?.path ||
      child?.attributes?.path ||
      joinRemotePath(`${path}/${name}`)

    if (type === 'directory') {
      const sub = await importPathRecursive(
        client,
        accountId,
        childPath,
        destId,
        {
          copy,
          maxDepth,
          _depth: _depth + 1,
          onDiscovered,
          onProcessed,
          isAborted,
          _limiter: limiter,
          baseCozyPath
        }
      )
      summary.filesCopied += sub.filesCopied
      summary.foldersCreated += sub.foldersCreated
      if (sub.errors?.length) summary.errors.push(...sub.errors)
    } else {
      const task = limiter(async () => {
        try {
          if (!isAborted?.()) {
            const copied = await downstreamFile(client, child, destId, { copy })
            if (copied) summary.filesCopied += 1
          }
        } catch (e) {
          summary.errors.push({
            path: childPath,
            name: extractName(childPath),
            status: e?.status || null,
            reason:
              e?.status === 404
                ? 'File not found on remote provider'
                : String(e?.message || e)
          })
        } finally {
          onProcessed?.({ path: childPath })
        }
      })

      tasks.push(task)
    }
  }

  if (tasks.length > 0) {
    try {
      await Promise.all(tasks)
    } catch (e) {
      if (e?.isAborted) {
        return summary
      }
      throw e
    }
  }

  return summary
}
