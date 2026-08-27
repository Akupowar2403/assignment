import { useState } from 'react'
import { useCurrentUser } from '../context/CurrentUserContext'
import { fromInputValue, toInputValue } from '../lib/format'
import { PRIORITIES, STATUSES } from '../lib/constants'
import { taskService } from '../services/tasks'
import { Button } from './ui/Button'
import { Input, Select, Textarea } from './ui/Field'
import { Modal } from './ui/Modal'
import { ErrorState, Spinner } from './ui/States'

const blank = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  assigned_to: '',
  due_date: '',
}

const toFormValues = (task) =>
  task
    ? {
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to ?? '',
        due_date: toInputValue(task.due_date),
      }
    : blank

/** Create when `task` is null, edit otherwise. `onSaved` receives the saved task. */
export function TaskForm({ open, task, onClose, onSaved }) {
  const { users } = useCurrentUser()
  const [values, setValues] = useState(() => toFormValues(task))
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...values,
      description: values.description || null,
      assigned_to: values.assigned_to ? Number(values.assigned_to) : null,
      due_date: fromInputValue(values.due_date),
    }
    try {
      const saved = task
        ? await taskService.update(task.id, payload)
        : await taskService.create(payload)
      onSaved(saved)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={task ? 'Edit task' : 'New task'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button form="task-form" type="submit" disabled={saving || !values.title.trim()}>
            {saving && <Spinner />}
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="space-y-4">
        {error && <ErrorState error={error} />}
        <Input
          label="Title"
          required
          maxLength={200}
          placeholder="What needs doing?"
          value={values.title}
          onChange={set('title')}
        />
        <Textarea
          label="Description"
          rows={3}
          placeholder="Context, links, acceptance criteria…"
          value={values.description}
          onChange={set('description')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Status" options={STATUSES} value={values.status} onChange={set('status')} />
          <Select label="Priority" options={PRIORITIES} value={values.priority} onChange={set('priority')} />
          <Select
            label="Assign to"
            placeholder="Unassigned"
            options={users.map((u) => ({ value: u.id, label: u.name }))}
            value={values.assigned_to}
            onChange={set('assigned_to')}
          />
          <Input
            label="Due date"
            type="datetime-local"
            value={values.due_date}
            onChange={set('due_date')}
          />
        </div>
      </form>
    </Modal>
  )
}
