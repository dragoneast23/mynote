import axios from 'axios'

const BASE_URL = 'https://noteapi.c8.ccwu.cc/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = token
  }
  return config
})

api.interceptors.response.use(
  response => {
    if (response.data.code === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export const auth = {
  login: (data) => api.post('/login', data),
  wechatLogin: (data) => api.post('/wechat_login', data),
  register: (data) => api.post('/register', data),
  logout: () => api.get('/logout'),
  changePassword: (data) => api.post('/change_password', data),
  wechatScanLogin: () => api.post('/wechat_scan_login'),
  wechatScanCheck: (scene) => api.get(`/wechat_scan_check?scene=${scene}`)
}

export const notes = {
  getAll: () => api.get('/notes'),
  getOne: (id) => api.get(`/notes/${id}`),
  add: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  search: (keyword) => api.get(`/search?keyword=${encodeURIComponent(keyword)}`),
  export: () => api.post('/export')
}

export default api
