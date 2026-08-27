import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CurrentUserProvider } from './context/CurrentUserContext'
import { DashboardPage } from './pages/Dashboard'
import { TasksPage } from './pages/Tasks'
import { TeamPage } from './pages/Team'

export default function App() {
  return (
    <CurrentUserProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </CurrentUserProvider>
  )
}
