import { prisma } from '../../prisma/client'
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors'

// ==========================================================================
// 文章 Service（业务逻辑层）
// ==========================================================================
// 类比：这就像前端项目里封装的一个 "postApi.ts" 文件——
// 所有和"文章"相关的数据库操作（增删改查）都在这里，上层只调函数，不用关心 SQL/Prisma 语法。
// ==========================================================================

/**
 * 获取所有文章列表
 * 对应前端接口：`GET /api/posts`
 * 做的事情：按发布时间倒序排列，同时把每篇文章的"作者信息"一起查出来（关联查询）。
 * 返回：文章数组，每个元素包含 { id, title, content, author, createdAt, user: { id, name, email } }
 * 类比：类似前端调用 `axios.get('/posts')` 后拿到列表数据。
 */
export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })
}

/**
 * 根据 ID 获取单篇文章详情
 * 对应前端接口：`GET /api/posts/:id`
 * 参数：id（文章 ID，数字）
 * 返回：单篇文章对象，包含作者信息
 * 如果找不到：抛出 `NotFoundError`，前端会收到 404 状态码
 */
export async function getPostById(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })
  if (!post) {
    throw new NotFoundError('文章不存在')
  }
  return post
}

/**
 * 创建新文章
 * 对应前端接口：`POST /api/posts`
 * 参数：
 *   - title：文章标题（必填）
 *   - content：文章内容（必填）
 *   - author：作者标识（一般传登录用户的邮箱）
 *   - userId：登录用户的真实数据库 ID（用于关联到 User 表）
 * 返回：刚创建的文章对象
 * 注意：`user: { connect: { id: userId } }` 是 Prisma 的"关联写法"——
 * 意思是"把这篇文章关联到 id = userId 的那个用户"，类似外键操作。
 */
export async function createPost(title: string, content: string, author: string, userId: number) {
  if (!title || !content) {
    throw new ValidationError('标题和内容为必填项')
  }

  return prisma.post.create({
    data: {
      title,
      content,
      author,
      user: { connect: { id: userId } },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })
}

/**
 * 更新文章
 * 对应前端接口：`PUT /api/posts/:id`
 * 步骤拆解：
 * 1. 先查文章是否存在（类似前端先获取详情再编辑）
 * 2. 检查"当前登录用户"是不是文章的作者（权限校验——只能改自己的文章）
 * 3. 只更新传过来的字段（title 或 content 可能只传一个，用 `...(条件 && { 字段 })` 实现"可选更新"）
 * 参数：id（文章 ID）、userId（当前登录用户 ID）、title/content（可选）
 * 返回：更新后的文章对象
 * 如果无权限：抛出 `ForbiddenError`，前端会收到 403 状态码
 */
export async function updatePost(id: number, userId: number, title?: string, content?: string) {
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  })

  if (!existing) {
    throw new NotFoundError('文章不存在')
  }
  if (existing.authorId !== userId) {
    throw new ForbiddenError('只能更新自己的文章')
  }

  return prisma.post.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })
}

/**
 * 删除文章
 * 对应前端接口：`DELETE /api/posts/:id`
 * 步骤拆解：
 * 1. 查文章是否存在
 * 2. 检查权限（只能删自己的文章）
 * 3. 从数据库删除
 * 参数：id（文章 ID）、userId（当前登录用户 ID）
 * 返回：被删除的文章对象（前端可以展示"已删除"的提示）
 */
export async function deletePost(id: number, userId: number) {
  const existing = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  })

  if (!existing) {
    throw new NotFoundError('文章不存在')
  }
  if (existing.authorId !== userId) {
    throw new ForbiddenError('只能删除自己的文章')
  }

  return prisma.post.delete({ where: { id } })
}
