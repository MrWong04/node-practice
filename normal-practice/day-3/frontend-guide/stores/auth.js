import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../api/request'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  async function register(email, password, name) {
    const res = await request.post('/auth/register', { email, password, name })
    if (res.success) {
      token.value = res.data.token
      user.value = res.data.user
      localStorage.setItem('token', res.data.token)
    }
    return res
  }

  async function login(email, password) {
    const res = await request.post('/auth/login', { email, password })
    if (res.success) {
      token.value = res.data.token
      user.value = res.data.user
      localStorage.setItem('token', res.data.token)
    }
    return res
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await request.get('/auth/me')
      if (res.success) {
        user.value = res.data
      }
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isLoggedIn,
    register,
    login,
    fetchUser,
    logout,
  }
})
