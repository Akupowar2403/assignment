import { api } from '../lib/api'

export const taskService = {
  list: (params) => api.get('/api/tasks', params),
  get: (id) => api.get(`/api/tasks/${id}`),
  create: (task) => api.post('/api/tasks', task),
  update: (id, changes) => api.put(`/api/tasks/${id}`, changes),
  remove: (id) => api.delete(`/api/tasks/${id}`),
  listComments: (id) => api.get(`/api/tasks/${id}/comments`),
  addComment: (id, comment) => api.post(`/api/tasks/${id}/comments`, comment),
}
