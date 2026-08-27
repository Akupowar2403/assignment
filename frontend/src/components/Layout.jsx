import { NavLink, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Avatar } from './Avatar'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tasks' },
  { to: '/team', label: 'Team' },
]

function CurrentUserPicker() {
  const { users, currentUserId, setCurrentUserId, currentUser } = useCurrentUser()

  return (
    <div className="flex items-center gap-2">
      <Avatar user={currentUser} />
      <select
        value={currentUserId ?? ''}
        onChange={(e) => setCurrentUserId(Number(e.target.value))}
        aria-label="Current user"
        className="rounded-lg border border-line bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Layout() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">
              T
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">Taskdesk</span>
          </div>

          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto">
            <CurrentUserPicker />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
