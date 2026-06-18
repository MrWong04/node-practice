import { Request, Response, NextFunction } from 'express'
import { successResponse } from '../utils/response'
import * as authService from '../services/authService'

// ==========================================================================
// 认证 Controller（请求处理层）
// ==========================================================================
// 类比理解：Controller 就像 Vue 项目里的 "页面组件"——它负责：
// 1. 从 HTTP 请求中"取出"前端传来的数据（类比 Vue 的 `event.target.value` 或 `route.params`）
// 2. 调用 Service（类比 Vue 组件调用 Pinia Store 的 action）
// 3. 把 Service 返回的数据"包装"成 HTTP 响应格式发回给前端（类比 Vue 更新视图）
// 4. 如果 Service 抛出了错误，通过 `next(err)` 交给全局错误处理中间件
//
// 三个参数解释：
// - req（Request）：HTTP 请求对象，包含前端传来的 body、params、headers、token 等
// - res（Response）：HTTP 响应对象，用来返回状态码、JSON 数据给前端
// - next（NextFunction）："接力棒"——如果出错了，把错误传给下一个中间件处理
// ==========================================================================

/**
 * 用户注册接口
 * 对应前端：`POST /api/auth/register`
 * 前端传的数据：`{ email: 'xxx', password: 'xxx', name: 'xxx' }`
 * 这里做的事：从 req.body 取出数据，调用 authService.registerUser 处理，返回 201 + { success: true, data: { user, token } }
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body
    const result = await authService.registerUser(email, password, name)
    res.status(201).json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

/**
 * 用户登录接口
 * 对应前端：`POST /api/auth/login`
 * 前端传的数据：`{ email: 'xxx', password: 'xxx' }`
 * 返回 200 + { success: true, data: { user, token } }
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body
    const result = await authService.loginUser(email, password)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

/**
 * 获取当前登录用户信息
 * 对应前端：`GET /api/auth/me`
 * 注意：这个接口带了 `authenticateToken` 中间件（在 routes 里配置），
 * 所以进入这个函数前，req.user 已经被赋值了（包含 userId 和 email）。
 * 这里直接拿 req.user!.userId 去查数据库，返回用户信息。
 */
export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUserById(req.user!.userId)
    res.json(successResponse(user))
  } catch (err) {
    next(err)
  }
}
