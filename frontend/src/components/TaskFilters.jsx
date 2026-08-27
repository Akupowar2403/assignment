import { PRIORITIES, SORT_OPTIONS, STATUSES } from '../lib/constants'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Button } from './ui/Button'
import { Input, Select } from './ui/Field'

export function TaskFilters({ filters, onChange, onReset }) {
  const { users } = useCurrentUser()
  const set = (key) => (e) => onChange({ [key]: e.target.value })
  const dirty = Object.values(filters).some(Boolean)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div className="sm:col-span-2">
        <Input
          label="Search"
          placeholder="Title or description"
          value={filters.search}
          onChange={set('search')}
        />
      </div>
      <Select label="Status" placeholder="Any" options={STATUSES} value={filters.status} onChange={set('status')} />
      <Select label="Priority" placeholder="Any" options={PRIORITIES} value={filters.priority} onChange={set('priority')} />
      <Select
        label="Assignee"
        placeholder="Anyone"
        options={users.map((u) => ({ value: u.id, label: u.name }))}
        value={filters.assignee}
        onChange={set('assignee')}
      />
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select label="Sort" options={SORT_OPTIONS} value={filters.sort_by} onChange={set('sort_by')} />
        </div>
        {dirty && (
          <Button variant="ghost" size="sm" onClick={onReset} className="mb-0.5">
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
