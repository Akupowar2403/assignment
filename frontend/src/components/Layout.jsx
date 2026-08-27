import { NavLink, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../context/CurrentUserContext'
import { initials } from '../lib/format'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tasks' },
  { to: '/team', label: 'Team' },
]

function CurrentUserPicker() {
  const { users, currentUserId, setCurrentUserId, currentUser } = useCurrentUser()

  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded bg-console-line font-mono text-[11px] font-medium text-white">
        {currentUser ? initials(currentUser.name) : '··'}
      </span>
      <select
        value={currentUserId ?? ''}
        onChange={(e) => setCurrentUserId(Number(e.target.value))}
        aria-label="Current user"
        className="rounded border border-console-line bg-transparent px-2 py-1 text-[13px] text-white outline-none transition-colors hover:border-console-dim"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id} className="bg-console text-white">
            {user.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Layout() {
  return (
    <div className="min-h-screen bg-ground">
      {/* A slim graphite bar frames the light work surface below it. */}
      <header className="sticky top-0 z-40 bg-console">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2.5 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[15px] font-bold tracking-tight text-white">
              Taskdesk
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-console-dim uppercase">
              Internal
            </span>
          </div>

          <nav className="flex items-center gap-0.5">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-console-dim hover:text-white'
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

      <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
