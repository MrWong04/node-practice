import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

// JWT 密钥（生产环境应放入环境变量）
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// JWT Payload 类型
export interface JwtPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

/**
 * JWT 认证中间件
 * 验证请求头中的 Authorization: Bearer <token>
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: '缺少访问令牌',
    })
    return
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        message: '令牌无效或已过期',
      })
      return
    }
    req.user = decoded as JwtPayload
    next()
  })
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}
