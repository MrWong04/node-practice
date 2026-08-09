// ==========================================================================
// 登录态（token）存取工具
// --------------------------------------------------------------------------
// 只负责 localStorage 读写，不引入 Pinia store / router，避免与
// service.ts、router/index.ts 之间形成循环依赖。
// store 的清理统一在路由守卫里按 token 状态同步。
// ==========================================================================

const TOKEN_KEY = 'blog_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
