// ============================================
// JWT 认证 + Prisma API 客户端测试脚本
// 测试注册/登录/受保护路由的完整流程
// ============================================

const BASE_URL = 'http://localhost:3002'

// 全局存储 Token，模拟前端登录态
let authToken = null
let currentUser = null
let testPostId = null

async function testRegister() {
  console.log('\n📝 [TEST] POST /api/auth/register - 用户注册')
  const timestamp = Date.now()
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `authuser${timestamp}@example.com`,
      password: 'securepass123',
      name: 'Auth Test User',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))

  if (data.success) {
    authToken = data.data.token
    currentUser = data.data.user
  }
  return data.data
}

async function testLogin(email, password) {
  console.log('\n🔑 [TEST] POST /api/auth/login - 用户登录')
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))

  if (data.success) {
    authToken = data.data.token
    currentUser = data.data.user
  }
  return data.data
}

async function testGetMe() {
  console.log('\n👤 [TEST] GET /api/auth/me - 获取当前用户信息（需要 Token）')
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testGetMeWithoutToken() {
  console.log('\n🚫 [TEST] GET /api/auth/me - 未登录访问（应返回 401）')
  const res = await fetch(`${BASE_URL}/api/auth/me`)
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testCreatePostWithAuth() {
  console.log('\n✏️ [TEST] POST /api/posts - 创建文章（已登录）')
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: '我的认证文章',
      content: '这篇文章是通过 JWT 认证后创建的！',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))

  if (data.success) {
    testPostId = data.data.id
  }
  return data.data
}

async function testCreatePostWithoutAuth() {
  console.log('\n🚫 [TEST] POST /api/posts - 未登录创建文章（应返回 401）')
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '未认证文章',
      content: '这篇文章不应该被创建',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testUpdateMyPost() {
  console.log(`\n📝 [TEST] PUT /api/posts/${testPostId} - 更新自己的文章`)
  const res = await fetch(`${BASE_URL}/api/posts/${testPostId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: '我的认证文章（已更新）',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testWrongPassword() {
  console.log('\n❌ [TEST] POST /api/auth/login - 错误密码（应返回 401）')
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: currentUser.email,
      password: 'wrongpassword',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testRegisterDuplicate() {
  console.log('\n🔒 [TEST] POST /api/auth/register - 重复注册（应返回 409）')
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: currentUser.email,
      password: 'anotherpass',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testWeakPassword() {
  console.log('\n⚠️ [TEST] POST /api/auth/register - 弱密码（应返回 400）')
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'weak@example.com',
      password: '123',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testDeleteMyPost() {
  console.log(`\n🗑️ [TEST] DELETE /api/posts/${testPostId} - 删除自己的文章`)
  const res = await fetch(`${BASE_URL}/api/posts/${testPostId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

// ============================================
// 运行所有测试
// ============================================
async function runAllTests() {
  console.log('============================================')
  console.log('🔐 JWT 认证 + Prisma API 客户端测试')
  console.log('============================================')
  console.log('\n💡 测试流程：')
  console.log('   1. 注册 → 获取 JWT Token')
  console.log('   2. 用 Token 访问受保护路由')
  console.log('   3. 验证权限控制（只能操作自己的数据）')
  console.log('   4. 测试各种错误场景')
  console.log('')

  try {
    // 1. 注册
    const registered = await testRegister()

    if (!registered) {
      console.log('\n❌ 注册失败，停止测试')
      return
    }

    // 2. 获取当前用户信息
    await testGetMe()

    // 3. 未登录访问（应失败）
    await testGetMeWithoutToken()

    // 4. 用 Token 创建文章
    await testCreatePostWithAuth()

    // 5. 未登录创建文章（应失败）
    await testCreatePostWithoutAuth()

    // 6. 更新自己的文章
    await testUpdateMyPost()

    // 7. 错误密码登录
    await testWrongPassword()

    // 8. 重复注册
    await testRegisterDuplicate()

    // 9. 弱密码
    await testWeakPassword()

    // 10. 删除自己的文章
    if (testPostId) {
      await testDeleteMyPost()
    }

    // 11. 用旧密码重新登录验证
    await testLogin(currentUser.email, 'securepass123')

    console.log('\n============================================')
    console.log('✅ 所有认证测试完成！')
    console.log('============================================')
    console.log('\n📊 学到的核心概念：')
    console.log('   • bcrypt: 密码哈希（绝不存明文）')
    console.log('   • JWT: 无状态认证（服务端不存 session）')
    console.log('   • Authorization Header: Bearer <token>')
    console.log('   • 中间件: authenticateToken 保护路由')
    console.log('   • 权限控制: 只能 CRUD 自己的资源')
    console.log('')
    console.log('🎯 对应 Vue3 前端：')
    console.log('   • Pinia 存储 token')
    console.log('   • Axios interceptors 自动附加 Authorization')
    console.log('   • 路由守卫判断登录态')
  } catch (err) {
    console.error('\n❌ 测试失败:', err.message)
    console.log('请确保认证服务器已启动: node normal-practice/day-2/express-auth-server.js')
  }
}

runAllTests()
