// ==========================================================================
// 全局错误处理中间件 — 捕获所有抛出的错误，统一格式返回
// ==========================================================================

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { errorResponse } from '../utils/response'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // 自定义业务错误：使用其 statusCode 和 message
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message))
    return
  }

  // JWT 验证失败（由 jsonwebtoken 抛出）
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res
      .status(401)
      .json(errorResponse(err.name === 'TokenExpiredError' ? '登录已过期' : '无效的认证令牌'))
    return
  }

  // 未知错误（生产环境不应泄露详细栈信息）
  console.error('[ErrorHandler]', err)
  res.status(500).json(errorResponse('服务器内部错误'))
}
