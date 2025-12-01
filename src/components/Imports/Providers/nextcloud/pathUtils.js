export function joinRemotePath(path) {
  if (!path) return '/'
  let p = String(path).trim()
  p = p.replace(/\\/g, '/')
  p = p.replace(/\/+/g, '/')
  if (!p.startsWith('/')) p = '/' + p
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

export function extractName(path) {
  const clean = joinRemotePath(path || '/')
  const parts = clean.split('/').filter(Boolean)
  return parts.pop() || '/'
}

export function build404Reason(path) {
  const name = extractName(path)
  const hasWeirdChars = /[^\u0020-\u007E]/.test(name) || /[*'^()]/.test(name)
  return hasWeirdChars
    ? 'probable unsupported characters on Cozy side'
    : 'not found on remote provider'
}
