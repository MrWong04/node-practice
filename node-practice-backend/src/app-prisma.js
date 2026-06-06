const express = require('express');
const { prisma } = require('../prisma/client');

const app = express();
const PORT = 3001;

// 中间件：解析 JSON 请求体
app.use(express.json());

// 中间件：记录请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// 路由：文章 CRUD（Prisma + SQLite）
// ============================================

// 获取所有文章（支持按作者筛选）
app.get('/api/posts', async (req, res) => {
  try {
    const { author } = req.query;
    const where = author ? { author: { contains: author } } : {};
    
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    
    res.json({ success: true, data: posts });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// 获取单篇文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const post = await prisma.post.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.json({ success: true, data: post });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
});

// 创建文章
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        author: author || 'Anonymous',
      },
    });
    
    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// 更新文章
app.put('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content, author } = req.body;
    
    // 检查文章是否存在
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(author !== undefined && { author }),
      },
    });
    
    res.json({ success: true, data: updatedPost });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
});

// 删除文章
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // 检查文章是否存在
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const deletedPost = await prisma.post.delete({
      where: { id },
    });
    
    res.json({ success: true, data: deletedPost });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// ============================================
// 路由：用户 CRUD（为第三阶段认证做准备）
// ============================================

// 获取所有用户
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// 创建用户（明文密码，第三阶段会改为 bcrypt）
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const newUser = await prisma.user.create({
      data: { email, password, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    
    res.status(201).json({ success: true, data: newUser });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    console.error('Create user error:', err);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
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
  console.log(`🚀 Prisma + SQLite server is running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET    http://localhost:${PORT}/api/posts`);
  console.log(`  GET    http://localhost:${PORT}/api/posts/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/posts`);
  console.log(`  PUT    http://localhost:${PORT}/api/posts/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/posts/:id`);
  console.log(`  GET    http://localhost:${PORT}/api/users`);
  console.log(`  POST   http://localhost:${PORT}/api/users`);
});
