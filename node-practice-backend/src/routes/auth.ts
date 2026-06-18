import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import * as authController from '../controllers/authController'

// ==========================================================================
// 认证路由（Router）
// ==========================================================================
// 类比理解：这就像 Vue Router 的 `routes` 数组——定义了"访问哪个 URL 时，执行哪个逻辑"。
// 但这里是后端路由，不是前端路由。它告诉 Express：
// "当有人访问 /api/auth/register 时，调用 authController.register 函数"
// ==========================================================================

// 创建一个路由实例（类似 Vue Router 的 `createRouter()`）
const router = Router()

// POST /api/auth/register — 用户注册
// 不需要登录，直接调用 controller 的 register 函数
router.post('/register', authController.register)

// POST /api/auth/login — 用户登录
// 不需要登录，直接调用 controller 的 login 函数
router.post('/login', authController.login)

// GET /api/auth/me — 获取当前登录用户信息
// 注意：这里多了 `authenticateToken` 中间件！
// 它的作用是：先检查请求头里有没有 `Authorization: Bearer <token>`，
// 如果有且有效，就把解码后的用户信息（req.user）挂载到请求上，再进入 controller。
// 如果没有 token 或 token 无效，直接返回 401/403，不会走到 controller。
router.get('/me', authenticateToken, authController.me)

// 导出路由，供 app.ts 使用：app.use('/api/auth', authRoutes)
export default router
