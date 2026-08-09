# 聊天模块接口文档与前端调试指南 (Chat)

> 基础路径前缀：`/api/chat`
>
> 功能：AI 聊天会话管理（会话 CRUD + 消息持久化 + DeepSeek SSE 流式回复）。
> 本文档同时面向**前端开发者**，包含调试流程、SSE 协议说明与常见问题排查。

---

## 1. 环境准备

### 1.1 服务地址

| 项 | 值 |
| --- | --- |
| 本地地址 | `http://localhost:3002` |
| 局域网地址 | `http://192.168.5.144:3002`（台式机，可在局域网内访问） |
| 运行方式 | `npm run dev`（tsx watch，改代码自动重启） |

### 1.2 鉴权要求

**本模块所有接口都需要登录**，请求头必须携带：

```
Authorization: Bearer <token>
```

Token 获取方式：`POST /api/auth/register`（注册）或 `POST /api/auth/login`（登录），返回 `data.token`。

> ⚠️ 未携带或携带无效 Token 时返回 `401`（缺少令牌）或 `403`（令牌无效/过期）。

### 1.3 环境变量（影响聊天功能）

| 变量 | 说明 | 当前状态 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | DeepSeek 平台 / 商汤代理 API Key，必填才能收到真实 AI 回复 | ✅ **已配置**（商汤） |
| `DEEPSEEK_BASE_URL` | API 地址，当前用商汤 `https://token.sensenova.cn/v1` | ✅ 已就绪 |
| `DEEPSEEK_MODEL` | 模型名，当前 `deepseek-v4-flash`（商汤端点） | ✅ 已就绪 |

> ✅ 当前环境已配置商汤日日新代理端点，可收到**真实 AI 回复**（2026-08-09 端到端验证通过）。若改用官方端点：`DEEPSEEK_BASE_URL=https://api.deepseek.com`、`DEEPSEEK_MODEL=deepseek-chat`。

---

## 2. 接口总览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/chat/conversations` | 创建会话（可带 `firstMessage`，自动生成标题） |
| GET | `/api/chat/conversations` | 会话列表（分页，按更新时间倒序） |
| GET | `/api/chat/conversations/:id` | 会话详情（含全部消息） |
| PATCH | `/api/chat/conversations/:id` | 重命名会话 |
| DELETE | `/api/chat/conversations/:id` | 删除会话（级联删除消息） |
| POST | `/api/chat/conversations/:id/messages` | **发送消息（SSE 流式返回）** |

---

## 3. 接口详细说明

### 3.1 POST /api/chat/conversations

**功能**：创建会话

**请求参数 (Request Body)**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 否 | 会话标题，默认 `"新对话"` |
| firstMessage | string | 否 | 首条用户消息；传入则自动入库该消息，并用其前 20 字生成标题 |

**请求示例**

```json
{
  "firstMessage": "你好，介绍一下你自己"
}
```

**响应示例 — 成功 (201)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "你好，介绍一下你自己",
    "userId": 1,
    "createdAt": "2026-08-09T10:54:31.000Z",
    "updatedAt": "2026-08-09T10:54:31.000Z",
    "messages": [
      {
        "id": 1,
        "conversationId": 1,
        "role": "user",
        "content": "你好，介绍一下你自己",
        "createdAt": "2026-08-09T10:54:31.000Z"
      }
    ]
  }
}
```

> 说明：创建会话时**不会调用 AI**（为控制成本），`messages` 中只包含用户消息。AI 回复只发生在发送消息接口（§3.6）。

**失败 (400)** — 首条消息为空串等校验错误

```json
{ "success": false, "message": "消息内容不能为空" }
```

---

### 3.2 GET /api/chat/conversations

**功能**：会话列表（分页）

**请求参数 (Query)**

| 字段 | 类型 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量，最大 100 |

**响应示例 — 成功 (200)**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "你好，介绍一下你自己",
        "messageCount": 3,
        "createdAt": "2026-08-09T10:54:31.000Z",
        "updatedAt": "2026-08-09T10:56:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

> ⚠️ **分页格式注意**：聊天列表返回 `{ list, total, page, pageSize }`，与文章/分类/标签的 `{ items, pagination }` **不一致**（历史遗留风格差异）。前端取数时请勿照抄旧接口处理。

---

### 3.3 GET /api/chat/conversations/:id

**功能**：会话详情（含全部消息，按创建时间正序）

**响应示例 — 成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "你好，介绍一下你自己",
    "messages": [
      { "id": 1, "conversationId": 1, "role": "user", "content": "你好", "createdAt": "..." },
      { "id": 2, "conversationId": 1, "role": "assistant", "content": "你好！我是 AI 助手。", "createdAt": "..." }
    ]
  }
}
```

