import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors'
import { buildPaginatedResult, type PaginatedResult, type PaginationParams } from '../utils/query'
import { generateSlug } from '../utils/slug'

export interface TagListQuery {
  keyword?: string
}

const tagListSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { postTags: true },
  },
} satisfies Prisma.TagSelect

// ==========================================================================
// 标签 Service（业务逻辑层）
// ==========================================================================
// 类比：这就像前端项目里封装的一个 "tagApi.ts" 文件——
// 所有和"标签"相关的数据库操作（增删改查）都在这里，上层只调函数，不用关心 SQL/Prisma 语法。
// ==========================================================================

/**
 * 获取标签列表（支持筛选与分页）
 * 对应前端接口：`GET /api/tags`
 * 可选查询参数：keyword（模糊匹配名称或 slug）
 * 分页参数：page（默认 1）、pageSize（默认 10，最大 100）
 */
export async function getAllTags(
  query: TagListQuery = {},
  pagination: PaginationParams
): Promise<PaginatedResult<Prisma.TagGetPayload<{ select: typeof tagListSelect }>>> {
  const where: Prisma.TagWhereInput = {}

  if (query.keyword) {
    where.OR = [
      { name: { contains: query.keyword } },
      { slug: { contains: query.keyword } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      select: tagListSelect,
    }),
    prisma.tag.count({ where }),
  ])

  return buildPaginatedResult(items, total, pagination)
}

/**
 * 根据 ID 获取单个标签详情
 * 对应前端接口：`GET /api/tags/:id`
 * 参数：id（标签 ID，数字）
 * 返回：单个标签对象，包含该标签下的文章列表
 * 如果找不到：抛出 `NotFoundError`，前端会收到 404 状态码
 */
export async function getTagById(id: number) {
  const tag = await prisma.tag.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      postTags: {
        select: {
          post: {
            select: {
              id: true,
              title: true,
              description: true,
              createdAt: true,
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!tag) {
    throw new NotFoundError('标签不存在')
  }
  return tag
}

/**
 * 根据 slug 获取单个标签详情
 * 对应前端接口：`GET /api/tags/slug/:slug`
 * 参数：slug（标签 slug，字符串）
 * 返回：单个标签对象
 * 如果找不到：抛出 `NotFoundError`
 */
export async function getTagBySlug(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { postTags: true },
      },
    },
  })
  if (!tag) {
    throw new NotFoundError('标签不存在')
  }
  return tag
}

/**
 * 创建新标签
 * 对应前端接口：`POST /api/tags`
 * 参数：
 *   - name：标签名称（必填）
 *   - slug：标签 slug（可选，自动生成）
 * 返回：刚创建的标签对象
 * 注意：slug 用于 URL 友好的标识，如果未提供则自动从 name 生成
 */
export async function createTag(name: string, slug?: string) {
  if (!name) {
    throw new ValidationError('标签名称为必填项')
  }

  // 如果没有提供 slug，则从 name 生成
  const tagSlug = slug || generateSlug(name)

  // 检查 slug 是否已存在
  const existing = await prisma.tag.findUnique({
    where: { slug: tagSlug },
  })
  if (existing) {
    throw new ConflictError('标签 slug 已存在')
  }

  // 检查名称是否已存在
  const existingByName = await prisma.tag.findFirst({
    where: { name },
  })
  if (existingByName) {
    throw new ConflictError('标签名称已存在')
  }

  return prisma.tag.create({
    data: {
      name,
      slug: tagSlug,
    },
  })
}

/**
 * 更新标签
 * 对应前端接口：`PUT /api/tags/:id`
 * 参数：id（标签 ID）、name（可选）、slug（可选）
 * 返回：更新后的标签对象
 * 注意：若传入 name 但未传 slug，则自动从 name 转拼音更新 slug
 * 如果找不到：抛出 `NotFoundError`
 */
export async function updateTag(id: number, name?: string, slug?: string) {
  const existing = await prisma.tag.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new NotFoundError('标签不存在')
  }

  if (name && name !== existing.name) {
    const existingByName = await prisma.tag.findFirst({
      where: { name },
    })
    if (existingByName) {
      throw new ConflictError('标签名称已存在')
    }
  }

  const nextSlug = slug !== undefined ? slug : name !== undefined ? generateSlug(name) : undefined

  if (nextSlug && nextSlug !== existing.slug) {
    const existingBySlug = await prisma.tag.findUnique({
      where: { slug: nextSlug },
    })
    if (existingBySlug) {
      throw new ConflictError('标签 slug 已存在')
    }
  }

  return prisma.tag.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(nextSlug !== undefined && { slug: nextSlug }),
    },
  })
}

/**
 * 删除标签
 * 对应前端接口：`DELETE /api/tags/:id`
 * 参数：id（标签 ID）
 * 返回：被删除的标签对象
 * 如果找不到：抛出 `NotFoundError`
 * 注意：删除标签时，关联的 PostTag 记录会被自动删除（由于 onDelete: Cascade）
 */
export async function deleteTag(id: number) {
  const existing = await prisma.tag.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new NotFoundError('标签不存在')
  }

  return prisma.tag.delete({ where: { id } })
}

/**
 * 为文章添加标签
 * 对应前端接口：`POST /api/posts/:postId/tags`
 * 参数：
 *   - postId：文章 ID
 *   - tagIds：标签 ID 数组
 * 返回：更新后的文章对象，包含所有标签
 */
export async function addTagsToPost(postId: number, tagIds: number[]) {
  // 检查文章是否存在
  const post = await prisma.post.findUnique({
    where: { id: postId },
  })
  if (!post) {
    throw new NotFoundError('文章不存在')
  }

  // 检查所有标签是否存在
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
  })
  if (tags.length !== tagIds.length) {
    throw new NotFoundError('部分标签不存在')
  }

  // 创建 PostTag 关联
  await prisma.postTag.createMany({
    data: tagIds.map((tagId) => ({
      postId,
      tagId,
    })),
    skipDuplicates: true,
  })

  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

/**
 * 从文章移除标签
 * 对应前端接口：`DELETE /api/posts/:postId/tags/:tagId`
 * 参数：
 *   - postId：文章 ID
 *   - tagId：标签 ID
 * 返回：更新后的文章对象，包含剩余标签
 */
export async function removeTagFromPost(postId: number, tagId: number) {
  // 检查文章是否存在
  const post = await prisma.post.findUnique({
    where: { id: postId },
  })
  if (!post) {
    throw new NotFoundError('文章不存在')
  }

  // 检查标签是否存在
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  })
  if (!tag) {
    throw new NotFoundError('标签不存在')
  }

  // 删除 PostTag 关联
  await prisma.postTag.deleteMany({
    where: {
      postId,
      tagId,
    },
  })

  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}
