import { createRouter, createWebHashHistory } from 'vue-router'
import homeRoutes from './modules/home'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...homeRoutes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

const DEFAULT_TITLE = '后台管理系统'
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE
  next()
})

export default router
