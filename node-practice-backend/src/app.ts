import express, { Request, Response, NextFunction } from 'express'
import os from 'node:os'
import { PORT } from './config'
import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import categoryRoutes from './routes/categories'
import tagRoutes from './routes/tags'
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
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)

// ============================================
// 全局错误处理
// ============================================
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  // 获取本机局域网 IP
  const localIP = (() => {
    const nets = os.networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] ?? []) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address
        }
      }
    }
    return null
  })()

  console.log(`🔐 Auth + Prisma server running on:`)
  console.log(`   Local:    http://localhost:${PORT}`)
  if (localIP) console.log(`   Network:  http://${localIP}:${PORT}`)
  console.log('')
  console.log('Public endpoints:')
  console.log(`  POST   http://localhost:${PORT}/api/auth/register`)
  console.log(`  POST   http://localhost:${PORT}/api/auth/login`)
  console.log(`  GET    http://localhost:${PORT}/api/posts`)
  console.log(`  GET    http://localhost:${PORT}/api/posts/:id`)
  console.log(`  GET    http://localhost:${PORT}/api/categories`)
  console.log(`  GET    http://localhost:${PORT}/api/categories/:id`)
  console.log(`  GET    http://localhost:${PORT}/api/categories/slug/:slug`)
  console.log(`  GET    http://localhost:${PORT}/api/tags`)
  console.log(`  GET    http://localhost:${PORT}/api/tags/:id`)
  console.log(`  GET    http://localhost:${PORT}/api/tags/slug/:slug`)
  console.log('')
  console.log('Protected endpoints (need Authorization header):')
  console.log(`  GET    http://localhost:${PORT}/api/auth/me`)
  console.log(`  POST   http://localhost:${PORT}/api/posts`)
  console.log(`  PUT    http://localhost:${PORT}/api/posts/:id`)
  console.log(`  DELETE http://localhost:${PORT}/api/posts/:id`)
  console.log(`  POST   http://localhost:${PORT}/api/categories`)
  console.log(`  PUT    http://localhost:${PORT}/api/categories/:id`)
  console.log(`  DELETE http://localhost:${PORT}/api/categories/:id`)
  console.log(`  POST   http://localhost:${PORT}/api/tags`)
  console.log(`  PUT    http://localhost:${PORT}/api/tags/:id`)
  console.log(`  DELETE http://localhost:${PORT}/api/tags/:id`)
  console.log(`  POST   http://localhost:${PORT}/api/posts/:postId/tags`)
  console.log(`  DELETE http://localhost:${PORT}/api/posts/:postId/tags/:tagId`)
})
