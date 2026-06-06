import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/posts',
    name: 'Posts',
    component: () => import('../views/PostsView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }, // 已登录用户不能访问
  },
  {
    path: '/my-posts',
    name: 'MyPosts',
    component: () => import('../views/MyPostsView.vue'),
    meta: { requiresAuth: true }, // 需要登录
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 需要登录但未登录 → 跳转登录页
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next('/login')
  }

  // 已登录但访问登录页 → 跳转首页
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return next('/')
  }

  next()
})

export default router
