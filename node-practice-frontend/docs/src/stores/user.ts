/**
 * @description: 用户信息管理
 */
import { defineStore } from 'pinia'
import type { User } from '@/typings/user'
import { urlConfig } from '@/config/urlConfig'
import {
  getLocalStorage,
  setLocalStorage,
  setSessionStorage,
  queryAplusUrl,
  queryLocationParam,
  getSessionStorage
} from '@/utils/common'
// import { useRouter } from 'vue-router'
// const router = useRouter()
import router from '@/router'

interface Enterprise {
  enterpriseId: string
  // Define other properties of Enterprise here
}
interface UserState {}

export const useUserStore = defineStore('user', {
  // 开启数据持久化
  persist: true,
  state: (): UserState => ({}),
  getters: {
    /**
     * @description: 获取完整用户信息
     * @returns {UserState}
     */
    getUserInfo(state): UserState {
      return state
    }
  },
  actions: {
    /**
     * @description: 用户登出，清除所有信息
     */
    logout() {
      return new Promise<void>((resolve) => {
        resolve()
      })
    }
  }
})
