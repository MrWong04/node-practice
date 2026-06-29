import { Request, Response, NextFunction } from 'express'
import { successResponse } from '../utils/response'
import { parseOptionalString, parsePagination } from '../utils/query'
import * as categoryService from '../services/categoryService'

// ==========================================================================
// 分类 Controller（请求处理层）
// ==========================================================================
// 类比：如果把整个后端看作一个"黑盒 API"，Controller 就是"最外层的入口"。
// 它的工作很简单："接请求 → 调 Service → 包装响应 → 出错就 next(err)"。
// ==========================================================================

/**
 * 获取分类列表（支持筛选与分页）
 * 对应前端：`GET /api/categories`
 * 可选查询参数：keyword
 * 分页参数：page、pageSize
 * 返回 200 + { success: true, data: { items, pagination } }
 */
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const result = await categoryService.getAllCategories(
      {
        keyword: parseOptionalString(req.query.keyword),
      },
      pagination
    )
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

/**
 * 根据 ID 获取单个分类详情
 * 对应前端：`GET /api/categories/:id`
 * 从 req.params.id 拿到 URL 中的分类 ID（如 `/categories/5`），转成数字后传给 Service。
 * 返回 200 + { success: true, data: { id, name, slug, ... } }
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const category = await categoryService.getCategoryById(id)
    res.json(successResponse(category))
  } catch (err) {
    next(err)
  }
}

/**
 * 根据 slug 获取单个分类详情
 * 对应前端：`GET /api/categories/slug/:slug`
 * 从 req.params.slug 拿到 URL 中的分类 slug。
 * 返回 200 + { success: true, data: { id, name, slug, ... } }
 */
export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string
    const category = await categoryService.getCategoryBySlug(slug)
    res.json(successResponse(category))
  } catch (err) {
    next(err)
  }
}

/**
 * 创建新分类
 * 对应前端：`POST /api/categories`
 * 前提：用户已登录（req.user 存在）。
 * 从 req.body 取 name/slug。
 * 返回 201 + { success: true, data: { 新分类 } }
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug } = req.body
    const category = await categoryService.createCategory(name, slug)
    res.status(201).json(successResponse(category))
  } catch (err) {
    next(err)
  }
}

/**
 * 更新分类
 * 对应前端：`PUT /api/categories/:id`
 * 从 req.params.id 拿分类 ID，从 req.body 拿新名称/slug。
 * 返回 200 + { success: true, data: { 更新后的分类 } }
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const { name, slug } = req.body
    const category = await categoryService.updateCategory(id, name, slug)
    res.json(successResponse(category))
  } catch (err) {
    next(err)
  }
}

/**
 * 删除分类
 * 对应前端：`DELETE /api/categories/:id`
 * 从 req.params.id 拿分类 ID。
 * 返回 200 + { success: true, data: { 被删除的分类 } }
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const category = await categoryService.deleteCategory(id)
    res.json(successResponse(category))
  } catch (err) {
    next(err)
  }
}
