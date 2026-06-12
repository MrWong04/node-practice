import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'

// 创建 axios 实例，通过 /local 代理到后端服务 (localhost:3000)
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

export interface User {
  id: number
  email: string
  name: string
  createdAt?: string
}

export interface AuthData {
  user: User
  token: string
}

export interface AuthResponse {
  success: boolean
  data: AuthData
  message?: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  name?: string
}

export interface MeResponse {
  success: boolean
  data: User
  message?: string
}

// ==================== 接口方法 ====================

/** 用户注册 */
export function registerApi(params: RegisterParams): Promise<AuthResponse> {
  return request.post('/auth/register', params)
}

/** 用户登录 */
export function loginApi(params: LoginParams): Promise<AuthResponse> {
  return request.post('/auth/login', params)
}

/** 获取当前登录用户信息 */
export function getMeApi(): Promise<MeResponse> {
  return request.get('/auth/me')
}
