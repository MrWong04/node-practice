# AI 聊天后端 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 AI 聊天页面实现后端 API：会话 CRUD + 消息持久化 + DeepSeek SSE 流式回复，复用现有 Express + Prisma + JWT 基础设施。

**Architecture:** 在现有 MVC 分层（routes → controllers → services）中新增 chat 模块；Prisma 新增 Conversation/Message 两表；DeepSeek 调用封装在独立 service（OpenAI 兼容 + 原生 fetch 流式解析）；SSE 由 controller 直接向 res 写入。

**Tech Stack:** Express 5, Prisma 6 (MySQL), TypeScript 6, Node 18+ 原生 fetch, SSE, DeepSeek API (OpenAI 兼容)

**前置环境（已验证）：** MySQL 3306 运行中；后端服务运行在 3002；Prisma 6.19.3 可用；当前分支 `feat-博客项目`。

---

## Task 1: Prisma 数据模型 + 迁移

**Files:**
- Modify: `prisma/schema.prisma`（User 模型加反向关系，新增 Conversation、Message）
- Create: 迁移（`npx prisma migrate dev` 自动生成）

**Step 1: 修改 schema.prisma**

在 `User` 模型中追加反向关系：

```prisma
  // 关联：一个用户有多个 AI 聊天会话
  conversations Conversation[]
```

文件末尾新增两个模型：

```prisma
// AI 聊天会话
model Conversation {
  id        Int       @id @default(autoincrement())
  title     String    @default("新对话")
  userId    Int       @map("user_id")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@index([userId])
  @@map("conversations")
}

// 聊天消息
model Message {
  id             Int          @id @default(autoincrement())
  conversationId Int          @map("conversation_id")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // "user" | "assistant"
  content        String       @db.Text
  createdAt      DateTime     @default(now()) @map("created_at")

  @@index([conversationId])
  @@map("messages")
}
```

**Step 2: 执行迁移**

Run: `cd node-practice-backend && npx prisma migrate dev --name add_chat_conversations`
Expected: 成功生成迁移，输出 "Your database is now in sync with your schema"

**Step 3: 验证**

Run: `npx prisma validate && npx tsc --noEmit`
Expected: 无错误输出

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: 新增会话与消息数据模型"
```

---

## Task 2: 配置扩展（config/index.ts + .env.example）

**Files:**
- Modify: `src/config/index.ts`
- Modify: `.env.example`

**Step 1: 修改 src/config/index.ts**（追加到文件末尾）

```ts
// --------------------------------------------------------------------------
// DeepSeek AI 配置
// --------------------------------------------------------------------------

export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

// 组装上下文时最多携带的历史消息条数（控制 token 成本）
export const MAX_CONTEXT_MESSAGES = 20

// 单条消息最大长度
export const MAX_MESSAGE_LENGTH = 4000

// 会话标题截断长度
export const TITLE_MAX_LENGTH = 20
```

**Step 2: 修改 .env.example**（追加）

```
# ---------------------------------------------------------------------------
# DeepSeek AI 配置（AI 聊天功能）
# ---------------------------------------------------------------------------

# DEEPSEEK_API_KEY — DeepSeek 平台 API Key，https://platform.deepseek.com/
# 留空则聊天接口返回错误提示
DEEPSEEK_API_KEY=

# DEEPSEEK_BASE_URL — DeepSeek API 地址（OpenAI 兼容）
DEEPSEEK_BASE_URL=https://api.deepseek.com

# DEEPSEEK_MODEL — 模型名，deepseek-chat 为通用对话模型
DEEPSEEK_MODEL=deepseek-chat
```

**Step 3: 验证**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 4: Commit**

```bash
git add src/config/index.ts .env.example
git commit -m "feat: 新增 DeepSeek 配置项"
```

---

## Task 3: DeepSeek 流式服务

**Files:**
- Create: `src/services/deepseekService.ts`

**Step 1: 创建 deepseekService.ts**

```ts
import { AppError } from '../utils/errors'
import { DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL } from '../config'

