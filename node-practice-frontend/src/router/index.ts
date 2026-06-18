import { createRouter, createWebHashHistory } from 'vue-router'
import prospectRoutes from './modules/prospect'
import backgroundRoutes from './modules/background'
import authRoutes from './modules/auth'
import { getMeApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'

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

  // 刷新页面时，若 token 存在且 userStore 无用户信息，自动获取
  const token = localStorage.getItem('blog_token')
  const userStore = useUserStore()
  if (token && !userStore.isLoggedIn) {
    try {
      const res = await getMeApi()
      if (res.success) {
        userStore.setUser(res.data)
      }
    } catch {
      // 静默处理，失败不影响路由跳转
    }
  }

  next()
})

export default router
