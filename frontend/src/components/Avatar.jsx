import { initials } from '../lib/format'

const SIZES = { sm: 'size-6 text-[10px]', md: 'size-8 text-[11px]' }

export function Avatar({ user, size = 'md' }) {
  if (!user) {
    return (
      <span
        className={`inline-grid ${SIZES[size]} place-items-center rounded border border-dashed border-rule font-mono text-muted`}
      >
        ·
      </span>
    )
  }

  return (
    <span
      title={user.email}
      className={`inline-grid ${SIZES[size]} place-items-center rounded bg-ground font-mono font-medium text-ink ring-1 ring-rule`}
    >
      {initials(user.name)}
    </span>
  )
}

export function UserCell({ user }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar user={user} size="sm" />
      <span className={user ? 'text-ink' : 'text-muted'}>{user?.name ?? 'Unassigned'}</span>
    </div>
  )
}
