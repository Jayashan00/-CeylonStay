import axios from 'axios'

// Hardcoded to your live PHP backend so there's no env-file step to get wrong.
// If you ever run this locally against your old Java backend again, you can
// temporarily change this one line back to 'http://localhost:8080/api'.
const API_BASE_URL = 'https://directbooking.lk/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ceylonstay_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ceylonstay_token')
      localStorage.removeItem('ceylonstay_user')
    }
    return Promise.reject(err)
  }
)

export default api