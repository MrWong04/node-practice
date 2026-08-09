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
| 工具库   | pinyin-pro 3.x（中文转拼音，slug 生成） |
| 构建工具 | tsc + tsx（开发热重载）                 |
| 代码规范 | ESLint 9.x (Flat Config) + Prettier 3.x |
| 部署     | Docker + Docker Compose（多阶段构建）   |

---

## 3. 项目结构

```
node-practice-backend/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义（User + Post + Category + Tag）
│   ├── client.ts              # PrismaClient 单例封装
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app.ts                 # 应用入口：路由挂载、中间件注册、服务启动
│   ├── config/
│   │   └── index.ts           # 环境变量集中读取（PORT, SALT_ROUNDS, JWT_SECRET）
│   ├── controllers/
│   │   ├── authController.ts      # 认证接口：register, login, me
│   │   ├── categoryController.ts # 分类接口：getAll, getById, getBySlug, create, update, remove
│   │   ├── postController.ts      # 文章接口：getAll, getById, create, update, remove
│   │   └── tagController.ts       # 标签接口：getAll, getById, getBySlug, create, update, remove, addTagsToPost, removeTagFromPost
│   ├── middleware/
│   │   ├── auth.ts            # JWT 认证中间件 + Token 生成工具
│   │   └── errorHandler.ts    # 全局错误处理中间件
│   ├── routes/
│   │   ├── auth.ts            # /api/auth/* 路由定义
│   │   ├── categories.ts      # /api/categories/* 路由定义
│   │   ├── posts.ts           # /api/posts/* 路由定义
│   │   └── tags.ts            # /api/tags/* 路由定义
│   ├── services/
│   │   ├── authService.ts      # 认证业务逻辑：注册、登录、查用户
│   │   ├── categoryService.ts  # 分类业务逻辑：CRUD + slug 拼音生成 + 列表筛选分页
│   │   ├── postService.ts      # 文章业务逻辑：CRUD + 权限校验 + 列表筛选分页
│   │   └── tagService.ts       # 标签业务逻辑：CRUD + slug 拼音生成 + 文章标签关联 + 列表筛选分页
│   ├── types/
│   │   └── express.d.ts      # Express Request 扩展类型（req.user）
│   └── utils/
│       ├── errors.ts          # 自定义错误类（AppError 及子类）
│       ├── query.ts           # 分页与查询参数解析（parsePagination 等）
│       ├── response.ts        # 统一响应格式封装
│       └── slug.ts            # slug 生成（name 转拼音，pinyin-pro）
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
- **关联**：`conversations Conversation[]`（一个用户多个 AI 聊天会话）

### Post 表

- `id`: Int @id @default(autoincrement())
- `title`: String
- `description`: String? @db.Text
- `content`: String @db.Text
- `author`: String @default("Anonymous")
- `createdAt`: DateTime
- `updatedAt`: DateTime
- `authorId`: Int? @map("author_id")
- **关联**：`user User?` @relation（多对一）
- **关联**：`category Category?` @relation（多对一）
- **关联**：`tags PostTag[]`（多对多）

### Category 表

- `id`: Int @id @default(autoincrement())
- `name`: String @unique
- `slug`: String @unique
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **关联**：`posts Post[]`（一个分类多篇文章）

### Tag 表

- `id`: Int @id @default(autoincrement())
- `name`: String @unique
- `slug`: String @unique
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **关联**：`postTags PostTag[]`（多对多）

### PostTag 表（文章-标签关联）

- `id`: Int @id @default(autoincrement())
- `postId`: Int @map("post_id")
- `tagId`: Int @map("tag_id")
- `createdAt`: DateTime
- **关联**：`post Post` @relation（onDelete: Cascade）
- **关联**：`tag Tag` @relation（onDelete: Cascade）

### Conversation 表（AI 聊天会话）

- `id`: Int @id @default(autoincrement())
- `title`: String @default("新对话")（首条消息自动截断生成）
- `userId`: Int @map("user_id")
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **索引**：`@@index([userId])`
- **关联**：`user User` @relation（onDelete: Cascade）
- **关联**：`messages Message[]`（一个会话多条消息）

### Message 表（聊天消息）

- `id`: Int @id @default(autoincrement())
- `conversationId`: Int @map("conversation_id")
- `role`: String（`"user"` | `"assistant"`）
- `content`: String @db.Text
- `createdAt`: DateTime
- **索引**：`@@index([conversationId])`
- **关联**：`conversation Conversation` @relation（onDelete: Cascade）

---

## 6. API 路由

### 公开接口（无需认证）

| 方法 | 路径                         | 说明                 |
| ---- | ---------------------------- | -------------------- |
| POST | `/api/auth/register`         | 用户注册             |
| POST | `/api/auth/login`            | 用户登录             |
| GET  | `/api/posts`                 | 获取文章列表（支持 keyword/categoryId/tagId 筛选 + page/pageSize 分页） |
| GET  | `/api/posts/:id`             | 获取单篇文章详情                                                        |
| GET  | `/api/categories`            | 获取分类列表（支持 name/slug 筛选 + page/pageSize 分页）                |
| GET  | `/api/categories/:id`        | 根据 ID 获取分类详情                                                    |
| GET  | `/api/categories/slug/:slug` | 根据 slug 获取分类详情                                                  |
| GET  | `/api/tags`                  | 获取标签列表（支持 name/slug 筛选 + page/pageSize 分页）                |
| GET  | `/api/tags/:id`              | 根据 ID 获取标签详情                                                    |
| GET  | `/api/tags/slug/:slug`       | 根据 slug 获取标签详情                                                  |

### 需要认证（Authorization: Bearer <token>）

| 方法   | 路径                             | 说明                     |
| ------ | -------------------------------- | ------------------------ |
| GET    | `/api/auth/me`                   | 获取当前登录用户信息     |
| POST   | `/api/posts`                     | 创建新文章               |
| PUT    | `/api/posts/:id`                 | 更新文章（只能改自己的） |
| DELETE | `/api/posts/:id`                 | 删除文章（只能删自己的） |
| POST   | `/api/categories`                | 创建新分类               |
| PUT    | `/api/categories/:id`            | 更新分类                 |
| DELETE | `/api/categories/:id`            | 删除分类                 |
| POST   | `/api/tags`                      | 创建新标签               |
| PUT    | `/api/tags/:id`                  | 更新标签                 |
| DELETE | `/api/tags/:id`                  | 删除标签                 |
| POST   | `/api/posts/:postId/tags`        | 为文章添加标签           |
| DELETE | `/api/posts/:postId/tags/:tagId` | 从文章移除标签           |
| POST   | `/api/chat/conversations`        | 创建会话（可带 `firstMessage`） |
| GET    | `/api/chat/conversations`        | 会话列表（page/pageSize 分页）  |
| GET    | `/api/chat/conversations/:id`    | 会话详情（含全部消息）          |
| PATCH  | `/api/chat/conversations/:id`    | 重命名会话                      |
| DELETE | `/api/chat/conversations/:id`    | 删除会话（级联删消息）          |
| POST   | `/api/chat/conversations/:id/messages` | 发送消息（**SSE 流式**） |

### AI 聊天 SSE 事件格式（POST /api/chat/conversations/:id/messages）

```text
event: user_message   # 用户消息入库回执
data: {"id":2,"role":"user","content":"..."}

