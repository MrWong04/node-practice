import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './auth'

const service = axios.create({
  baseURL: '/local/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 这些接口本身就是鉴权入口或由路由守卫负责处理登录态：
// - /auth/login、/auth/register：401 表示"凭据错误"（如密码不对），不是"会话失效"，不能跳登录页
// - /auth/me：由路由守卫在刷新时调用，失败由守卫自行清理，避免与守卫重复跳转
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/me']

// 防止并发请求同时命中 401/403 时重复弹窗、重复跳转
let isRedirecting = false

service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const requestUrl: string = error.config?.url || ''

    // 未登录 / 登录失效（特定错误码 401、403）：清态 + 跳登录页
    // 排除鉴权入口接口，避免登录页输错密码被误判为"会话失效"
    if ((status === 401 || status === 403) && !AUTH_ENDPOINTS.some((p) => requestUrl.includes(p))) {
      handleUnauthorized()
    }

    return Promise.reject(error)
  }
)

/**
 * 统一处理"登录失效"：
 * 1. 清除本地 token（store 的清理交给路由守卫在下次导航时同步）
 * 2. 提示用户
 * 3. 跳转登录页，并携带当前路径作为 redirect，登录后回跳
 *
 * 跳转用 window.location.hash 而非 router 实例，是为了让 service.ts
 * 不静态依赖 router（router 反向依赖了 api -> service），彻底切断循环依赖。
 * 本项目使用 createWebHashHistory，直接改 hash 即可触发路由跳转。
 */
function handleUnauthorized() {
  if (isRedirecting) return
  isRedirecting = true

  removeToken()
  ElMessage.warning('登录已失效，请重新登录')

  // 当前路径（去掉 hash 前缀 '#'），作为登录后回跳目标
  const current = window.location.hash.replace(/^#/, '') || '/'
  if (!current.startsWith('/auth/login')) {
    window.location.hash = `#/auth/login?redirect=${encodeURIComponent(current)}`
  }

  // 短暂锁定期，消化掉同一批并发请求的重复触发
  setTimeout(() => {
    isRedirecting = false
  }, 1500)
}

export { service }
export default service
