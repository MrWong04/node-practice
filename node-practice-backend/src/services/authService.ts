import { prisma } from '../../prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors'
import { SALT_ROUNDS, JWT_SECRET } from '../config'
import { JwtPayload } from '../middleware/auth'

// ==========================================================================
// 认证 Service（业务逻辑层）
// ==========================================================================
// 你可以把 Service 类比成 Vue 3 项目里的 "api 请求封装文件" 或 "Pinia Store 中的 actions"。
// 它的职责是：只关心"业务逻辑"（怎么校验、怎么操作数据库、怎么返回数据），
// 不关心 HTTP 请求长什么样、响应格式怎么拼。这些交给 Controller 处理。
// ==========================================================================

/**
 * 生成 JWT 令牌
 * 相当于 Vue 前端里的 `generateToken` 工具函数——但这里是服务端调用
 * 原理：把用户 ID 和邮箱"签名"进一个字符串里，客户端拿着这个字符串就能证明"我是我"
 * 参数：userId（用户数据库 ID）、email（用户邮箱）
 * 返回：一个长字符串（如 eyJhbGciOiJIUzI1NiIs...），前端会存到 localStorage 里
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * 用户注册
 * 像前端调用 `/api/auth/register` 后，后端实际执行的"逻辑函数"。
 * 步骤拆解：
 * 1. 检查前端传的邮箱/密码是否合法（长度校验，类比前端表单 rules）
 * 2. 查数据库看邮箱是否已存在（类比前端查重，但这里查的是 MySQL）
 * 3. 用 bcrypt 把密码"加密"（变成不可读的字符串，防止数据库泄露后暴露原始密码）
 * 4. 把用户信息写入数据库（`prisma.user.create` 类似前端调用 `axios.post('/users')`）
 * 5. 生成 JWT 令牌并返回
 * 参数：email, password, name（来自前端表单）
 * 返回：{ user: { id, email, name, createdAt }, token: string }
 * 如果出错：直接抛出错误（如 `ValidationError`、`ConflictError`），Controller 会 catch 并统一返回给前端
 */
export async function registerUser(email: string, password: string, name?: string) {
  if (!email || !password) {
    throw new ValidationError('邮箱和密码为必填项')
  }
  if (password.length < 6) {
    throw new ValidationError('密码长度至少为6个字符')
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new ConflictError('邮箱已被注册')
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  const token = generateToken({ userId: newUser.id, email: newUser.email })
  return { user: newUser, token }
}

/**
 * 用户登录
 * 类比前端：用户提交表单后，后端验证"账号密码对不对"，然后给一张"通行证"（token）。
 * 步骤拆解：
 * 1. 检查必填参数
 * 2. 根据邮箱查数据库，找到对应用户（类似前端 `getUserByEmail`）
 * 3. 用 bcrypt 比较"用户输入的密码"和"数据库里存的加密密码"是否一致
 * 4. 生成 token 返回
 * 参数：email, password
 * 返回：{ user: { id, email, name }, token: string }
 */
export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new ValidationError('邮箱和密码为必填项')
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new UnauthorizedError('邮箱或密码不正确')
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    throw new UnauthorizedError('邮箱或密码不正确')
  }

  const token = generateToken({ userId: user.id, email: user.email })
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  }
}

/**
 * 根据 ID 获取用户信息
 * 对应前端接口：`GET /api/auth/me`
 * 用途：前端刷新页面后，拿着 token 里的 userId 来查用户详情，显示"当前登录用户"信息。
 * 参数：userId（从 JWT 解码出来的数字）
 * 返回：{ id, email, name, createdAt }
 */
export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  if (!user) {
    throw new UnauthorizedError('用户不存在')
  }
  return user
}
