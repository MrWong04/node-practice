const express = require('express');
const app = express();
const PORT = 3000;

// 内存中的文章数据（第二阶段会替换为数据库）
let posts = [
  { id: 1, title: 'Hello Node.js', content: 'This is my first post', author: 'Alice' },
  { id: 2, title: 'Learning Express', content: 'Express is a minimal web framework', author: 'Bob' },
];
let nextId = 3;

// 中间件：解析 JSON 请求体
app.use(express.json());

// 中间件：记录请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// 路由：文章 CRUD
// ============================================

// 获取所有文章
app.get('/api/posts', (req, res) => {
  res.json({ success: true, data: posts });
});

// 获取单篇文章
app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  res.json({ success: true, data: post });
});

// 创建文章
app.post('/api/posts', (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  const newPost = {
    id: nextId++,
    title,
    content,
    author: author || 'Anonymous',
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  res.status(201).json({ success: true, data: newPost });
});

// 更新文章
app.put('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  const { title, content, author } = req.body;
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  if (author !== undefined) post.author = author;
  post.updatedAt = new Date().toISOString();
  res.json({ success: true, data: post });
});

// 删除文章
app.delete('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Post not found' });
  }
  const deleted = posts.splice(index, 1)[0];
  res.json({ success: true, data: deleted });
});

// ============================================
// 统一错误处理中间件
// ============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Express server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET    http://localhost:${PORT}/api/posts`);
  console.log(`  GET    http://localhost:${PORT}/api/posts/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/posts`);
  console.log(`  PUT    http://localhost:${PORT}/api/posts/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/posts/:id`);
});
