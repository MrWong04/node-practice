import type { RouteRecordRaw } from 'vue-router'

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    redirect: '/auth/login',
    children: [
      {
        path: 'login',
        name: 'AuthLogin',
        component: () => import('@/views/auth/login/index.vue'),
        meta: {
          title: '登录/注册'
        }
      }
    ]
  }
]

export default authRoutes