**失败 (404)** — 会话不存在，或**不属于当前用户**

```json
{ "success": false, "message": "会话不存在" }
```

> 🔐 安全设计：跨用户访问返回 `404`（而非 403），不泄露资源存在性。前端遇到 404 应视为"会话不存在或无权访问"。

---

### 3.4 PATCH /api/chat/conversations/:id

**功能**：重命名会话

**请求参数 (Request Body)**

```json
{ "title": "我的 AI 对话" }
```

**响应示例 — 成功 (200)**

```json
{
  "success": true,
  "data": { "id": 1, "title": "我的 AI 对话", "updatedAt": "..." }
}
```

**失败 (400)** — 标题为空 / **(404)** — 会话不存在或非本人

---

### 3.5 DELETE /api/chat/conversations/:id

**功能**：删除会话（级联删除其全部消息）

**响应示例 — 成功 (204)**

```text
HTTP 204 No Content（无响应体）
```

**失败 (404)** — 会话不存在或非本人

---

### 3.6 POST /api/chat/conversations/:id/messages

**功能**：发送消息，**SSE 流式返回** AI 回复

**请求参数 (Request Body)**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| content | string | 是 | 消息内容，去空后 1~4000 字符 |

**请求示例**

```bash
curl -N -X POST http://localhost:3002/api/chat/conversations/1/messages \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"content":"你好，讲个笑话"}'
```

> 虽然本接口返回 SSE，但请求本身仍是 `POST` + JSON Body。

---

## 4. SSE 流式协议（前端重点）

### 4.1 事件格式

服务端以 `text/event-stream` 输出，共 **4 种事件**：

| 事件名 | 时机 | data 内容 | 前端用途 |
| --- | --- | --- | --- |
| `user_message` | 用户消息入库后，最先发送 | 用户消息完整对象（含 id） | 用服务端返回的 id 刷新消息气泡 |
| `message` | AI 回复每个增量块 | `{ "id": "...", "content": "增量文本" }` | 追加到气泡，实现打字机效果 |
| `done` | 完整回复入库后 | `{ "messageId": 123 }` | 标记回复结束，可停止 loading |
| `error` | 上游出错（如未配 Key） | `{ "message": "错误说明" }` | 展示错误态，提示重试 |

**完整输出示例**

```text
event: user_message
data: {"id":2,"conversationId":1,"role":"user","content":"你好，讲个笑话","createdAt":"2026-08-09T10:54:31.193Z"}

event: message
data: {"id":"chatcmpl-xxxx","content":"当然可以！"}

event: message
data: {"id":"chatcmpl-xxxx","content":"从前有只兔子..."}

event: done
data: {"messageId":3}

```

### 4.2 前端消费方式（重要）

> ⚠️ **不要用 EventSource**：浏览器 `EventSource` 只支持 GET 请求，而本接口是 POST。请使用 **`fetch` 读取响应流**：

```js
// 示例：前端消费 SSE 流
async function sendMessage(conversationId, content, token, handlers) {
  const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  })

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // 按空行切分事件块
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      let event = 'message' // 无 event 行时默认 message
      let data = ''
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        if (line.startsWith('data:')) data += line.slice(5).trim()
      }
      if (!data) continue

      if (event === 'user_message') handlers.onUserMessage(JSON.parse(data))
      else if (event === 'message') handlers.onDelta(JSON.parse(data))
      else if (event === 'done') handlers.onDone(JSON.parse(data))
      else if (event === 'error') handlers.onError(JSON.parse(data))
    }
  }
}
```

### 4.3 无 API Key 时的预期输出（降级行为）

正常情况下（已配置 Key）发送消息会收到 `message` 增量 + `done` 收尾。**若 `DEEPSEEK_API_KEY` 未配置或 Key 无效**，发送消息会得到：

