import service from '@/utils/service'

// ==================== 类型定义 ====================

/** 关联的作者信息（后端通过 include 返回） */
export interface PostUser {
  id: number
  name: string
  email: string
}

/** 分类信息 */
export interface PostCategory {
  id: number
  name: string
  slug: string
}

/** 标签信息 */
export interface PostTag {
  id: number
  name: string
  slug: string
}

/** 单篇文章 */
export interface Post {
  id: number
  title: string
  description?: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
  authorId: number | null
  authorName: string
  user: PostUser | null
  category: PostCategory | null
  tags: PostTag[]
}

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

/** 文章列表查询参数 */
export interface PostListParams {
  keyword?: string
  categoryId?: number
  tagId?: number
  page?: number
  pageSize?: number
}

/** 创建文章参数 */
export interface CreatePostParams {
  title: string
  description?: string
  content: string
  categoryId?: number | null
  tagIds?: number[]
}

/** 更新文章参数（字段均为可选） */
export interface UpdatePostParams {
  title?: string
  description?: string
  content?: string
  categoryId?: number | null
  tagIds?: number[]
}

// ==================== 接口方法 ====================

export function getAllPostsApi(params?: PostListParams): Promise<ApiResponse<PaginatedData<Post>>> {
  return service.get('/posts', { params })
}

export function getPostByIdApi(id: number): Promise<ApiResponse<Post>> {
  return service.get(`/posts/${id}`)
}

export function createPostApi(params: CreatePostParams): Promise<ApiResponse<Post>> {
  return service.post('/posts', params)
}

export function updatePostApi(id: number, params: UpdatePostParams): Promise<ApiResponse<Post>> {
  return service.put(`/posts/${id}`, params)
}

export function deletePostApi(id: number): Promise<ApiResponse<Post>> {
  return service.delete(`/posts/${id}`)
}
