import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import * as tagController from '../controllers/tagController'

// ==========================================================================
// 标签路由（Router）
// ==========================================================================
// 类比：就像 Vue Router 里的 `routes` 配置，这里定义了所有和"标签"相关的 API 路径。
// 但这里是"后端路由"——定义的是服务器暴露给前端的 HTTP 接口。
// 最终效果：前端调用 `axios.get('/api/tags')` 时，就会命中下面的 `router.get('/', ...)`。
// ==========================================================================

const router = Router()

// GET /api/tags — 获取所有标签列表（公开，不需要登录）
router.get('/', tagController.getAll)

// GET /api/tags/:id — 根据ID获取单个标签详情（公开，不需要登录）
// `:id` 是 URL 参数占位符，如访问 `/api/tags/5`，req.params.id 就是 "5"
router.get('/:id', tagController.getById)

// GET /api/tags/slug/:slug — 根据slug获取单个标签详情（公开，不需要登录）
// `:slug` 是 URL 参数占位符，如访问 `/api/tags/slug/javascript`，req.params.slug 就是 "javascript"
router.get('/slug/:slug', tagController.getBySlug)

// POST /api/tags — 创建新标签（需要登录）
// authenticateToken 会先验证 token，如果用户未登录，直接返回 401，不会执行 create
router.post('/', authenticateToken, tagController.create)

// PUT /api/tags/:id — 更新标签（需要登录）
router.put('/:id', authenticateToken, tagController.update)

// DELETE /api/tags/:id — 删除标签（需要登录）
router.delete('/:id', authenticateToken, tagController.remove)

// POST /api/posts/:postId/tags — 为文章添加标签（需要登录）
// `:postId` 是 URL 参数占位符，如访问 `/api/posts/5/tags`，req.params.postId 就是 "5"
router.post('/posts/:postId/tags', authenticateToken, tagController.addTagsToPost)

// DELETE /api/posts/:postId/tags/:tagId — 从文章移除标签（需要登录）
// `:postId` 和 `:tagId` 是 URL 参数占位符
router.delete('/posts/:postId/tags/:tagId', authenticateToken, tagController.removeTagFromPost)

// 导出路由，供 app.ts 使用：app.use('/api/tags', tagRoutes)
export default router
