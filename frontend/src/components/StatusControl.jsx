import { useState } from 'react'
import { STATUSES, STATUS_BY_VALUE, TONE_COLOR } from '../lib/constants'
import { taskService } from '../services/tasks'
import { Spinner } from './ui/States'

/**
 * Status is the field that changes most often, so it is editable in place
 * rather than behind the edit form. Saves on selection.
 */
export function StatusControl({ task, onChanged }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const change = async (event) => {
    setSaving(true)
    setError(null)
    try {
      await taskService.update(task.id, { status: event.target.value })
      onChanged()
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-surface py-1 pr-1 pl-2 transition-colors focus-within:border-ink">
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full"
          style={{ background: TONE_COLOR[STATUS_BY_VALUE[task.status].tone] }}
        />
        <select
          value={task.status}
          onChange={change}
          disabled={saving}
          aria-label="Status"
          className="bg-transparent pr-1 text-[13px] text-ink outline-none disabled:opacity-50"
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </span>
      {saving && <Spinner className="text-muted" />}
      {error && <span className="text-[13px] text-sig-red">{error.message}</span>}
    </span>
  )
}
