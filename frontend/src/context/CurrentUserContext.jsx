import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { userService } from '../services/users'

const CurrentUserContext = createContext(null)
const STORAGE_KEY = 'taskdesk:current-user'
const NO_USERS = []

/**
 * The app has no auth; "current user" is a picker in the header, persisted
 * locally. Swapping this for a real session later touches only this file.
 */
export function CurrentUserProvider({ children }) {
  const { data, loading, reload } = useApi(() => userService.list(), [])
  const [selectedId, setSelectedId] = useState(
    () => Number(localStorage.getItem(STORAGE_KEY)) || null,
  )

  const setCurrentUserId = useCallback((id) => {
    setSelectedId(id)
    localStorage.setItem(STORAGE_KEY, String(id))
  }, [])

  const value = useMemo(() => {
    const users = data ?? NO_USERS
    // Fall back to the first member until someone picks, or if the stored pick is gone.
    const currentUser = users.find((u) => u.id === selectedId) ?? users[0] ?? null
    return {
      users,
      loading,
      reloadUsers: reload,
      currentUser,
      currentUserId: currentUser?.id ?? null,
      setCurrentUserId,
    }
  }, [data, loading, reload, selectedId, setCurrentUserId])

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export const useCurrentUser = () => useContext(CurrentUserContext)
