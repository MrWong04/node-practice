# AI 聊天后端 — 设计文档

> 日期：2026-08-09
> 状态：已确认（待实施）
> 范围：仅后端（前端页面后续另行规划）

## 1. 需求摘要

为「AI 聊天页面」提供后端能力，核心诉求：

- 接入 **DeepSeek API**（OpenAI 兼容格式），模型 `deepseek-chat`，成本优先
- 聊天记录 **持久化**（SQLite / MySQL，走现有 Prisma 基础设施）
- 回复使用 **SSE 流式输出**，体验接近 ChatGPT
- **必须登录**（复用现有 JWT 认证体系），会话归属用户，数据隔离
- 本次交付 **只做后端**，前端后续再做

## 2. 总体架构

沿用现有 MVC 分层（`routes → controllers → services`），新增独立 `chat` 模块：

```
src/
├── config/index.ts          # 扩展：DEEPSEEK_API_KEY、DEEPSEEK_BASE_URL、DEEPSEEK_MODEL
├── routes/chat.ts           # 新增：聊天路由（全部挂 authenticateToken）
├── controllers/chatController.ts  # 新增：请求解析 / 响应封装 / SSE 流写入
├── services/
│   ├── chatService.ts       # 新增：会话 CRUD、消息持久化、上下文组装、标题生成
│   └── deepseekService.ts   # 新增：DeepSeek API 调用（OpenAI 兼容 / 流式）
└── middleware/auth.ts       # 复用：JWT 鉴权
```

## 3. 数据模型

在 `prisma/schema.prisma` 新增两个模型（延续现有 `User` 风格，蛇形命名映射）：

```prisma
// 会话
model Conversation {
  id        Int      @id @default(autoincrement())
  title     String   @default("新对话")
  userId    Int      @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@map("conversations")
}

// 消息
model Message {
  id             Int      @id @default(autoincrement())
  conversationId Int      @map("conversation_id")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String   // "user" | "assistant"
  content        String   @db.Text
  createdAt      DateTime @default(now()) @map("created_at")

  @@index([conversationId])
  @@map("messages")
}
```

`User` 模型新增反向关系：`conversations Conversation[]`

设计要点：

- `onDelete: Cascade`：删会话级联删消息，删用户级联删会话
- `role` 用 String 而非枚举，保持简单（Prisma 枚举会带来额外迁移复杂度，当前 YAGNI）
- 消息不做流式中间状态（如 pending）字段，SSE 过程中未完成的回复不入库，流结束后一次性写入完整内容——简单且数据一致

## 4. API 端点

全部挂载在 `/api/chat` 前缀下，且全部需要 `Authorization: Bearer <token>`：

| 方法 | 路径 | 说明 | 请求体 / 参数 |
|---|---|---|---|
| POST | `/api/chat/conversations` | 创建会话（可带首条消息） | `{ title?, firstMessage? }` |
| GET | `/api/chat/conversations` | 会话列表（分页，倒序） | `?page=1&pageSize=20` |
| GET | `/api/chat/conversations/:id` | 会话详情（含全部消息） | — |
| PATCH | `/api/chat/conversations/:id` | 重命名会话 | `{ title }` |
| DELETE | `/api/chat/conversations/:id` | 删除会话（级联删消息） | — |
| POST | `/api/chat/conversations/:id/messages` | 发送消息，SSE 流式返回 | `{ content }`，请求头 `Accept: text/event-stream` |

统一响应格式（非流式接口）：`{ success, data?, message? }`，与现有 `utils/response.ts` 一致。

## 5. SSE 流式核心流程

```
客户端 POST /api/chat/conversations/:id/messages
  (Content-Type: application/json, Accept: text/event-stream, Authorization: Bearer)
  │
  ├─ 1. 校验：会话存在且属于当前用户
  ├─ 2. 用户消息入库 (role=user)
  ├─ 3. 组装上下文：该会话最近 20 条消息 → OpenAI 格式 messages
  ├─ 4. 调 DeepSeek (POST /chat/completions, stream: true)
  ├─ 5. 设置响应头 (text/event-stream, no-cache) → 开始转发
  │     ├─ 每个 delta chunk → res.write('data: {"id":...,"content":"..."}\n\n')
  │     └─ 客户端可据此做打字机效果
  ├─ 6. 流结束后：
  │     ├─ 拼接完整 AI 回复 → 入库 (role=assistant)
  │     └─ res.write('data: [DONE]\n\n') → res.end()
  └─ 7. 异常分支：
        ├─ 上游错误 → 发送 SSE error 事件（含 message）后关闭
        └─ 若 AI 回复为空 → 不创建空消息，直接发 [DONE]
```

