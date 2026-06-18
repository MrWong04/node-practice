import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import * as postController from '../controllers/postController'

// ==========================================================================
// 文章路由（Router）
// ==========================================================================
// 类比：就像 Vue Router 里的 `routes` 配置，这里定义了所有和"文章"相关的 API 路径。
// 但这里是"后端路由"——定义的是服务器暴露给前端的 HTTP 接口。
// 最终效果：前端调用 `axios.get('/api/posts')` 时，就会命中下面的 `router.get('/', ...)`。
// ==========================================================================

const router = Router()

// GET /api/posts — 获取所有文章列表（公开，不需要登录）
router.get('/', postController.getAll)

// GET /api/posts/:id — 获取单篇文章详情（公开，不需要登录）
// `:id` 是 URL 参数占位符，如访问 `/api/posts/5`，req.params.id 就是 "5"
router.get('/:id', postController.getById)

// POST /api/posts — 创建新文章（需要登录）
// authenticateToken 会先验证 token，如果用户未登录，直接返回 401，不会执行 create
router.post('/', authenticateToken, postController.create)

// PUT /api/posts/:id — 更新文章（需要登录，且只能改自己的文章）
// 权限细查在 Service 层做，这里只做"登录校验"
router.put('/:id', authenticateToken, postController.update)

// DELETE /api/posts/:id — 删除文章（需要登录，且只能删自己的文章）
router.delete('/:id', authenticateToken, postController.remove)

// 导出路由，供 app.ts 使用：app.use('/api/posts', postRoutes)
export default router