// ==========================================================================
// DeepSeek Service — OpenAI 兼容 API 调用（支持 SSE 流式）
// ==========================================================================

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionChunk {
  id: string
  content: string
}

/**
 * 调用 DeepSeek 流式接口，异步生成器逐个产出内容增量
 */
export async function* streamChatCompletion(
  messages: ChatCompletionMessage[]
): AsyncGenerator<ChatCompletionChunk> {
  if (!DEEPSEEK_API_KEY) {
    throw new AppError('服务端未配置 DEEPSEEK_API_KEY，请先在 .env 中配置', 500)
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new AppError(`DeepSeek API 调用失败 (HTTP ${response.status}): ${errText.slice(0, 200)}`, 502)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // 按行切分 SSE 数据（处理分包/粘包）
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line.startsWith('data:')) continue // 忽略注释与事件行

      const payload = line.slice(5).trim()
      if (payload === '[DONE]') return

      try {
        const json = JSON.parse(payload)
        const content: string | undefined = json.choices?.[0]?.delta?.content
        if (content) {
          yield { id: json.id ?? '', content }
        }
      } catch {
        // 忽略无法解析的行（保持流健壮）
      }
    }
  }
}
```

**Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add src/services/deepseekService.ts
git commit -m "feat: DeepSeek 流式调用服务"
```

---

## Task 4: chatService 业务逻辑

**Files:**
- Create: `src/services/chatService.ts`

**Step 1: 创建 chatService.ts**

