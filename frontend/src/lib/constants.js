export const STATUSES = [
  { value: 'pending', label: 'Pending', tone: 'neutral' },
  { value: 'in_progress', label: 'In progress', tone: 'blue' },
  { value: 'completed', label: 'Completed', tone: 'green' },
  { value: 'blocked', label: 'Blocked', tone: 'red' },
]

export const PRIORITIES = [
  { value: 'low', label: 'Low', tone: 'neutral' },
  { value: 'medium', label: 'Medium', tone: 'blue' },
  { value: 'high', label: 'High', tone: 'amber' },
  { value: 'urgent', label: 'Urgent', tone: 'red' },
]

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created date' },
  { value: 'updated_at', label: 'Last updated' },
  { value: 'due_date', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
]

export const PAGE_SIZE = 10

/** Colour carries meaning in this UI, so every tone resolves to one signal token. */
export const TONE_COLOR = {
  neutral: 'var(--color-sig-neutral)',
  blue: 'var(--color-sig-blue)',
  amber: 'var(--color-sig-amber)',
  red: 'var(--color-sig-red)',
  green: 'var(--color-sig-green)',
}

const byValue = (list) => Object.fromEntries(list.map((o) => [o.value, o]))
export const STATUS_BY_VALUE = byValue(STATUSES)
export const PRIORITY_BY_VALUE = byValue(PRIORITIES)

export const priorityColor = (value) => TONE_COLOR[PRIORITY_BY_VALUE[value].tone]
