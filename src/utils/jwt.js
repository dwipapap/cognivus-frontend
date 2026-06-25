const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '='
  )
  const binary = globalThis.atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

export const getJwtExpiry = (token) => {
  if (typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) return null

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]))
    const expiresAt = Number(payload.exp)

    if (!Number.isFinite(expiresAt) || expiresAt <= 0) return null

    return expiresAt * 1000
  } catch {
    return null
  }
}
