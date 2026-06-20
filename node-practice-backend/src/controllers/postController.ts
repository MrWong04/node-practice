import { Request, Response, NextFunction } from 'express'
import { successResponse } from '../utils/response'
import * as postService from '../services/postService'

// ==========================================================================
// 文章 Controller（请求处理层）
// ==========================================================================
// 类比：如果把整个后端看作一个"黑盒 API"，Controller 就是"最外层的入口"。
// 它的工作很简单："接请求 → 调 Service → 包装响应 → 出错就 next(err)"。
// ==========================================================================

/**
 * 获取所有文章列表
 * 对应前端：`GET /api/posts`
 * 不需要登录，所以 req 参数前面加了下划线（表示"虽然传了，但这里不用"）。
 * 返回 200 + { success: true, data: [文章1, 文章2, ...] }
 */
export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await postService.getAllPosts()
    // 把嵌套的 user.name 提取到外层，方便前端直接访问
    const formatted = posts.map((post) => ({
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      authorName: post.user?.name,
      description: post.description,
      content: post.content,
    }))
    res.json(successResponse(formatted))
  } catch (err) {
    next(err)
  }
}

/**
 * 获取单篇文章详情
 * 对应前端：`GET /api/posts/:id`
 * 从 req.params.id 拿到 URL 中的文章 ID（如 `/posts/5`），转成数字后传给 Service。
 * 返回 200 + { success: true, data: { id, title, ... } }
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const post = await postService.getPostById(id)
    // 把嵌套的 user.name 提取到外层
    const formatted = {
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      authorName: post.user?.name,
      description: post.description,
      content: post.content || '',
    }
    res.json(successResponse(formatted))
  } catch (err) {
    next(err)
  }
}

/**
 * 创建新文章
 * 对应前端：`POST /api/posts`
 * 前提：用户已登录（req.user 存在）。
 * 从 req.body 取 title/content，从 req.user 取作者信息和用户 ID。
 * 返回 201 + { success: true, data: { 新文章 } }
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, description } = req.body
    const post = await postService.createPost(
      title,
      content,
      description,
      req.user!.email,
      req.user!.userId
    )
    res.status(201).json(successResponse(post))
  } catch (err) {
    next(err)
  }
}

/**
 * 更新文章
 * 对应前端：`PUT /api/posts/:id`
 * 从 req.params.id 拿文章 ID，从 req.body 拿新标题/内容，从 req.user 拿当前用户 ID（用于权限校验）。
 * 返回 200 + { success: true, data: { 更新后的文章 } }
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const { title, content, description } = req.body
    const post = await postService.updatePost(id, req.user!.userId, title, content, description)
    res.json(successResponse(post))
  } catch (err) {
    next(err)
  }
}

/**
 * 删除文章
 * 对应前端：`DELETE /api/posts/:id`
 * 从 req.params.id 拿文章 ID，从 req.user 拿当前用户 ID。
 * 返回 200 + { success: true, data: { 被删除的文章 } }
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10)
    const post = await postService.deletePost(id, req.user!.userId)
    res.json(successResponse(post))
  } catch (err) {
    next(err)
  }
}
