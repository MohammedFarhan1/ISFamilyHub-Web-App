import axios from 'axios'

const API_BASE_URL = 'https://isfamilyhub-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
}

// Expenses API
export const expensesAPI = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  getAnalytics: (params?: any) => api.get('/expenses/analytics', { params }),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
}

// Bills API
export const billsAPI = {
  getAll: () => api.get('/bills'),
  create: (data: any) => api.post('/bills', data),
  update: (id: string, data: any) => api.put(`/bills/${id}`, data),
  togglePaid: (id: string) => api.patch(`/bills/${id}/toggle-paid`),
  delete: (id: string) => api.delete(`/bills/${id}`),
}

// Groceries API
export const groceriesAPI = {
  getAll: (params?: any) => api.get('/groceries', { params }),
  create: (data: any) => api.post('/groceries', data),
  update: (id: string, data: any) => api.put(`/groceries/${id}`, data),
  togglePurchased: (id: string) => api.patch(`/groceries/${id}/toggle-purchased`),
  clearPurchased: () => api.delete('/groceries/purchased'),
  delete: (id: string) => api.delete(`/groceries/${id}`),
}

// Meals API
export const mealsAPI = {
  get: (params?: any) => api.get('/meals', { params }),
  update: (data: any) => api.put('/meals', data),
  updateMeal: (day: string, mealType: string, data: any) =>
    api.patch(`/meals/${day}/${mealType}`, data),
}

// Documents API
export const documentsAPI = {
  getAll: (params?: any) => api.get('/documents', { params }),
  upload: (formData: FormData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: any) => api.put(`/documents/${id}`, data),
  archive: (id: string) => api.patch(`/documents/${id}/archive`),
  delete: (id: string) => api.delete(`/documents/${id}`),
  getExpiring: (params?: any) => api.get('/documents/expiring', { params }),
}

// Inventory API
export const inventoryAPI = {
  getAll: (params?: any) => api.get('/inventory', { params }),
  getLocations: () => api.get('/inventory/locations'),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
}

// Milk API
export const milkAPI = {
  getByDate: (date: string) => api.get(`/milk/date/${date}`),
  getCurrentCycle: () => api.get('/milk/cycle/current'),
  getHistory: (year: number, month: number) => api.get(`/milk/history/${year}/${month}`),
  addEntry: (data: any) => api.post('/milk', data),
  deleteEntry: (date: string) => api.delete(`/milk/date/${date}`),
}

export default api
