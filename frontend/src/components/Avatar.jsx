import { initials } from '../lib/format'

export function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'size-6 text-[10px]', md: 'size-8 text-xs' }

  if (!user) {
    return (
      <span className={`inline-flex ${sizes[size]} items-center justify-center rounded-full border border-dashed border-line text-muted`}>
        ?
      </span>
    )
  }

  return (
    <span
      title={user.email}
      className={`inline-flex ${sizes[size]} items-center justify-center rounded-full bg-brand-soft font-semibold text-brand`}
    >
      {initials(user.name)}
    </span>
  )
}

export function UserCell({ user }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar user={user} size="sm" />
      <span className={user ? 'text-ink' : 'text-muted italic'}>{user?.name ?? 'Unassigned'}</span>
    </div>
  )
}
