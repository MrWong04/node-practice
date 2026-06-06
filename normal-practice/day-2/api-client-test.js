// ============================================
// Express API 客户端测试脚本
// 用来测试你自己的后端 API（从"调用别人"变成"自己调用自己"）
// ============================================

const BASE_URL = 'http://localhost:3000';

async function testGetAllPosts() {
  console.log('\n📋 [TEST] GET /api/posts - 获取所有文章');
  const res = await fetch(`${BASE_URL}/api/posts`);
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  return data.data;
}

async function testGetPostById(id) {
  console.log(`\n📄 [TEST] GET /api/posts/${id} - 获取单篇文章`);
  const res = await fetch(`${BASE_URL}/api/posts/${id}`);
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

async function testCreatePost() {
  console.log('\n✏️ [TEST] POST /api/posts - 创建新文章');
  const res = await fetch(`${BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '我的第一篇后端文章',
      content: '这是通过 Express API 创建的内容！',
      author: 'VueDeveloper',
    }),
  });
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
  return data.data;
}

async function testUpdatePost(id) {
  console.log(`\n📝 [TEST] PUT /api/posts/${id} - 更新文章`);
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '文章标题已更新',
      content: '内容也被修改了',
    }),
  });
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

async function testDeletePost(id) {
  console.log(`\n🗑️ [TEST] DELETE /api/posts/${id} - 删除文章`);
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

async function testNotFound() {
  console.log('\n❌ [TEST] GET /api/posts/9999 - 测试 404 错误');
  const res = await fetch(`${BASE_URL}/api/posts/9999`);
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

// ============================================
// 运行所有测试
// ============================================
async function runAllTests() {
  console.log('============================================');
  console.log('🚀 Express API 客户端测试');
  console.log('============================================');

  try {
    // 1. 获取所有文章
    const allPosts = await testGetAllPosts();

    // 2. 获取第一篇详情
    if (allPosts.length > 0) {
      await testGetPostById(allPosts[0].id);
    }

    // 3. 创建新文章
    const newPost = await testCreatePost();

    // 4. 更新刚创建的文章
    if (newPost) {
      await testUpdatePost(newPost.id);
    }

    // 5. 再次查看所有文章
    await testGetAllPosts();

    // 6. 测试 404
    await testNotFound();

    // 7. 删除刚创建的文章
    if (newPost) {
      await testDeletePost(newPost.id);
    }

    // 8. 最终查看
    await testGetAllPosts();

    console.log('\n============================================');
    console.log('✅ 所有测试完成！');
    console.log('============================================');
  } catch (err) {
    console.error('\n❌ 测试失败:', err.message);
    console.log('请确保 Express 服务器已启动: node normal-practice/day-2/express-server.js');
  }
}

runAllTests();
