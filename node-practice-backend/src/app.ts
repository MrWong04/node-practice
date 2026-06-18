import express, { Request, Response, NextFunction } from 'express'
import { PORT } from './config'
import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// JSON 解析中间件
app.use(express.json())

// 请求日志中间件
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// ============================================
// 路由挂载
// ============================================
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)

// ============================================
// 全局错误处理
// ============================================
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  console.log(`🔐 Auth + Prisma server running on http://localhost:${PORT}`)
  console.log('')
  console.log('Public endpoints:')
  console.log(`  POST   http://localhost:${PORT}/api/auth/register`)
  console.log(`  POST   http://localhost:${PORT}/api/auth/login`)
  console.log(`  GET    http://localhost:${PORT}/api/posts`)
  console.log(`  GET    http://localhost:${PORT}/api/posts/:id`)
  console.log('')
  console.log('Protected endpoints (need Authorization header):')
  console.log(`  GET    http://localhost:${PORT}/api/auth/me`)
  console.log(`  POST   http://localhost:${PORT}/api/posts`)
  console.log(`  PUT    http://localhost:${PORT}/api/posts/:id`)
  console.log(`  DELETE http://localhost:${PORT}/api/posts/:id`)
})