SSE 事件格式约定（前端后续实现时对齐）：

```jsonc
// 增量块
event: message
data: {"id": 1, "content": "你好"}

// 结束
data: [DONE]

// 错误
event: error
data: {"message": "DeepSeek API 调用失败: ..."}
```

## 6. DeepSeek 集成

- **协议**：OpenAI 兼容 — `POST {DEEPSEEK_BASE_URL}/chat/completions`（默认 `https://api.deepseek.com`）
- **鉴权**：`Authorization: Bearer {DEEPSEEK_API_KEY}`
- **请求体**：

```json
{
  "model": "deepseek-chat",
  "messages": [{"role": "user", "content": "..."}],
  "stream": true
}
```

- **Node 实现**：用 Node 原生 `fetch`（Node 18+，项目 engines 已声明 >=18）发起流式请求，`for await (const chunk of response.body)` 逐块解析 SSE 行，提取 `choices[0].delta.content`
- **注意**：需处理 `data: [DONE]` 行、多行 `data:` 块、chunk 被 TCP 分包/粘包的情况（按行 + 按 `data:` 前缀解析，忽略注释行）

## 7. 成本控制策略

| 手段 | 说明 |
|---|---|
| 模型固定 `deepseek-chat` | 不用 `deepseek-reasoner`（价格高数倍） |
| 上下文截断最近 20 条 | 防 token 无限膨胀；常量 `MAX_CONTEXT_MESSAGES = 20` 放 config，可调 |
| 标题不调模型 | 用首条消息截断前 20 字符生成 |
| 空消息不请求 | `content` 去空后校验，空则 400 |
| 失败不重试计费 | 上游异常直接报错，不做盲目重试 |

## 8. 安全

- 全部路由挂 `authenticateToken`，从 `req.user.userId` 取用户
- **资源归属校验**：所有按 `:id` 的操作先查 `userId === req.user.userId`，否则 404（不泄露资源存在性）
- API Key 仅存在于服务端 `.env`，响应中绝不返回
- 请求体长度限制：`content` 最多 4000 字符（防滥用）

## 9. 测试计划（tests/api-chat.test.js）

沿用现有 `api-auth.test.js` 的风格（启动服务后跑真实 HTTP）：

1. 未登录访问 chat 接口 → 401
2. 登录 → 创建会话（带首条消息）→ 返回会话含 2 条消息（user + assistant mock）
3. 会话列表 → 含新会话，分页字段正确
4. 会话详情 → 消息完整、顺序正确
5. 重命名 → 标题更新
6. 删除 → 会话及其消息消失
7. 发送消息（mock DeepSeek）→ SSE 流完整：含多个 `data:` 块与 `[DONE]`，且 assistant 消息已入库
8. 跨用户隔离 → 用户 B 访问用户 A 的会话 → 404

测试中 DeepSeek 调用通过环境变量注入 mock 服务地址（`DEEPSEEK_BASE_URL` 指向本地 mock server），**不产生真实费用**。

## 10. 配置项（.env 新增）

```
DEEPSEEK_API_KEY=sk-xxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

`src/config/index.ts` 中读取，未配置 API Key 时启动即打印警告（不阻塞启动，便于本地无 Key 调试时用 mock）。

## 11. 交付物清单

- [ ] `prisma/schema.prisma`：新增 Conversation / Message / User 关联 + 迁移
- [ ] `src/config/index.ts`：新增 DeepSeek 配置
- [ ] `src/services/deepseekService.ts`
- [ ] `src/services/chatService.ts`
- [ ] `src/controllers/chatController.ts`
- [ ] `src/routes/chat.ts` + `src/app.ts` 挂载
- [ ] `.env.example` 补充 DeepSeek 配置说明
- [ ] `tests/api-chat.test.js`
- [ ] README / agent.md 补充接口文档（可选）
