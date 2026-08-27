import { api } from '../lib/api'

export const userService = {
  list: () => api.get('/api/users'),
  create: (user) => api.post('/api/users', user),
}
