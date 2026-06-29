import service from '@/utils/service'

// ==================== 类型定义 ====================

/** 通用后端响应体 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/** 分页信息 */
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** 分页列表数据 */
export interface PaginatedData<T> {
  items: T[]
  pagination: Pagination
}

/** 分类列表查询参数 */
export interface CategoryListParams {
  keyword?: string
  page?: number
  pageSize?: number
}

/** 单个分类 */
export interface Category {
  id: number
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  _count?: {
    posts: number
  }
}

/** 分类详情（包含文章列表） */
export interface CategoryDetail extends Category {
  posts: {
    id: number
    title: string
    description: string
    createdAt: string
    user: {
      name: string
    }
  }[]
}

/** 创建分类参数 */
export interface CreateCategoryParams {
  name: string
  slug?: string
}

/** 更新分类参数 */
export interface UpdateCategoryParams {
  name?: string
  slug?: string
}

// ==================== 接口方法 ====================

export function getAllCategoriesApi(
  params?: CategoryListParams
): Promise<ApiResponse<PaginatedData<Category>>> {
  return service.get('/categories', { params })
}

export function getCategoryByIdApi(id: number): Promise<ApiResponse<CategoryDetail>> {
  return service.get(`/categories/${id}`)
}

export function getCategoryBySlugApi(slug: string): Promise<ApiResponse<Category>> {
  return service.get(`/categories/slug/${slug}`)
}

export function createCategoryApi(params: CreateCategoryParams): Promise<ApiResponse<Category>> {
  return service.post('/categories', params)
}

export function updateCategoryApi(
  id: number,
  params: UpdateCategoryParams
): Promise<ApiResponse<Category>> {
  return service.put(`/categories/${id}`, params)
}

export function deleteCategoryApi(id: number): Promise<ApiResponse<Category>> {
  return service.delete(`/categories/${id}`)
}
