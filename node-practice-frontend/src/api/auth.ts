import service from '@/utils/service'

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

export function registerApi(params: RegisterParams): Promise<AuthResponse> {
  return service.post('/auth/register', params)
}

export function loginApi(params: LoginParams): Promise<AuthResponse> {
  return service.post('/auth/login', params)
}

export function getMeApi(): Promise<MeResponse> {
  return service.get('/auth/me')
}
