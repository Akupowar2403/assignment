import { api } from '../lib/api'

export const dashboardService = {
  stats: (userId) => api.get('/api/dashboard', { user_id: userId }),
}