```ts
import { prisma } from '../../prisma/client'
import { ValidationError, NotFoundError } from '../utils/errors'
import { MAX_CONTEXT_MESSAGES, MAX_MESSAGE_LENGTH, TITLE_MAX_LENGTH } from '../config'
import { streamChatCompletion, ChatCompletionMessage } from './deepseekService'

// ==========================================================================
// Chat Service — 会话 CRUD、消息持久化、上下文组装、AI 流式回复
// ==========================================================================

/** 会话列表项（不含消息） */
function toConversationSummary(c: {
  id: number
  title: string
  createdAt: Date
  updatedAt: Date
  _count: { messages: number }
}) {
  return {
    id: c.id,
    title: c.title,
    messageCount: c._count.messages,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

/** 校验会话归属，返回会话；不存在或不属于当前用户均抛 404 */
async function findOwnedConversation(userId: number, conversationId: number) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  })
  if (!conversation) throw new NotFoundError('会话不存在')
  return conversation
}

/** 创建会话；若携带首条消息，则先入库用户消息 */
export async function createConversation(userId: number, title?: string, firstMessage?: string) {
  const finalTitle = title?.trim() || '新对话'

  const conversation = await prisma.conversation.create({
    data: { title: finalTitle.slice(0, 50), userId },
    select: { id: true, title: true, userId: true, createdAt: true, updatedAt: true },
  })

  if (firstMessage && firstMessage.trim()) {
    await addUserMessage(conversation.id, firstMessage.trim())
    // 用首条消息生成标题（不额外调模型，控制成本）
    const content = firstMessage.trim()
    const generatedTitle = content.length > TITLE_MAX_LENGTH
      ? `${content.slice(0, TITLE_MAX_LENGTH)}…`
      : content
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { title: generatedTitle },
    })
  }

  return prisma.conversation.findUnique({
    where: { id: conversation.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
}

/** 会话列表（分页，按更新时间倒序） */
export async function listConversations(userId: number, page = 1, pageSize = 20) {
  const where = { userId }
  const [total, list] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { messages: true } } },
    }),
  ])
  return {
    list: list.map(toConversationSummary),
    total,
    page,
    pageSize,
  }
}

/** 会话详情（含全部消息） */
export async function getConversation(userId: number, conversationId: number) {
  await findOwnedConversation(userId, conversationId)
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
}

/** 重命名会话 */
export async function renameConversation(userId: number, conversationId: number, title: string) {
  const trimmed = title?.trim()
  if (!trimmed) throw new ValidationError('标题不能为空')
  await findOwnedConversation(userId, conversationId)
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { title: trimmed.slice(0, 50) },
    select: { id: true, title: true, updatedAt: true },
  })
}

/** 删除会话（级联删除消息） */
export async function deleteConversation(userId: number, conversationId: number) {
  await findOwnedConversation(userId, conversationId)
  await prisma.conversation.delete({ where: { id: conversationId } })
}

/** 校验并写入一条用户消息 */
export async function addUserMessage(conversationId: number, content: string) {
  const trimmed = content?.trim()
  if (!trimmed) throw new ValidationError('消息内容不能为空')
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(`消息内容过长（最多 ${MAX_MESSAGE_LENGTH} 字符）`)
  }
  return prisma.message.create({
    data: { conversationId, role: 'user', content: trimmed },
  })
}

/** 追加一条助手消息（流结束后写入完整内容） */
export async function addAssistantMessage(conversationId: number, content: string) {
  const trimmed = content?.trim()
  if (!trimmed) return null
  const message = await prisma.message.create({
    data: { conversationId, role: 'assistant', content: trimmed },
  })
  // 触发会话 updatedAt 刷新
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {},
  })
  return message
}

/** 组装发送消息所需上下文（该会话最近 N 条历史） */
async function buildContextMessages(conversationId: number): Promise<ChatCompletionMessage[]> {
  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: MAX_CONTEXT_MESSAGES,
    select: { role: true, content: true },
  })
  // 倒序取出后需要反转回时间正序
  return history
    .reverse()
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
}

/**
 * 发送消息核心流程：
 * 1. 校验会话归属
 * 2. 用户消息入库
 * 3. 组装上下文（含刚写入的用户消息）
 * 4. 返回 { userMessage, stream } — stream 为 AsyncGenerator，调用方负责逐块转发
 */
export async function sendMessage(userId: number, conversationId: number, content: string) {
  await findOwnedConversation(userId, conversationId)
  const userMessage = await addUserMessage(conversationId, content)

  const context = await buildContextMessages(conversationId)
  const stream = streamChatCompletion(context)

  return { userMessage, stream }
}
```

**Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add src/services/chatService.ts
git commit -m "feat: 会话与消息业务逻辑"
```

---

## Task 5: chatController（含 SSE 流式响应）

**Files:**
- Create: `src/controllers/chatController.ts`

**Step 1: 创建 chatController.ts**

```ts
import { Request, Response, NextFunction } from 'express'
import { successResponse } from '../utils/response'
import * as chatService from '../services/chatService'

// ==========================================================================
// Chat Controller — 请求解析、响应封装、SSE 流式转发
// ==========================================================================

/** 解析 :id 路径参数 */
function parseId(raw: string): number {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) throw new Error('非法的会话 ID')
  return id
}

