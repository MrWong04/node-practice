import { createRouter, createWebHashHistory } from 'vue-router'
import prospectRoutes from './modules/prospect'
import backgroundRoutes from './modules/background'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...prospectRoutes, ...backgroundRoutes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

const DEFAULT_TITLE = '我的blog'
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE
  next()
})

export default router
