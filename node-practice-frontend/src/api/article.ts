import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

// 复用 auth.ts 相同的 axios 实例配置，通过 /local 代理到后端服务 (localhost:3000)
const request: AxiosInstance = axios.create({
  baseURL: '/local/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动注入 JWT Token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('blog_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：直接返回后端原始响应体
request.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => Promise.reject(error)
)

// ==================== 类型定义 ====================

/** 关联的作者信息（后端通过 include 返回） */
export interface PostUser {
  id: number
  name: string
  email: string
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
}

/** 通用后端响应体 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/** 创建文章参数 */
export interface CreatePostParams {
  title: string
  description?: string
  content: string
}

/** 更新文章参数（字段均为可选） */
export interface UpdatePostParams {
  title?: string
  description?: string
  content?: string
}

// ==================== 接口方法 ====================

/** 获取所有文章列表（公开，不需要登录） */
export function getAllPostsApi(): Promise<ApiResponse<Post[]>> {
  return request.get('/posts')
}

/** 获取单篇文章详情（公开，不需要登录） */
export function getPostByIdApi(id: number): Promise<ApiResponse<Post>> {
  return request.get(`/posts/${id}`)
}

/** 创建新文章（需要登录） */
export function createPostApi(params: CreatePostParams): Promise<ApiResponse<Post>> {
  return request.post('/posts', params)
}

/** 更新文章（需要登录，且只能更新自己的文章） */
export function updatePostApi(id: number, params: UpdatePostParams): Promise<ApiResponse<Post>> {
  return request.put(`/posts/${id}`, params)
}

/** 删除文章（需要登录，且只能删除自己的文章） */
export function deletePostApi(id: number): Promise<ApiResponse<Post>> {
  return request.delete(`/posts/${id}`)
}
