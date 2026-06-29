import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import * as categoryController from '../controllers/categoryController'

// ==========================================================================
// 分类路由（Router）
// ==========================================================================
// 类比：就像 Vue Router 里的 `routes` 配置，这里定义了所有和"分类"相关的 API 路径。
// 但这里是"后端路由"——定义的是服务器暴露给前端的 HTTP 接口。
// 最终效果：前端调用 `axios.get('/api/categories')` 时，就会命中下面的 `router.get('/', ...)`。
// ==========================================================================

const router = Router()

// GET /api/categories — 获取所有分类列表（公开，不需要登录）
router.get('/', categoryController.getAll)

// GET /api/categories/:id — 根据ID获取单个分类详情（公开，不需要登录）
// `:id` 是 URL 参数占位符，如访问 `/api/categories/5`，req.params.id 就是 "5"
router.get('/:id', categoryController.getById)

// GET /api/categories/slug/:slug — 根据slug获取单个分类详情（公开，不需要登录）
// `:slug` 是 URL 参数占位符，如访问 `/api/categories/slug/tech`，req.params.slug 就是 "tech"
router.get('/slug/:slug', categoryController.getBySlug)

// POST /api/categories — 创建新分类（需要登录）
// authenticateToken 会先验证 token，如果用户未登录，直接返回 401，不会执行 create
router.post('/', authenticateToken, categoryController.create)

// PUT /api/categories/:id — 更新分类（需要登录）
router.put('/:id', authenticateToken, categoryController.update)

// DELETE /api/categories/:id — 删除分类（需要登录）
router.delete('/:id', authenticateToken, categoryController.remove)

// 导出路由，供 app.ts 使用：app.use('/api/categories', categoryRoutes)
export default router
