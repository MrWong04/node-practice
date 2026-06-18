# 个人博客全栈系统 - 项目大纲

> 目标：基于 Vue3 + Node.js + MySQL，构建一个功能完整、部署上线的个人博客系统。

---

## 项目愿景

一个**简洁、快速、SEO 友好**的个人博客，支持 Markdown 写作、代码高亮、评论互动，并能通过后台管理系统高效发布内容。

---

## 技术栈

| 层级       | 技术                                                         |
| ---------- | ------------------------------------------------------------ |
| **前端**   | Vue3 + TypeScript + Vite + Pinia + Vue Router + Element Plus |
| **后端**   | Node.js + Express + TypeScript + Prisma                      |
| **数据库** | MySQL 8.0                                                    |
| **缓存**   | Redis（后续接入）                                            |
| **部署**   | Docker + Nginx                                               |

---

## 系统架构

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   浏览器     │ ←──→ │   Nginx     │ ←──→ │  Vue3 SPA   │
│  (用户)      │      │  (反向代理)  │      │  (前端页面)  │
└─────────────┘      └──────┬──────┘      └─────────────┘
                             │
                      ┌──────▼──────┐
                      │  Express    │
                      │  API 服务   │
                      └──────┬──────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
         ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
         │   MySQL   │ │  Redis  │ │  文件存储  │
         │  (主数据)  │ │ (缓存)  │ │ (图片/头像)│
         └───────────┘ └─────────┘ └───────────┘
```

---

## 功能模块

### Phase 1：核心基础（已完成 ✅）

| 模块     | 功能                      | 状态 |
| -------- | ------------------------- | ---- |
| 用户系统 | 注册、登录、JWT 认证      | ✅   |
| 文章系统 | 文章的增删改查            | ✅   |
| 数据库   | MySQL + Prisma ORM        | ✅   |
| 项目结构 | Express + TypeScript 骨架 | ✅   |

### Phase 1.5：架构优化（已完成 ✅）

| 模块     | 功能                                 | 状态 |
| -------- | ------------------------------------ | ---- |
| 分层重构 | Controller / Service / Routes 拆分   | ✅   |
| 统一响应 | 封装 successResponse / errorResponse | ✅   |
| 异常处理 | 自定义 AppError 及全局错误中间件     | ✅   |
| 配置集中 | 环境变量统一收归 config/index.ts     | ✅   |
| 国际化   | 接口报错信息全部中文返回             | ✅   |

### Phase 2：博客核心功能（下一步）

| 模块     | 功能                    | 优先级 |
| -------- | ----------------------- | ------ |
| 文章系统 | Markdown 编辑器 + 渲染  | 🔴 高  |
| 文章系统 | 文章分类 / 标签         | 🔴 高  |
| 文章系统 | 文章状态（草稿/已发布） | 🔴 高  |
| 文章系统 | 分页列表 + 搜索         | 🔴 高  |
| 评论系统 | 文章评论（嵌套回复）    | 🟡 中  |
| 用户系统 | 个人资料 + 头像上传     | 🟡 中  |
| 用户系统 | 管理员权限控制          | 🟡 中  |

### Phase 3：体验优化

| 模块 | 功能                     | 优先级 |
| ---- | ------------------------ | ------ |
| SEO  | SSR / 预渲染 / Meta 标签 | 🟡 中  |
| 性能 | Redis 缓存热点文章       | 🟡 中  |
| 性能 | 数据库索引优化           | 🟡 中  |
| 安全 | Zod 参数校验             | 🟡 中  |
| 安全 | 接口限流 Rate Limit      | 🟢 低  |

### Phase 4：工程化与部署

| 模块  | 功能                      | 优先级 |
| ----- | ------------------------- | ------ |
| 测试  | Jest 单元测试 + Supertest | 🟡 中  |
| 日志  | Winston 结构化日志        | 🟡 中  |
| 部署  | Docker 容器化             | 🟡 中  |
| CI/CD | 自动构建                  | 🟢 低  |
| 监控  | 健康检查 / APM            | 🟢 低  |

---

## 数据库设计（当前 + 扩展）

### 当前模型

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)  // 新增：权限角色
  avatar    String?                   // 新增：头像 URL
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
  comments  Comment[]                 // 新增：评论关联
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  slug      String   @unique          // 新增：URL 友好标识
  summary   String?  @db.Text         // 新增：摘要
  status    Status   @default(DRAFT)  // 新增：发布状态
  author    String
  authorId  Int?
  user      User?    @relation(fields: [authorId], references: [id])
  comments  Comment[]                 // 新增：评论关联
  tags      Tag[]                     // 新增：标签多对多
  category  Category? @relation(fields: [categoryId], references: [id])
  categoryId Int?
  viewCount Int      @default(0)      // 新增：浏览量
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 新增模型
model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  author    String
  email     String
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  parentId  Int?
  createdAt DateTime @default(now())
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  posts Post[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  posts Post[]
}

enum Role {
  USER
  ADMIN
}

enum Status {
  DRAFT
  PUBLISHED
}
```

