// ============================================
// Prisma + SQLite API 客户端测试脚本
// 测试数据库持久化的 CRUD 操作
// ============================================

const BASE_URL = 'http://localhost:3001'

async function testCreateUser() {
  console.log('\n👤 [TEST] POST /api/users - 创建用户')
  const timestamp = Date.now()
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `user${timestamp}@example.com`,
      password: 'plainpassword123',
      name: 'Test User',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
  return data.data
}

async function testGetAllUsers() {
  console.log('\n👥 [TEST] GET /api/users - 获取所有用户')
  const res = await fetch(`${BASE_URL}/api/users`)
  const data = await res.json()
  console.log('Response:', JSON.stringify(data, null, 2))
  return data.data
}

async function testCreatePost() {
  console.log('\n✏️ [TEST] POST /api/posts - 创建文章')
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '我的第一篇 Prisma 文章',
      content: '这篇文章存储在 SQLite 数据库中！',
      author: 'VueDeveloper',
    }),
  })
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
  return data.data
}

async function testGetAllPosts() {
  console.log('\n📋 [TEST] GET /api/posts - 获取所有文章')
  const res = await fetch(`${BASE_URL}/api/posts`)
  const data = await res.json()
  console.log('Response:', JSON.stringify(data, null, 2))
  return data.data
}

async function testGetPostById(id) {
  console.log(`\n📄 [TEST] GET /api/posts/${id} - 获取单篇文章`)
  const res = await fetch(`${BASE_URL}/api/posts/${id}`)
  const data = await res.json()
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testUpdatePost(id) {
  console.log(`\n📝 [TEST] PUT /api/posts/${id} - 更新文章`)
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '文章标题已被 Prisma 更新',
      content: '内容也更新到数据库了',
    }),
  })
  const data = await res.json()
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testNotFound() {
  console.log('\n❌ [TEST] GET /api/posts/99999 - 测试 404 错误')
  const res = await fetch(`${BASE_URL}/api/posts/99999`)
  const data = await res.json()
  console.log('Status:', res.status)
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testDeletePost(id) {
  console.log(`\n🗑️ [TEST] DELETE /api/posts/${id} - 删除文章`)
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    method: 'DELETE',
  })
  const data = await res.json()
  console.log('Response:', JSON.stringify(data, null, 2))
}

async function testDuplicateEmail() {
  console.log('\n🔒 [TEST] POST /api/users - 测试重复邮箱 (409)')
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'same@example.com',
      password: 'password123',
    }),
  })
  const data = await res.json()
  console.log('First create - Status:', res.status)

  // 再次创建相同邮箱
  const res2 = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'same@example.com',
      password: 'password456',
    }),
  })
  const data2 = await res2.json()
  console.log('Duplicate create - Status:', res2.status)
  console.log('Response:', JSON.stringify(data2, null, 2))
}

// ============================================
// 运行所有测试
// ============================================
async function runAllTests() {
  console.log('============================================')
  console.log('🚀 Prisma + SQLite API 客户端测试')
  console.log('============================================')
  console.log('\n💡 注意：数据会持久化到 SQLite 数据库中')
  console.log('   即使重启服务器，数据也不会丢失！')
  console.log('')

  try {
    // 1. 创建用户
    const newUser = await testCreateUser()

    // 2. 获取所有用户
    await testGetAllUsers()

    // 3. 创建文章
    const newPost = await testCreatePost()

    // 4. 获取所有文章
    const allPosts = await testGetAllPosts()

    // 5. 获取单篇文章
    if (newPost) {
      await testGetPostById(newPost.id)
    }

    // 6. 更新文章
    if (newPost) {
      await testUpdatePost(newPost.id)
    }

    // 7. 测试 404
    await testNotFound()

    // 8. 测试重复邮箱
    await testDuplicateEmail()

    // 9. 删除文章（清理测试数据）
    if (newPost) {
      await testDeletePost(newPost.id)
    }

    // 10. 最终查看
    await testGetAllPosts()

    console.log('\n============================================')
    console.log('✅ 所有测试完成！')
    console.log('============================================')
    console.log('\n📊 关键对比：')
    console.log('   • 内存版(express-server.js): 重启后数据丢失')
    console.log('   • Prisma版(express-prisma-server.js): 数据持久化到 SQLite')
    console.log('   • 数据库约束: 重复邮箱返回 409 (P2002 唯一性冲突)')
  } catch (err) {
    console.error('\n❌ 测试失败:', err.message)
    console.log('请确保 Prisma 服务器已启动: node normal-practice/day-2/express-prisma-server.js')
  }
}

runAllTests()
