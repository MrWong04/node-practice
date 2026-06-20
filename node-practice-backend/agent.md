# Agent 项目上下文 — node-practice-backend

> 本文件由 AI 生成，用于后续对话中快速理解项目上下文。每次重大变更后请更新此文件。

---

## 1. 项目概述

- **名称**：node-practice-backend
- **类型**：Node.js REST API 后端（博客/内容管理系统）
- **语言**：TypeScript
- **框架**：Express.js 5.x
- **ORM**：Prisma 6.x + MySQL 8.0
- **认证**：JWT (jsonwebtoken) + bcrypt 密码哈希
- **端口**：3002（开发）/ 3002（Docker）
- **Node 版本**：>= 18.0.0

---

## 2. 技术栈

| 类别     | 技术                                    |
| -------- | --------------------------------------- |
| 运行时   | Node.js 20+                             |
| 框架     | Express 5.2.1                           |
| 语言     | TypeScript 6.0+                         |
| ORM      | Prisma 6.19.3 (@prisma/client)          |
| 数据库   | MySQL 8.0（通过 Docker Compose）        |
| 认证     | jsonwebtoken 9.x + bcrypt 6.x           |
| 构建工具 | tsc + tsx（开发热重载）                 |
| 代码规范 | ESLint 9.x (Flat Config) + Prettier 3.x |
| 部署     | Docker + Docker Compose（多阶段构建）   |

---

## 3. 项目结构

```
node-practice-backend/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义（User + Post）
│   ├── client.ts              # PrismaClient 单例封装
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app.ts                 # 应用入口：路由挂载、中间件注册、服务启动
│   ├── config/
│   │   └── index.ts           # 环境变量集中读取（PORT, SALT_ROUNDS, JWT_SECRET）
│   ├── controllers/
│   │   ├── authController.ts  # 认证接口：register, login, me
│   │   └── postController.ts  # 文章接口：getAll, getById, create, update, remove
│   ├── middleware/
│   │   ├── auth.ts            # JWT 认证中间件 + Token 生成工具
│   │   └── errorHandler.ts    # 全局错误处理中间件
│   ├── routes/
│   │   ├── auth.ts            # /api/auth/* 路由定义
│   │   └── posts.ts           # /api/posts/* 路由定义
│   ├── services/
│   │   ├── authService.ts     # 认证业务逻辑：注册、登录、查用户
│   │   └── postService.ts     # 文章业务逻辑：CRUD + 权限校验
│   ├── types/
│   │   └── express.d.ts      # Express Request 扩展类型（req.user）
│   └── utils/
│       ├── errors.ts          # 自定义错误类（AppError 及子类）
│       └── response.ts        # 统一响应格式封装
├── tests/
│   ├── api-auth.test.js       # 认证接口测试
│   ├── api-prisma.test.js     # 文章接口测试
│   └── read-db.js             # 数据库读取调试工具
├── docs/
│   ├── project-outline.md     # 项目大纲
│   ├── backend-roadmap.md     # 后端学习路线图
│   ├── auth-mechanism.md      # 认证机制说明
│   └── api/                   # API 接口文档
├── .env                       # 本地环境变量（已忽略，不提交）
├── .env.example               # 环境变量模板
├── docker-compose.yml         # Docker Compose 编排（API + MySQL）
├── Dockerfile                 # 多阶段构建（builder + runner）
├── eslint.config.mjs          # ESLint Flat Config
├── tsconfig.json              # TypeScript 配置（Node16 + strict）
└── package.json               # 依赖与脚本
```

---

## 4. 架构模式

采用 **Controller → Service → Prisma** 三层架构：

| 层级           | 职责                                             | 类比前端            |
| -------------- | ------------------------------------------------ | ------------------- |
| **Controller** | 接收 HTTP 请求，提取参数，调用 Service，返回响应 | Vue 页面组件        |
| **Service**    | 业务逻辑处理，数据库操作，权限校验               | Pinia Store Actions |
| **Prisma**     | 数据库访问层，ORM 查询                           | 直接调用 API        |
| **Middleware** | 认证、日志、错误处理                             | Vue 路由守卫        |

---

## 5. 数据库模型（Prisma Schema）

### User 表

