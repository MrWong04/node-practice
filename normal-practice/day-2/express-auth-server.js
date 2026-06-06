const express = require('express');
const bcrypt = require('bcrypt');
const { prisma } = require('../../prisma/client');
const { authenticateToken, generateToken } = require('./middleware/auth');

const app = express();
const PORT = 3002;
const SALT_ROUNDS = 10;

// 中间件
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// 认证路由
// ============================================

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // bcrypt 哈希密码
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    // 生成 JWT
    const token = generateToken({ userId: newUser.id, email: newUser.email });

    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 查找用户（包含密码字段）
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 生成 JWT
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// 获取当前用户信息（受保护路由示例）
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// ============================================
// 文章 CRUD（带认证）
// ============================================

// 获取所有文章（公开）
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ success: true, data: posts });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// 获取单篇文章（公开）
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
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

// 创建文章（需要登录）
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        author: req.user.email,
        user: { connect: { id: req.user.userId } },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// 更新文章（需要登录，且只能更新自己的）
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, content } = req.body;

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // 权限检查：只能更新自己的文章
    if (existing.authorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts',
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ success: false, message: 'Failed to update post' });
  }
});

// 删除文章（需要登录，且只能删除自己的）
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // 权限检查：只能删除自己的文章
    if (existing.authorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    const deletedPost = await prisma.post.delete({ where: { id } });
    res.json({ success: true, data: deletedPost });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
});

// ============================================
// 错误处理
// ============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 启动
app.listen(PORT, () => {
  console.log(`🔐 Auth + Prisma server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Public endpoints:');
  console.log(`  POST   http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
  console.log(`  GET    http://localhost:${PORT}/api/posts`);
  console.log(`  GET    http://localhost:${PORT}/api/posts/:id`);
  console.log('');
  console.log('Protected endpoints (need Authorization header):');
  console.log(`  GET    http://localhost:${PORT}/api/auth/me`);
  console.log(`  POST   http://localhost:${PORT}/api/posts`);
  console.log(`  PUT    http://localhost:${PORT}/api/posts/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/posts/:id`);
});
