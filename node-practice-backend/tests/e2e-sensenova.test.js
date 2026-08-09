// ============================================
// 商汤 DeepSeek 接入端到端验证脚本（一次性）
// ============================================

const BASE = 'http://localhost:3002'
const stamp = Date.now()

async function main() {
  // 1. 注册
  const reg = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `sensenova${stamp}@test.com`, password: '123456', name: 'e2e' }),
  }).then((r) => r.json())
  const token = reg.data.token
  console.log('注册成功')

  // 2. 创建会话
  const conv = await fetch(`${BASE}/api/chat/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ firstMessage: '你好' }),
  }).then((r) => r.json())
  console.log('会话创建成功 id=' + conv.data.id)

  // 3. 发送消息，读取 SSE 流
  const res = await fetch(`${BASE}/api/chat/conversations/${conv.data.id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ content: '用一句话介绍你自己' }),
  })
  const text = await res.text()
  console.log('--- SSE 原始输出 ---')
  console.log(text.slice(0, 2000))
  console.log('--- 结束 ---')

  // 4. 断言
  const hasUserMsg = text.includes('event: user_message')
  const hasDelta = text.includes('event: message')
  const hasDone = text.includes('event: done')
  const hasError = text.includes('event: error')
  console.log('user_message 事件:', hasUserMsg)
  console.log('message 增量事件:', hasDelta)
  console.log('done 事件:', hasDone)
  console.log('error 事件:', hasError)
  if (hasDone && !hasError) console.log('\n真实 AI 回复验证成功！商汤 DeepSeek 已接入')
  else if (hasError) console.log('\n收到 error 事件，请检查 Key 或端点')
  else console.log('\n流未正常结束')

  // 5. 会话详情验证消息已入库
  const detail = await fetch(`${BASE}/api/chat/conversations/${conv.data.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json())
  console.log('会话消息数:', detail.data.messages.length)
  const assistant = detail.data.messages.find((m) => m.role === 'assistant')
  console.log(
    'AI 回复已入库:',
    assistant ? `"${assistant.content.slice(0, 60)}..."` : '未入库'
  )
}

main().catch((e) => {
  console.error('测试异常:', e.message)
  process.exit(1)
})
