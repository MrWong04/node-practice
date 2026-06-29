import { Request, Response, NextFunction } from 'express'
import { successResponse } from '../utils/response'
import { parseOptionalString, parsePagination } from '../utils/query'
import * as tagService from '../services/tagService'

// ==========================================================================
// 标签 Controller（请求处理层）
// ==========================================================================
// 类比：如果把整个后端看作一个"黑盒 API"，Controller 就是"最外层的入口"。
// 它的工作很简单："接请求 → 调 Service → 包装响应 → 出错就 next(err)"。
// ==========================================================================

/**
 * 获取标签列表（支持筛选与分页）
 * 对应前端：`GET /api/tags`
 * 可选查询参数：keyword
 * 分页参数：page、pageSize
 * 返回 200 + { success: true, data: { items, pagination } }
 */
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>)
    const result = await tagService.getAllTags(
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
 * 根据 ID 获取单个标签详情
 * 对应前端：`GET /api/tags/:id`
 * 从 req.params.id 拿到 URL 中的标签 ID（如 `/tags/5`），转成数字后传给 Service。
 * 返回 200 + { success: true, data: { id, name, slug, ... } }
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const tag = await tagService.getTagById(id)
    res.json(successResponse(tag))
  } catch (err) {
    next(err)
  }
}

/**
 * 根据 slug 获取单个标签详情
 * 对应前端：`GET /api/tags/slug/:slug`
 * 从 req.params.slug 拿到 URL 中的标签 slug。
 * 返回 200 + { success: true, data: { id, name, slug, ... } }
 */
export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string
    const tag = await tagService.getTagBySlug(slug)
    res.json(successResponse(tag))
  } catch (err) {
    next(err)
  }
}

/**
 * 创建新标签
 * 对应前端：`POST /api/tags`
 * 前提：用户已登录（req.user 存在）。
 * 从 req.body 取 name/slug。
 * 返回 201 + { success: true, data: { 新标签 } }
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug } = req.body
    const tag = await tagService.createTag(name, slug)
    res.status(201).json(successResponse(tag))
  } catch (err) {
    next(err)
  }
}

/**
 * 更新标签
 * 对应前端：`PUT /api/tags/:id`
 * 从 req.params.id 拿标签 ID，从 req.body 拿新名称/slug。
 * 返回 200 + { success: true, data: { 更新后的标签 } }
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const { name, slug } = req.body
    const tag = await tagService.updateTag(id, name, slug)
    res.json(successResponse(tag))
  } catch (err) {
    next(err)
  }
}

/**
 * 删除标签
 * 对应前端：`DELETE /api/tags/:id`
 * 从 req.params.id 拿标签 ID。
 * 返回 200 + { success: true, data: { 被删除的标签 } }
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const tag = await tagService.deleteTag(id)
    res.json(successResponse(tag))
  } catch (err) {
    next(err)
  }
}

/**
 * 为文章添加标签
 * 对应前端：`POST /api/posts/:postId/tags`
 * 从 req.params.postId 拿文章 ID，从 req.body.tagIds 拿标签 ID 数组。
 * 返回 200 + { success: true, data: { 更新后的文章 } }
 */
export async function addTagsToPost(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = parseInt(req.params.postId as string, 10)
    const { tagIds } = req.body
    const result = await tagService.addTagsToPost(postId, tagIds)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

/**
 * 从文章移除标签
 * 对应前端：`DELETE /api/posts/:postId/tags/:tagId`
 * 从 req.params.postId 拿文章 ID，从 req.params.tagId 拿标签 ID。
 * 返回 200 + { success: true, data: { 更新后的文章 } }
 */
export async function removeTagFromPost(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = parseInt(req.params.postId as string, 10)
    const tagId = parseInt(req.params.tagId as string, 10)
    const result = await tagService.removeTagFromPost(postId, tagId)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}