```text
event: user_message
data: {"id":2,"conversationId":1,"role":"user","content":"...","createdAt":"..."}

event: error
data: {"message":"服务端未配置 DEEPSEEK_API_KEY，请先在 .env 中配置"}
```

**前端处理建议**：收到 `error` 事件 → 隐藏"正在输入"状态 → 保留用户消息 → 气泡内展示错误提示 + 重试按钮。

### 4.4 数据一致性约定

- 用户消息：**发送请求时立即入库**，通过 `user_message` 事件返回服务端 id。
- AI 回复：**流结束后才入库**（不完整回复不入库），通过 `done` 事件的 `messageId` 得知已落库。
- 因此刷新页面后，历史记录中的 AI 回复都是完整内容，不会出现半截。

---

## 5. 典型调试链路（curl 全流程）

```bash
# Step 1: 注册用户，拿到 token（或直接用已有账号登录）
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"debug1@test.com","password":"123456","name":"debug"}'
# 记下返回的 data.token，下文用 <TOKEN> 代替

# Step 2: 创建会话（带首条消息）
curl -X POST http://localhost:3002/api/chat/conversations \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"firstMessage":"你好"}'
# 记下返回的 data.id，下文用 <CONV_ID> 代替

# Step 3: 会话列表
curl http://localhost:3002/api/chat/conversations \
  -H "Authorization: Bearer <TOKEN>"

# Step 4: 会话详情
curl http://localhost:3002/api/chat/conversations/<CONV_ID> \
  -H "Authorization: Bearer <TOKEN>"

# Step 5: 重命名
curl -X PATCH http://localhost:3002/api/chat/conversations/<CONV_ID> \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"title":"调试会话"}'

# Step 6: 发送消息（观察 SSE 流；正常应收到 message 增量 + done）
curl -N -X POST http://localhost:3002/api/chat/conversations/<CONV_ID>/messages \
  -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"content":"再聊两句"}'

# Step 7: 删除会话
curl -X DELETE http://localhost:3002/api/chat/conversations/<CONV_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

> 可直接参考 `tests/api-chat.test.js` —— 它演示了与上面相同的完整调用链（注册→建会话→列表→详情→重命名→SSE→跨用户隔离→删除），是前端对接的"活文档"。

---

## 6. 常见问题排查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 所有请求返回 401/403 | 未带 Token / Token 过期 | 先调用 register 或 login 获取 token，请求头加 `Authorization: Bearer <token>` |
| 发送消息只收到 `user_message` + `error` | 服务端未配置 `DEEPSEEK_API_KEY` | 在 `node-practice-backend/.env` 填入 Key 并重启服务；前端按失败态兜底 |
| EventSource 报错 / 无法建立连接 | 本接口是 POST，EventSource 仅支持 GET | 改用 `fetch` + `res.body.getReader()` 消费流（见 §4.2 示例代码） |
| 访问他人会话返回 404 | 安全设计（不泄露资源存在性） | 前端视为"会话不存在或无权访问"，可清理本地缓存状态 |
| 聊天列表取不到 `items` 字段 | 聊天分页格式为 `{ list, total, page, pageSize }` | 与文章/分类/标签的 `{ items, pagination }` 区分处理 |
| 中文回复乱码 | 响应流解码错误 | 消费流时使用 `TextDecoder` 且保持 `{ stream: true }`（见 §4.2） |

---

## 7. 相关文件索引

| 文件 | 作用 |
| --- | --- |
| `README.md`（项目根） | 接口速览 + SSE 事件格式 + 环境变量 |
| `agent.md` | 项目上下文：数据模型、架构、环境变量 |
| `docs/plans/2026-08-09-ai-chat-backend-design.md` | 设计文档：架构、成本控制策略 |
| `docs/plans/2026-08-09-ai-chat-backend-implementation.md` | 实施计划：每个接口的精确行为 |
| `tests/api-chat.test.js` | 集成测试（可执行的真实调用链示例） |
| `src/services/chatService.ts` | 业务逻辑源码（分页、校验、上下文组装） |
| `src/services/deepseekService.ts` | DeepSeek 流式调用源码（SSE 解析） |