event: message        # AI 回复增量块
data: {"id":"...","content":"增量文本"}

event: done           # 回复完整结束
data: {"messageId":123}

event: error          # 上游出错（如未配置 API Key）
data: {"message":"..."}
```

**上下文策略**：发送消息时仅携带该会话最近 20 条消息（`MAX_CONTEXT_MESSAGES`，config 可调），控制 token 成本；标题由首条消息截断 20 字符生成，不额外调用模型。

### 响应格式

**普通接口**：

```json
{
  "success": true,
  "data": { ... },
  "message": "可选描述"
}
```

**列表接口（分页）**：`GET /api/posts`、`GET /api/categories`、`GET /api/tags`

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

分页默认值：`page=1`，`pageSize=10`，`pageSize` 最大 `100`。

**slug 自动生成**：创建分类/标签时未传 `slug`，则通过 `pinyin-pro` 将 `name` 转为拼音 slug（如 `"技术"` → `ji-shu`）。

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
DEEPSEEK_API_KEY=sk-xxxx          # DeepSeek 平台 / 商汤代理 API Key（聊天功能必填）
DEEPSEEK_BASE_URL=https://token.sensenova.cn/v1   # 商汤日日新代理端点（当前启用）
DEEPSEEK_MODEL=deepseek-v4-flash  # 商汤端点模型
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

## 11. 更新维护规范（Skill）

> 以下规范用于指导 AI 在后续开发中保持 agent.md 与项目同步。

### 何时更新 agent.md

- **新增功能模块**：新增 Controller / Service / 路由 / 模型时，必须同步更新：
  - 第 3 节（项目结构）中的文件列表
  - 第 5 节（数据库模型）中的表定义
  - 第 6 节（API 路由）中的接口列表
- **修改现有功能**：接口路径、方法、参数、权限变更时，同步更新：
  - 第 6 节（API 路由）中的对应条目
  - 第 12 节（后续更新记录）中的变更说明
- **删除功能**：废弃接口或模块时，同步更新：
  - 第 3 节（项目结构）中标记或移除对应文件
  - 第 6 节（API 路由）中移除或标注已废弃
  - 第 12 节（后续更新记录）中记录废弃原因

### 更新顺序

1. 先完成代码变更（Schema → Service → Controller → Route → App）
2. 再更新 API 文档（docs/api/\*.md）
3. **最后更新 agent.md**（确保所有变更已稳定）
4. 数据库迁移完成后，在更新记录中标记迁移文件名

---

## 12. 后续更新记录

<!-- 每次重大变更后在此记录，便于 AI 后续对话快速理解变更 -->

### 2026-06-19

- 初始生成 agent.md，项目包含完整的认证 + 文章 CRUD 功能
- 后端三层架构已建立：Controller → Service → Prisma
- 前端已实现登录/注册页面，路由守卫，JWT 自动注入

### 2026-06-22

- 新增分类（Category）和标签（Tag）功能模块
- 数据库 schema 扩展：Post 关联 Category，Post 与 Tag 多对多关联
- 新增 Service 层：`categoryService.ts`、`tagService.ts`
- 新增 Controller 层：`categoryController.ts`、`tagController.ts`
- 新增路由：`/api/categories/*`、`/api/tags/*` 及文章标签关联接口
- 数据库迁移：`20260622155844_add_categories_and_tags`
- 新增 API 文档：`docs/api/categories.md`、`docs/api/tags.md`
- 更新 `docs/api/README.md` 索引

### 2026-06-23

- 分类/标签 slug 自动生成：未传 `slug` 时通过 `pinyin-pro` 将 `name` 转为拼音（新增 `src/utils/slug.ts`）
- 列表接口支持筛选与分页：新增 `src/utils/query.ts`（`parsePagination`、`buildPaginatedResult` 等）
- 文章列表：可选 `keyword`、`categoryId`、`tagId` + `page`/`pageSize`
- 分类/标签列表：可选 `name`、`slug` + `page`/`pageSize`
- 列表响应结构由数组改为 `{ items, pagination }`
- 新增依赖：`pinyin-pro`
- 同步更新 API 文档（`docs/api/posts.md`、`categories.md`、`tags.md`、`README.md`）

### 2026-06-23（续）

- 文章接口响应结构统一：列表/详情/创建/更新/删除均返回相同 `Post` 对象
- 新增 `formatPost` 与统一 `postSelect` 查询字段（含 author、updatedAt、authorId、user 等）
- `tags` 由嵌套 `{ tag: {...} }` 改为扁平数组，与前端 `Post` 类型对齐
- 分类/标签更新：传入 `name` 但未传 `slug` 时，自动从 name 转拼音更新 slug

---
