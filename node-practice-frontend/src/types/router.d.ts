import 'vue-router'

declare module 'vue-router' {
  // 路由元信息类型增强：在原 RouteMeta 基础上补充项目用到的字段
  interface RouteMeta {
    title?: string
    // 是否需要登录才能访问，路由守卫据此拦截未登录用户
    requiresAuth?: boolean
  }
}
