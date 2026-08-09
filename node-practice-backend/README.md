# node-practice-backend

Node.js 后端练习项目 — Express + Prisma + MySQL + TypeScript

## 技术栈

| 类别   | 技术                             |
| ------ | -------------------------------- |
| 运行时 | Node.js 18+                      |
| 框架   | Express 5.x                      |
| 语言   | TypeScript                       |
| ORM    | Prisma 6.x                       |
| 数据库 | MySQL 8.0                        |
| 认证   | JWT (jsonwebtoken) + bcrypt      |

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件，根据实际情况修改以下配置：

- **`DATABASE_URL`** — MySQL 连接字符串，格式：`mysql://用户名:密码@主机:端口/数据库名`
- **`JWT_SECRET`** — JWT 签名密钥（至少 32 字符随机字符串）
- **`PORT`** — 服务端口，默认 `3002`

### 3. 启动 MySQL 数据库

**方式一：Docker（推荐）**

```bash
# 启动 MySQL 容器（后台运行）
docker-compose up -d db
```

**方式二：本地 MySQL**

确保本地已安装并启动 MySQL 8.0，然后手动创建数据库：

```sql
CREATE DATABASE node_practice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 生成 Prisma Client & 执行数据库迁移

```bash
# 生成 Prisma Client（类型安全的数据库查询客户端）
npx prisma generate

# 执行数据库迁移（创建/更新表结构）
npx prisma migrate dev
```

> **注意**：每次修改 `prisma/schema.prisma` 后都需要重新执行以上两条命令。

### 5. 启动开发服务器

```bash
npm run dev
```

服务启动后访问：`http://localhost:3002`

---

## 可用脚本

| 命令                  | 说明                         |
| --------------------- | ---------------------------- |
| `npm run dev`         | 启动开发服务器（热重载）     |
| `npm run build`       | 编译 TypeScript              |
| `npm start`           | 启动生产服务器               |
| `npm run db:migrate`  | 执行数据库迁移               |
| `npm run db:generate` | 生成 Prisma Client           |
| `npm run db:studio`   | 打开 Prisma Studio 管理界面  |
| `npm run test`        | 运行 API 测试                |
| `npm run lint`        | ESLint 代码检查              |
| `npm run format`      | Prettier 代码格式化          |
| `npm run typecheck`   | TypeScript 类型检查          |

## API 端点

### 公开接口

| 方法   | 路径                          | 说明         |
| ------ | ----------------------------- | ------------ |
| POST   | `/api/auth/register`          | 用户注册     |
| POST   | `/api/auth/login`             | 用户登录     |
| GET    | `/api/posts`                  | 获取文章列表 |
| GET    | `/api/posts/:id`              | 获取文章详情 |
| GET    | `/api/categories`             | 获取分类列表 |
| GET    | `/api/categories/:id`         | 获取分类详情 |
| GET    | `/api/categories/slug/:slug`  | 按 slug 查分类 |
| GET    | `/api/tags`                   | 获取标签列表 |
| GET    | `/api/tags/:id`               | 获取标签详情 |
| GET    | `/api/tags/slug/:slug`        | 按 slug 查标签 |

### 需认证接口（Header: `Authorization: Bearer <token>`）

| 方法   | 路径                          | 说明         |
| ------ | ----------------------------- | ------------ |
| GET    | `/api/auth/me`                | 获取当前用户 |
| POST   | `/api/posts`                  | 创建文章     |
| PUT    | `/api/posts/:id`              | 更新文章     |
| DELETE | `/api/posts/:id`              | 删除文章     |
| POST   | `/api/categories`             | 创建分类     |
| PUT    | `/api/categories/:id`         | 更新分类     |
| DELETE | `/api/categories/:id`         | 删除分类     |
| POST   | `/api/tags`                   | 创建标签     |
| PUT    | `/api/tags/:id`               | 更新标签     |
| DELETE | `/api/tags/:id`               | 删除标签     |
| POST   | `/api/posts/:postId/tags`     | 为文章添加标签 |

### AI 聊天接口（需认证）

| 方法   | 路径                                          | 说明                            |
| ------ | --------------------------------------------- | ------------------------------- |
| POST   | `/api/chat/conversations`                     | 创建会话（可带 `firstMessage`） |
| GET    | `/api/chat/conversations`                     | 会话列表（分页）                |
| GET    | `/api/chat/conversations/:id`                 | 会话详情（含全部消息）          |
| PATCH  | `/api/chat/conversations/:id`                 | 重命名会话                      |
| DELETE | `/api/chat/conversations/:id`                 | 删除会话                        |
| POST   | `/api/chat/conversations/:id/messages`        | 发送消息（**SSE 流式返回**）    |

**SSE 事件格式**（发送消息接口）：

```text
event: user_message    # 用户消息入库回执，data 为该消息对象
event: message         # AI 回复增量块，data: {"id": "...", "content": "..."}
event: done            # 回复结束，data: {"messageId": 123}
event: error           # 出错，data: {"message": "错误说明"}
```

**环境变量**（AI 聊天功能）：

```bash
DEEPSEEK_API_KEY=sk-xxxx                    # DeepSeek 平台（或商汤代理）API Key
DEEPSEEK_BASE_URL=https://token.sensenova.cn/v1   # 商汤日日新代理端点（当前启用）
# DEEPSEEK_BASE_URL=https://api.deepseek.com     # 或 DeepSeek 官方端点
DEEPSEEK_MODEL=deepseek-v4-flash            # 当前模型（商汤端点）
# DEEPSEEK_MODEL=deepseek-chat              # 官方端点模型
```

> 说明：当前项目实际使用**商汤日日新代理端点**（`token.sensenova.cn` + `deepseek-v4-flash`），`.env` 已配置。未配置 `DEEPSEEK_API_KEY` 时，发送消息接口会返回 SSE `error` 事件，其余功能（会话/消息 CRUD）不受影响。

## Docker 部署

```bash
# 构建并启动全部服务（API + MySQL）
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down
```

## 项目结构

```
node-practice-backend/
├── prisma/
│   ├── schema.prisma          # 数据模型定义
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── app.ts                 # 入口文件
│   ├── config/                # 全局配置
│   ├── controllers/           # 控制器
│   ├── middleware/             # 中间件（auth, errorHandler）
│   ├── routes/                # 路由定义
│   ├── services/              # 业务逻辑层
│   ├── types/                 # 类型定义
│   └── utils/                 # 工具函数
├── tests/                     # 测试文件
├── docs/                      # 文档
├── .env.example               # 环境变量模板
├── docker-compose.yml         # Docker Compose 配置
└── Dockerfile                 # Docker 镜像构建文件
```