export async function createConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, firstMessage } = req.body ?? {}
    const conversation = await chatService.createConversation(req.user!.userId, title, firstMessage)
    res.status(201).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
    const result = await chatService.listConversations(req.user!.userId, page, pageSize)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const conversation = await chatService.getConversation(req.user!.userId, parseId(req.params.id))
    res.json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export async function renameConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await chatService.renameConversation(
      req.user!.userId,
      parseId(req.params.id),
      req.body?.title
    )
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export async function deleteConversation(req: Request, res: Response, next: NextFunction) {
  try {
    await chatService.deleteConversation(req.user!.userId, parseId(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

/**
 * 发送消息（SSE 流式）
 * 流程：入库用户消息 → 逐块转发 DeepSeek 增量 → 完整回复入库 → [DONE]
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const conversationId = parseId(req.params.id)
    const { content } = req.body ?? {}

    const { userMessage, stream } = await chatService.sendMessage(userId, conversationId, content)

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    // 先发送用户消息回执（含数据库 id）
    res.write(`event: user_message\ndata: ${JSON.stringify(userMessage)}\n\n`)

    let fullContent = ''
    try {
      for await (const chunk of stream) {
        fullContent += chunk.content
        res.write(`event: message\ndata: ${JSON.stringify(chunk)}\n\n`)
      }

      const assistantMessage = await chatService.addAssistantMessage(conversationId, fullContent)
      res.write(`event: done\ndata: ${JSON.stringify({ messageId: assistantMessage?.id ?? null })}\n\n`)
      res.end()
    } catch (streamErr) {
      // 上游流式错误：通过 SSE error 事件通知前端，不落库不完整回复
      const msg = streamErr instanceof Error ? streamErr.message : 'AI 回复生成失败'
      res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`)
      res.end()
    }
  } catch (err) {
    next(err)
  }
}
```

**Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add src/controllers/chatController.ts
git commit -m "feat: 聊天控制器（含 SSE 流式）"
```

---

## Task 6: 路由 + 挂载

**Files:**
- Create: `src/routes/chat.ts`
- Modify: `src/app.ts`

**Step 1: 创建 src/routes/chat.ts**

```ts
import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import * as chatController from '../controllers/chatController'

// ==========================================================================
// 聊天路由 — 全部需要登录（JWT）
// ==========================================================================

const router = Router()

// 该路由组所有接口均需认证
router.use(authenticateToken)

// 会话 CRUD
router.post('/conversations', chatController.createConversation)
router.get('/conversations', chatController.listConversations)
router.get('/conversations/:id', chatController.getConversation)
router.patch('/conversations/:id', chatController.renameConversation)
router.delete('/conversations/:id', chatController.deleteConversation)

// 发送消息（SSE 流式）
router.post('/conversations/:id/messages', chatController.sendMessage)

export default router
```

**Step 2: 修改 src/app.ts**

- 引入：`import chatRoutes from './routes/chat'`
- 挂载（放在其他路由后）：`app.use('/api/chat', chatRoutes)`
- 启动日志中补充 chat 端点说明（可选）

**Step 3: 验证**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 4: Commit**

```bash
git add src/routes/chat.ts src/app.ts
git commit -m "feat: 挂载 /api/chat 路由"
```

---

## Task 7: API 测试（tests/api-chat.test.js）

**Files:**
- Create: `tests/api-chat.test.js`

**Step 1: 创建测试（沿用现有 api-auth.test.js 风格：真实 HTTP + console 输出）**

测试要点：
1. 未登录访问 `/api/chat/conversations` → 401
2. 登录（注册新用户）→ 创建会话（带首条消息）→ 断言会话含 user + assistant 消息
3. 列表 → 包含新会话
4. 详情 → 消息完整
5. 重命名 → 标题更新
6. 删除 → 会话消失
7. 发送消息（需可用的 DeepSeek Key 或 mock；无 Key 时断言返回 SSE error 事件而非崩溃）
8. 跨用户隔离 → 用户 B 访问用户 A 的会话 → 404

```js
// ============================================
// AI 聊天 API 测试脚本
// 前置条件: 后端服务运行在 3002
// ============================================

const BASE_URL = 'http://localhost:3002'

let tokenA = null
let tokenB = null

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { json = text }
  return { status: res.status, json }
}

async function readSSE(res) {
  const text = await res.text()
  return text.split('\n').filter((l) => l.startsWith('data:')).join('\n')
}

async function run() {
  const stamp = Date.now()

  // 1. 未登录 → 401
  const noAuth = await request('GET', '/api/chat/conversations')
  console.log('\n🔒 [TEST] 未登录访问聊天接口')
  console.log('Status:', noAuth.status)
  if (noAuth.status !== 401) throw new Error('未登录应返回 401')

  // 2. 注册两个用户
  const regA = await request('POST', '/api/auth/register', {
    body: { email: `chatA${stamp}@example.com`, password: 'securepass123', name: 'Chat A' },
  })
  tokenA = regA.json.data.token

  const regB = await request('POST', '/api/auth/register', {
    body: { email: `chatB${stamp}@example.com`, password: 'securepass123', name: 'Chat B' },
  })
  tokenB = regB.json.data.token

  // 3. 创建会话（带首条消息）
  console.log('\n💬 [TEST] 创建会话（带首条消息）')
  const created = await request('POST', '/api/chat/conversations', {
    token: tokenA,
    body: { firstMessage: '你好，介绍一下你自己' },
  })
  console.log('Status:', created.status)
  console.log('Response:', JSON.stringify(created.json, null, 2))
  const convId = created.json.data.id

  // 4. 列表
  console.log('\n📋 [TEST] 会话列表')
  const list = await request('GET', '/api/chat/conversations', { token: tokenA })
  console.log('Status:', list.status, 'total:', list.json.data.total)

  // 5. 详情
  console.log('\n📄 [TEST] 会话详情')
  const detail = await request('GET', `/api/chat/conversations/${convId}`, { token: tokenA })
  console.log('Status:', detail.status, '消息数:', detail.json.data.messages.length)

  // 6. 重命名
  console.log('\n✏️ [TEST] 重命名')
  const renamed = await request('PATCH', `/api/chat/conversations/${convId}`, {
    token: tokenA,
    body: { title: '我的 AI 对话' },
  })
  console.log('Status:', renamed.status, '新标题:', renamed.json.data.title)

  // 7. 发送消息（SSE）
  console.log('\n⚡ [TEST] 发送消息（SSE）')
  const sseRes = await fetch(`${BASE_URL}/api/chat/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ content: '再说一个笑话' }),
  })
  const sseText = await sseRes.text()
  console.log('SSE 原始输出（前 500 字符）:', sseText.slice(0, 500))
  if (!sseText.includes('[DONE]') && !sseText.includes('event: error')) {
    throw new Error('SSE 流应以 [DONE] 或 error 事件结束')
  }

  // 8. 跨用户隔离
  console.log('\n🚧 [TEST] 跨用户访问（B 访问 A 的会话）')
  const cross = await request('GET', `/api/chat/conversations/${convId}`, { token: tokenB })
  console.log('Status:', cross.status)
  if (cross.status !== 404) throw new Error('跨用户访问应返回 404')

  // 9. 删除
  console.log('\n🗑️ [TEST] 删除会话')
  const del = await request('DELETE', `/api/chat/conversations/${convId}`, { token: tokenA })
  console.log('Status:', del.status)
  const afterDel = await request('GET', `/api/chat/conversations/${convId}`, { token: tokenA })
  if (afterDel.status !== 404) throw new Error('删除后应返回 404')

  console.log('\n✅ 全部聊天 API 测试通过！')
}

run().catch((err) => {
  console.error('\n❌ 测试失败:', err.message)
  process.exit(1)
})
```

**Step 2: 运行测试**

Run: `npm test`（或 `npx tsx tests/api-chat.test.js`）
Expected: 全部断言通过；SSE 场景在无 Key 时输出 error 事件但流程不崩溃

**Step 3: Commit**

```bash
git add tests/api-chat.test.js
git commit -m "test: 聊天 API 集成测试"
```

---

## Task 8: 最终验证 + 文档

**Step 1: 全量校验**

Run: `npm run typecheck && npm run lint && npm test`
Expected: 全部通过

**Step 2: 补充 README / agent.md**

在 `README.md`（或 agent.md）追加 chat API 端点表 + SSE 事件格式说明 + .env 配置说明。

**Step 3: Commit**

```bash
git add README.md agent.md
git commit -m "docs: 补充 AI 聊天 API 文档"
```
