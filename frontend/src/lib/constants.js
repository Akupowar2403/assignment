export const STATUSES = [
  { value: 'pending', label: 'Pending', tone: 'slate' },
  { value: 'in_progress', label: 'In Progress', tone: 'blue' },
  { value: 'completed', label: 'Completed', tone: 'green' },
  { value: 'blocked', label: 'Blocked', tone: 'red' },
]

export const PRIORITIES = [
  { value: 'low', label: 'Low', tone: 'slate' },
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

const byValue = (list) => Object.fromEntries(list.map((o) => [o.value, o]))
export const STATUS_BY_VALUE = byValue(STATUSES)
export const PRIORITY_BY_VALUE = byValue(PRIORITIES)
