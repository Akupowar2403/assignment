const DATE = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

// The API stores naive UTC; append Z so the browser reads it as UTC, not local.
const parse = (value) => (value ? new Date(value.endsWith('Z') ? value : `${value}Z`) : null)

export const formatDate = (value) => {
  const date = parse(value)
  return date ? DATE.format(date) : '—'
}

export const formatDateTime = (value) => {
  const date = parse(value)
  return date ? DATE_TIME.format(date) : '—'
}

/** `datetime-local` input value (local time) from an API timestamp, and back. */
export const toInputValue = (value) => {
  const date = parse(value)
  if (!date) return ''
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export const fromInputValue = (value) => (value ? new Date(value).toISOString() : null)

export const initials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
