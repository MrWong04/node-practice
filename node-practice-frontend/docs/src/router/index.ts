import { createRouter, createWebHashHistory } from 'vue-router'
import homeRoutes from './modules/home'
import { useUserStore } from '@/stores/user'
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...homeRoutes],
  scrollBehavior(to, from, savedPosition) {
    // 处理滚动位置
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})
// 设置默认标题
const DEFAULT_TITLE = '有餐'
router.beforeEach((to, from, next) => {
  // 从路由的meta中获取title
  document.title = to.meta.title ? `${to.meta.title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE

  // 处理详情页跳转
  if (to.query.detail && to.query.detail !== 'undefined') {
    return next({ path: `/${to.query.detail}`, query: { id: to.query.id } })
  }

  next()
})

export default router
