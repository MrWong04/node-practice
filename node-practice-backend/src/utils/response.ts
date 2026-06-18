// ==========================================================================
// 统一响应工具 — 封装 API 返回格式，确保前后端一致
// ==========================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

/**
 * 成功响应
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  }
}

/**
 * 错误响应
 */
export function errorResponse(message: string): ApiResponse<never> {
  return {
    success: false,
    message,
  }
}
