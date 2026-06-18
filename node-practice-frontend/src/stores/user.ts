import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!user.value)

  // Actions
  const setUser = (userData: User) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    setUser,
    clearUser
  }
})
