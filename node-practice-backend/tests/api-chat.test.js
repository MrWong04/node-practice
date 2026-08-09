// ============================================
// AI 聊天 API 测试脚本
// 前置条件: 后端服务运行在 3002
// 说明: 无 DEEPSEEK_API_KEY 时，SSE 发送消息会返回 error 事件（流程不崩溃）；
//       配置了 Key 后可验证完整流式回复。
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
  try {
    json = JSON.parse(text)
  } catch {
    json = text
  }
  return { status: res.status, json }
}

function assert(cond, message) {
  if (!cond) throw new Error(`断言失败: ${message}`)
}

async function run() {
  const stamp = Date.now()

  // 1. 未登录 → 401
  console.log('\n🔒 [TEST 1] 未登录访问聊天接口')
  const noAuth = await request('GET', '/api/chat/conversations')
  console.log('Status:', noAuth.status)
  assert(noAuth.status === 401, '未登录应返回 401')

  // 2. 注册两个用户
  console.log('\n👤 [TEST 2] 注册用户 A / B')
  const regA = await request('POST', '/api/auth/register', {
    body: { email: `chatA${stamp}@example.com`, password: 'securepass123', name: 'Chat A' },
  })
  assert(regA.status === 201 && regA.json.success, '用户 A 注册失败')
  tokenA = regA.json.data.token

  const regB = await request('POST', '/api/auth/register', {
    body: { email: `chatB${stamp}@example.com`, password: 'securepass123', name: 'Chat B' },
  })
  assert(regB.status === 201 && regB.json.success, '用户 B 注册失败')
  tokenB = regB.json.data.token
  console.log('A/B 注册成功')

  // 3. 创建会话（带首条消息）→ 标题自动生成
  console.log('\n💬 [TEST 3] 创建会话（带首条消息）')
  const created = await request('POST', '/api/chat/conversations', {
    token: tokenA,
    body: { firstMessage: '你好，介绍一下你自己' },
  })
  console.log('Status:', created.status)
  assert(created.status === 201, '创建会话应返回 201')
  assert(created.json.data.title === '你好，介绍一下你自己', '标题应由首条消息生成')
  assert(created.json.data.messages.length === 1, '会话应包含 1 条用户消息')
  assert(created.json.data.messages[0].role === 'user', '消息角色应为 user')
  const convId = created.json.data.id
  console.log('会话 ID:', convId, '标题:', created.json.data.title, '消息数:', created.json.data.messages.length)

  // 4. 列表
  console.log('\n📋 [TEST 4] 会话列表')
  const list = await request('GET', '/api/chat/conversations', { token: tokenA })
  console.log('Status:', list.status, 'total:', list.json.data.total)
  assert(list.status === 200, '列表应返回 200')
  assert(list.json.data.total >= 1, '列表应至少 1 个会话')
  assert(list.json.data.list.some((c) => c.id === convId), '列表应包含新会话')

  // 5. 详情
  console.log('\n📄 [TEST 5] 会话详情')
  const detail = await request('GET', `/api/chat/conversations/${convId}`, { token: tokenA })
  console.log('Status:', detail.status, '消息数:', detail.json.data.messages.length)
  assert(detail.status === 200, '详情应返回 200')
  assert(detail.json.data.messages.length === 1, '详情消息数应为 1')

  // 6. 重命名
  console.log('\n✏️ [TEST 6] 重命名会话')
  const renamed = await request('PATCH', `/api/chat/conversations/${convId}`, {
    token: tokenA,
    body: { title: '我的 AI 对话' },
  })
  console.log('Status:', renamed.status, '新标题:', renamed.json.data.title)
  assert(renamed.status === 200, '重命名应返回 200')
  assert(renamed.json.data.title === '我的 AI 对话', '标题应更新')

  // 7. 发送消息（SSE）
  console.log('\n⚡ [TEST 7] 发送消息（SSE 流式）')
  const sseRes = await fetch(`${BASE_URL}/api/chat/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ content: '再说一个笑话' }),
  })
  const sseText = await sseRes.text()
  const hasUserMessage = sseText.includes('event: user_message')
  const hasDone = sseText.includes('event: done') || sseText.includes('data: [DONE]')
  const hasError = sseText.includes('event: error')
  console.log('SSE 原始输出（前 600 字符）:')
  console.log(sseText.slice(0, 600))
  assert(sseRes.status === 200, 'SSE 应返回 200')
  assert(hasUserMessage, 'SSE 应先发送 user_message 回执')
  assert(hasDone || hasError, 'SSE 应以 done 或 error 事件结束')

  // 8. 跨用户隔离
  console.log('\n🚧 [TEST 8] 跨用户访问（B 访问 A 的会话）')
  const cross = await request('GET', `/api/chat/conversations/${convId}`, { token: tokenB })
  console.log('Status:', cross.status)
  assert(cross.status === 404, '跨用户访问应返回 404')

  // 9. 删除
  console.log('\n🗑️ [TEST 9] 删除会话')
  const del = await request('DELETE', `/api/chat/conversations/${convId}`, { token: tokenA })
  console.log('Status:', del.status)
  assert(del.status === 204, '删除应返回 204')
  const afterDel = await request('GET', `/api/chat/conversations/${convId}`, { token: tokenA })
  assert(afterDel.status === 404, '删除后应返回 404')

  console.log('\n✅ 全部聊天 API 测试通过！')
}

run().catch((err) => {
  console.error('\n❌ 测试失败:', err.message)
  process.exit(1)
})
