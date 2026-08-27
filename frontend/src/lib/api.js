const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

/** Turn FastAPI's 422 body into a single readable line. */
function describe(body, status) {
  const detail = body?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((e) => `${e.loc?.slice(1).join('.') || 'request'}: ${e.msg}`).join('; ')
  }
  return `Request failed with status ${status}`
}

function withQuery(path, params) {
  if (!params) return path
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }
  const qs = query.toString()
  return qs ? `${path}?${qs}` : path
}

async function request(method, path, { params, body } = {}) {
  const response = await fetch(BASE_URL + withQuery(path, params), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(describe(payload, response.status), response.status, payload)
  return payload
}

export const api = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  delete: (path) => request('DELETE', path),
}
