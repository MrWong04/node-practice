// ==========================================================================
// 自定义错误类 — 统一应用内错误类型
// ==========================================================================

/**
 * 应用通用错误基类
 * 所有自定义错误均应继承此类，便于全局错误处理器统一处理
 */
export class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 400 - 请求参数错误或业务规则不满足
 */
export class ValidationError extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

/**
 * 401 - 未提供认证凭据或凭据无效
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '未登录或登录已过期') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

/**
 * 403 - 已登录但无权限访问
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

/**
 * 404 - 资源不存在
 */
export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

/**
 * 409 - 资源冲突（如重复邮箱）
 */
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}
