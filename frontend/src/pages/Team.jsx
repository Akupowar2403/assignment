import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/ui/Button'
import { DataTable } from '../components/ui/DataTable'
import { Input, Select } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { ErrorState, Spinner } from '../components/ui/States'
import { useCurrentUser } from '../context/CurrentUserContext'
import { formatDate } from '../lib/format'
import { userService } from '../services/users'

const ROLES = [
  { value: 'member', label: 'Member' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

const blank = { name: '', email: '', role: 'member' }

function AddUserModal({ open, onClose, onSaved }) {
  const [values, setValues] = useState(blank)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await userService.create(values)
      setValues(blank)
      onSaved()
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Add team member"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button form="user-form" type="submit" disabled={saving || !values.name || !values.email}>
            {saving && <Spinner />}
            Add member
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="space-y-4">
        {error && <ErrorState error={error} />}
        <Input label="Name" required value={values.name} onChange={set('name')} placeholder="Jane Doe" />
        <Input
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={set('email')}
          placeholder="jane@webvory.com"
        />
        <Select label="Role" options={ROLES} value={values.role} onChange={set('role')} />
      </form>
    </Modal>
  )
}

const COLUMNS = [
  {
    key: 'name',
    header: 'Member',
    render: (user) => (
      <div className="flex items-center gap-3">
        <Avatar user={user} />
        <div>
          <p className="font-medium text-ink">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (user) => <span className="capitalize text-ink">{user.role}</span>,
  },
  {
    key: 'created_at',
    header: 'Joined',
    className: 'font-mono tnum text-[13px] text-muted',
    render: (user) => formatDate(user.created_at),
  },
]

export function TeamPage() {
  const { users, loading, reloadUsers } = useCurrentUser()
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-tight text-ink">
            Team
          </h1>
          <p className="mt-0.5 text-sm text-muted">People who can be assigned tasks.</p>
        </div>
        <Button onClick={() => setAdding(true)}>Add member</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-rule bg-surface">
        <DataTable columns={COLUMNS} rows={users} loading={loading} minWidth={480} />
      </div>

      <AddUserModal
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={() => {
          setAdding(false)
          reloadUsers()
        }}
      />
    </div>
  )
}
