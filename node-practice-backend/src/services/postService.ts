import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors'
import { buildPaginatedResult, type PaginatedResult, type PaginationParams } from '../utils/query'

export interface PostListQuery {
  keyword?: string
  categoryId?: number
  tagId?: number
}

const postSelect = {
  id: true,
  title: true,
  description: true,
  content: true,
  author: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  user: {
    select: { id: true, name: true, email: true },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  tags: {
    select: {
      tag: {
        select: { id: true, name: true, slug: true },
      },
    },
  },
} satisfies Prisma.PostSelect

type PostRecord = Prisma.PostGetPayload<{ select: typeof postSelect }>

export type FormattedPost = {
  id: number
  title: string
  description?: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
  authorId: number | null
  authorName: string
  user: { id: number; name: string | null; email: string } | null
  category: { id: number; name: string; slug: string } | null
  tags: { id: number; name: string; slug: string }[]
}

function formatPost(post: PostRecord): FormattedPost {
  return {
    id: post.id,
    title: post.title,
    description: post.description ?? undefined,
    content: post.content,
    author: post.author,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorId: post.authorId,
    authorName: post.user?.name ?? post.author,
    user: post.user,
    category: post.category,
    tags: post.tags.map((pt) => pt.tag),
  }
}

function buildPostWhere(query: PostListQuery): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {}

  if (query.keyword) {
    where.OR = [
      { title: { contains: query.keyword } },
      { description: { contains: query.keyword } },
    ]
  }
  if (query.categoryId !== undefined) {
    where.categoryId = query.categoryId
  }
  if (query.tagId !== undefined) {
    where.tags = { some: { tagId: query.tagId } }
  }

  return where
}

// ==========================================================================
// 文章 Service（业务逻辑层）
// ==========================================================================
// 类比：这就像前端项目里封装的一个 "postApi.ts" 文件——
// 所有和"文章"相关的数据库操作（增删改查）都在这里，上层只调函数，不用关心 SQL/Prisma 语法。
// ==========================================================================

/**
 * 获取文章列表（支持筛选与分页）
 * 对应前端接口：`GET /api/posts`
 * 可选查询参数：keyword（标题/描述模糊搜索）、categoryId、tagId
 * 分页参数：page（默认 1）、pageSize（默认 10，最大 100）
 */
export async function getAllPosts(
  query: PostListQuery = {},
  pagination: PaginationParams
): Promise<PaginatedResult<FormattedPost>> {
  const where = buildPostWhere(query)

  const [records, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      select: postSelect,
    }),
    prisma.post.count({ where }),
  ])

  return buildPaginatedResult(records.map(formatPost), total, pagination)
}

/**
 * 根据 ID 获取单篇文章详情
 * 对应前端接口：`GET /api/posts/:id`
 * 参数：id（文章 ID，数字）
 * 返回：单篇文章对象，包含作者信息
 * 如果找不到：抛出 `NotFoundError`，前端会收到 404 状态码
 */
export async function getPostById(id: number): Promise<FormattedPost> {
  const post = await prisma.post.findUnique({
    where: { id },
    select: postSelect,
  })
  if (!post) {
    throw new NotFoundError('文章不存在')
  }
  return formatPost(post)
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
export async function createPost(
  title: string,
  content: string,
  description: string | undefined,
  author: string,
  userId: number,
  categoryId?: number,
  tagIds?: number[]
): Promise<FormattedPost> {
  if (!title || !content) {
    throw new ValidationError('标题和内容为必填项')
  }
  const post = await prisma.post.create({
    data: {
      title,
      content,
      description,
      author,
      user: { connect: { id: userId } },
      ...(categoryId !== undefined && { category: { connect: { id: categoryId } } }),
      ...(tagIds &&
        tagIds.length > 0 && {
          tags: {
            create: tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
    },
    select: postSelect,
  })
  return formatPost(post)
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
export async function updatePost(
  id: number,
  userId: number,
  title?: string,
  content?: string,
  description?: string,
  categoryId?: number,
  tagIds?: number[]
): Promise<FormattedPost> {
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

  // 使用 as Record 避免 any 类型错误
  const data: Record<string, unknown> = {
    ...(title !== undefined && { title }),
    ...(content !== undefined && { content }),
    ...(description !== undefined && { description }),
  }

  if (categoryId !== undefined) {
    if (categoryId === null) {
      data.category = { disconnect: true }
    } else {
      data.category = { connect: { id: categoryId } }
    }
  }

  if (tagIds) {
    await prisma.postTag.deleteMany({ where: { postId: id } })
    if (tagIds.length > 0) {
      data.tags = {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      }
    }
  }

  return formatPost(
    await prisma.post.update({
      where: { id },
      data: data as Parameters<typeof prisma.post.update>[0]['data'],
      select: postSelect,
    })
  )
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
export async function deletePost(id: number, userId: number): Promise<FormattedPost> {
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

  const post = await prisma.post.delete({
    where: { id },
    select: postSelect,
  })
  return formatPost(post)
}
