import type { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors'
import { buildPaginatedResult, type PaginatedResult, type PaginationParams } from '../utils/query'
import { generateSlug } from '../utils/slug'

export interface CategoryListQuery {
  keyword?: string
}

const categoryListSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { posts: true },
  },
} satisfies Prisma.CategorySelect

// ==========================================================================
// 分类 Service（业务逻辑层）
// ==========================================================================
// 类比：这就像前端项目里封装的一个 "categoryApi.ts" 文件——
// 所有和"分类"相关的数据库操作（增删改查）都在这里，上层只调函数，不用关心 SQL/Prisma 语法。
// ==========================================================================

/**
 * 获取分类列表（支持筛选与分页）
 * 对应前端接口：`GET /api/categories`
 * 可选查询参数：keyword（模糊匹配名称或 slug）
 * 分页参数：page（默认 1）、pageSize（默认 10，最大 100）
 */
export async function getAllCategories(
  query: CategoryListQuery = {},
  pagination: PaginationParams
): Promise<PaginatedResult<Prisma.CategoryGetPayload<{ select: typeof categoryListSelect }>>> {
  const where: Prisma.CategoryWhereInput = {}

  if (query.keyword) {
    where.OR = [
      { name: { contains: query.keyword } },
      { slug: { contains: query.keyword } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
      select: categoryListSelect,
    }),
    prisma.category.count({ where }),
  ])

  return buildPaginatedResult(items, total, pagination)
}

/**
 * 根据 ID 获取单个分类详情
 * 对应前端接口：`GET /api/categories/:id`
 * 参数：id（分类 ID，数字）
 * 返回：单个分类对象，包含该分类下的文章列表
 * 如果找不到：抛出 `NotFoundError`，前端会收到 404 状态码
 */
export async function getCategoryById(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      posts: {
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!category) {
    throw new NotFoundError('分类不存在')
  }
  return category
}

/**
 * 根据 slug 获取单个分类详情
 * 对应前端接口：`GET /api/categories/slug/:slug`
 * 参数：slug（分类 slug，字符串）
 * 返回：单个分类对象
 * 如果找不到：抛出 `NotFoundError`
 */
export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { posts: true },
      },
    },
  })
  if (!category) {
    throw new NotFoundError('分类不存在')
  }
  return category
}

/**
 * 创建新分类
 * 对应前端接口：`POST /api/categories`
 * 参数：
 *   - name：分类名称（必填）
 *   - slug：分类 slug（可选，自动生成）
 * 返回：刚创建的分类对象
 * 注意：slug 用于 URL 友好的标识，如果未提供则自动从 name 生成
 */
export async function createCategory(name: string, slug?: string) {
  if (!name) {
    throw new ValidationError('分类名称为必填项')
  }

  // 如果没有提供 slug，则从 name 生成
  const categorySlug = slug || generateSlug(name)

  // 检查 slug 是否已存在
  const existing = await prisma.category.findUnique({
    where: { slug: categorySlug },
  })
  if (existing) {
    throw new ConflictError('分类 slug 已存在')
  }

  // 检查名称是否已存在
  const existingByName = await prisma.category.findFirst({
    where: { name },
  })
  if (existingByName) {
    throw new ConflictError('分类名称已存在')
  }

  return prisma.category.create({
    data: {
      name,
      slug: categorySlug,
    },
  })
}

/**
 * 更新分类
 * 对应前端接口：`PUT /api/categories/:id`
 * 参数：id（分类 ID）、name（可选）、slug（可选）
 * 返回：更新后的分类对象
 * 注意：若传入 name 但未传 slug，则自动从 name 转拼音更新 slug
 * 如果找不到：抛出 `NotFoundError`
 */
export async function updateCategory(id: number, name?: string, slug?: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new NotFoundError('分类不存在')
  }

  if (name && name !== existing.name) {
    const existingByName = await prisma.category.findFirst({
      where: { name },
    })
    if (existingByName) {
      throw new ConflictError('分类名称已存在')
    }
  }

  const nextSlug = slug !== undefined ? slug : name !== undefined ? generateSlug(name) : undefined

  if (nextSlug && nextSlug !== existing.slug) {
    const existingBySlug = await prisma.category.findUnique({
      where: { slug: nextSlug },
    })
    if (existingBySlug) {
      throw new ConflictError('分类 slug 已存在')
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(nextSlug !== undefined && { slug: nextSlug }),
    },
  })
}

/**
 * 删除分类
 * 对应前端接口：`DELETE /api/categories/:id`
 * 参数：id（分类 ID）
 * 返回：被删除的分类对象
 * 如果找不到：抛出 `NotFoundError`
 * 注意：删除分类时，关联的文章的 categoryId 会被设置为 null
 */
export async function deleteCategory(id: number) {
  const existing = await prisma.category.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new NotFoundError('分类不存在')
  }

  return prisma.category.delete({ where: { id } })
}
