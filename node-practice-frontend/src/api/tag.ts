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

/** 标签列表查询参数 */
export interface TagListParams {
  keyword?: string
  page?: number
  pageSize?: number
}

/** 单个标签 */
export interface Tag {
  id: number
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  _count?: {
    postTags: number
  }
}

/** 标签详情（包含文章列表） */
export interface TagDetail extends Tag {
  postTags: {
    post: {
      id: number
      title: string
      description: string
      createdAt: string
      user: {
        name: string
      }
    }
  }[]
}

/** 创建标签参数 */
export interface CreateTagParams {
  name: string
  slug?: string
}

/** 更新标签参数 */
export interface UpdateTagParams {
  name?: string
  slug?: string
}

/** 为文章添加标签参数 */
export interface AddTagsToPostParams {
  tagIds: number[]
}

// ==================== 接口方法 ====================

export function getAllTagsApi(params?: TagListParams): Promise<ApiResponse<PaginatedData<Tag>>> {
  return service.get('/tags', { params })
}

export function getTagByIdApi(id: number): Promise<ApiResponse<TagDetail>> {
  return service.get(`/tags/${id}`)
}

export function getTagBySlugApi(slug: string): Promise<ApiResponse<Tag>> {
  return service.get(`/tags/slug/${slug}`)
}

export function createTagApi(params: CreateTagParams): Promise<ApiResponse<Tag>> {
  return service.post('/tags', params)
}

export function updateTagApi(id: number, params: UpdateTagParams): Promise<ApiResponse<Tag>> {
  return service.put(`/tags/${id}`, params)
}

export function deleteTagApi(id: number): Promise<ApiResponse<Tag>> {
  return service.delete(`/tags/${id}`)
}

export function addTagsToPostApi(
  postId: number,
  params: AddTagsToPostParams
): Promise<ApiResponse<unknown>> {
  return service.post(`/posts/${postId}/tags`, params)
}

export function removeTagFromPostApi(postId: number, tagId: number): Promise<ApiResponse<unknown>> {
  return service.delete(`/posts/${postId}/tags/${tagId}`)
}