- `id`: Int @id @default(autoincrement())
- `email`: String @unique
- `password`: String（bcrypt 哈希存储）
- `name`: String?（可选）
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **关联**：`posts Post[]`（一个用户多篇文章）

### Post 表

- `id`: Int @id @default(autoincrement())
- `title`: String
- `content`: String @db.Text
- `author`: String @default("Anonymous")
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `authorId`: Int? @map("author_id")
- **关联**：`user User?` @relation（多对一）

---

## 6. API 路由

### 公开接口（无需认证）

| 方法 | 路径                 | 说明             |
| ---- | -------------------- | ---------------- |
| POST | `/api/auth/register` | 用户注册         |
| POST | `/api/auth/login`    | 用户登录         |
| GET  | `/api/posts`         | 获取所有文章列表 |
| GET  | `/api/posts/:id`     | 获取单篇文章详情 |

### 需要认证（Authorization: Bearer <token>）

| 方法   | 路径             | 说明                     |
| ------ | ---------------- | ------------------------ |
| GET    | `/api/auth/me`   | 获取当前登录用户信息     |
| POST   | `/api/posts`     | 创建新文章               |
| PUT    | `/api/posts/:id` | 更新文章（只能改自己的） |
| DELETE | `/api/posts/:id` | 删除文章（只能删自己的） |

### 响应格式

```json
{
  "success": true,
  "data": { ... },
  "message": "可选描述"
}
```

---

## 7. 环境变量（.env）

```
NODE_ENV=development
PORT=3002
DATABASE_URL="mysql://root:password@localhost:3306/node_practice"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN="http://localhost:5173"
```

---

## 8. 常用命令

```bash
# 开发（热重载）
npm run dev              # tsx watch src/app.ts

# 构建
npm run build            # tsc 编译到 dist/

# 运行生产
npm run start            # node dist/app.js

# 数据库操作
npm run db:migrate       # prisma migrate dev
npm run db:generate      # prisma generate
npm run db:studio        # prisma studio（可视化数据库）

# 代码规范
npm run lint             # ESLint 检查
npm run lint:fix         # ESLint 自动修复
npm run format           # Prettier 格式化
npm run typecheck        # tsc --noEmit 类型检查

# 测试
npm run test             # 运行测试文件

# Docker
npm run docker:up        # docker-compose up -d
npm run docker:down      # docker-compose down
```

---

## 9. 开发规范

### 代码风格

- **Prettier**：printWidth=100, semi=false, singleQuote=true, tabWidth=2
- **ESLint**：Flat Config (eslint.config.mjs)，@eslint/js + typescript-eslint + prettier
- **TypeScript**：strict=true, module=Node16, moduleResolution=Node16

### 文件命名

- 控制器/服务/路由：`camelCase.ts`（如 `authController.ts`）
- 工具类：`camelCase.ts`（如 `errorHandler.ts`）
- 类型声明：`PascalCase.d.ts`（如 `express.d.ts`）

### 错误处理

- 统一使用 `AppError` 子类抛出业务错误
- 全局 `errorHandler` 中间件捕获所有错误并返回统一格式
- 自定义错误类型：ValidationError(400), UnauthorizedError(401), ForbiddenError(403), NotFoundError(404), ConflictError(409)

### 认证流程

1. 注册/登录 → 后端生成 JWT → 前端存储 token（localStorage: `blog_token`）
2. 后续请求 → 请求头携带 `Authorization: Bearer <token>`
3. `authenticateToken` 中间件验证 → 解码后挂载 `req.user` → Controller 使用

---

## 10. 与前端对接说明

- 前端项目：`node-practice-frontend`（Vue 3 + Vite）
- 前端通过 `/local/api` 代理到后端 `localhost:3002`
- 前端 axios 实例：`src/api/auth.ts`（baseURL: `/local/api`）
- 前端登录后存储 token：`localStorage.setItem('blog_token', token)`
- 前端路由守卫：刷新页面时若 token 存在且 userStore 为空，自动调用 `getMeApi()` 恢复登录状态

---

## 11. 后续更新记录

<!-- 每次重大变更后在此记录，便于 AI 后续对话快速理解变更 -->

### 2026-06-19

- 初始生成 agent.md，项目包含完整的认证 + 文章 CRUD 功能
- 后端三层架构已建立：Controller → Service → Prisma
- 前端已实现登录/注册页面，路由守卫，JWT 自动注入

---