---

## API 设计规范

### 基础响应格式

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应格式

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "请求参数错误",
  "details": { "email": "邮箱格式不正确" }
}
```

### 接口清单

| 方法   | 路径                   | 说明             | 认证   |
| ------ | ---------------------- | ---------------- | ------ |
| POST   | /api/auth/register     | 注册             | 公开   |
| POST   | /api/auth/login        | 登录             | 公开   |
| GET    | /api/auth/me           | 当前用户         | 需登录 |
| GET    | /api/posts             | 文章列表（分页） | 公开   |
| GET    | /api/posts/:id         | 文章详情         | 公开   |
| POST   | /api/posts             | 创建文章         | 需登录 |
| PUT    | /api/posts/:id         | 更新文章         | 需登录 |
| DELETE | /api/posts/:id         | 删除文章         | 需登录 |
| GET    | /api/categories        | 分类列表         | 公开   |
| GET    | /api/tags              | 标签列表         | 公开   |
| POST   | /api/comments          | 发表评论         | 公开   |
| GET    | /api/comments?postId=1 | 评论列表         | 公开   |

---

## 前端页面规划

| 页面     | 路由                  | 说明                        |
| -------- | --------------------- | --------------------------- |
| 首页     | /                     | 文章列表 + 分页             |
| 文章详情 | /post/:slug           | Markdown 渲染 + 评论        |
| 分类页   | /category/:slug       | 按分类筛选文章              |
| 标签页   | /tag/:slug            | 按标签筛选文章              |
| 关于页   | /about                | 个人简介                    |
| 登录页   | /admin/login          | 管理后台登录                |
| 文章管理 | /admin/posts          | 文章列表 + 编辑/删除        |
| 文章编辑 | /admin/posts/new      | 新建文章（Markdown 编辑器） |
| 文章编辑 | /admin/posts/:id/edit | 编辑文章                    |

---

## 开发里程碑

| 里程碑   | 目标                                  | 预计时间  |
| -------- | ------------------------------------- | --------- |
| **M1**   | 基础 API 完成（认证 + 文章 CRUD）     | ✅ 已完成 |
| **M1.5** | 架构重构（分层 + 统一错误 + 中文）    | ✅ 已完成 |
| **M2**   | 博客核心功能（分类/标签/评论）        | 2 周      |
| **M3**   | Vue3 前端联调（首页/文章页/管理后台） | 2 周      |
| **M4**   | 性能优化（Redis + 索引）              | 1 周      |
| **M5**   | 测试覆盖 + 日志体系                   | 1 周      |
| **M6**   | Docker 部署上线                       | 1 周      |

---

## 文件结构（实际当前）

```
node-practice-backend/
├── prisma/
│   ├── schema.prisma
│   ├── client.ts
│   └── migrations/
├── src/
│   ├── app.ts                 ← 入口：挂载中间件、路由、启动服务器
│   ├── config/
│   │   └── index.ts           ← 环境变量/全局配置（PORT, JWT_SECRET, SALT_ROUNDS）
│   ├── routes/
│   │   ├── auth.ts            ← 认证路由（register, login, me）
│   │   └── posts.ts           ← 文章路由（CRUD）
│   ├── controllers/
│   │   ├── authController.ts  ← 处理 HTTP 请求/响应格式
│   │   └── postController.ts
│   ├── services/
│   │   ├── authService.ts     ← 业务逻辑 + 数据库操作（Prisma）
│   │   └── postService.ts
│   ├── middleware/
│   │   ├── auth.ts            ← JWT 认证中间件 + 生成 Token
│   │   └── errorHandler.ts    ← 全局错误处理中间件
│   ├── utils/
│   │   ├── errors.ts          ← 自定义错误类（AppError, ValidationError...）
│   │   └── response.ts        ← 统一响应格式（successResponse / errorResponse）
│   └── types/
│       └── express.d.ts       ← Express Request 扩展类型（req.user）
├── tests/
│   ├── api-auth.test.js
│   ├── api-memory.test.js
│   ├── api-prisma.test.js
│   └── read-db.js
├── docs/
│   ├── project-outline.md
│   ├── backend-roadmap.md
│   └── api/
│       ├── auth.md
│       ├── posts.md
│       └── README.md
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
└── ...
```

---

## 成功标准

博客系统上线后，应满足：

- [ ] 首页加载时间 < 2 秒
- [ ] 支持 Markdown 写作和代码高亮
- [ ] 文章支持分类和标签
- [ ] 访客可以评论，博主可以回复
- [ ] 管理后台可以发布/编辑/删除文章
- [ ] 部署在服务器上，可通过域名访问
- [ ] 核心接口有单元测试覆盖

---

_最后更新：2026-06-15_
