import { createRouter, createWebHashHistory } from 'vue-router'
import prospectRoutes from './modules/prospect'
import backgroundRoutes from './modules/background'
import authRoutes from './modules/auth'
import { getMeApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { getToken, removeToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...prospectRoutes, ...backgroundRoutes, ...authRoutes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

const DEFAULT_TITLE = '我的blog'
router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE

  const token = getToken()
  const userStore = useUserStore()

  // 1. token 已被清除（如接口 401 被拦截器清态）但 store 还残留用户信息 → 同步清理
  if (!token && userStore.isLoggedIn) {
    userStore.clearUser()
  }

  // 2. 有 token 但 store 无用户信息（如刷新页面后 Pinia 重置）→ 补拉一次
  //    /auth/me 的 401 由守卫这里自行处理，不走响应拦截器跳转，避免与守卫重复
  if (token && !userStore.isLoggedIn) {
    try {
      const res = await getMeApi()
      if (res.success) {
        userStore.setUser(res.data)
      }
    } catch {
      // token 已失效：清理登录态（后续若目标页需要登录则跳登录页）
      removeToken()
      userStore.clearUser()
    }
  }

  // 3. 目标页面需要登录但当前无 token → 跳登录页，并记录来源页
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (requiresAuth && !getToken()) {
    return next({ path: '/auth/login', query: { redirect: to.fullPath } })
  }

  // 4. 已登录还想去登录页 → 直接送回来源页或首页，避免重复登录
  if (to.path === '/auth/login' && getToken() && userStore.isLoggedIn) {
    return next((to.query.redirect as string) || '/')
  }

  next()
})

export default router
