系统通过 JWT（JSON Web Token）机制将 Token 转化为个人数据，整个流程分为**生成**和**验证**两个阶段：

### **1. 生成 Token（登录/注册时）**

在 `src/middleware/auth.ts` 中，`generateToken()` 函数使用用户的基础信息创建 JWT：

```ts
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

```

当用户登录或注册成功时，`src/app.ts` 调用此方法，将**用户ID**和**邮箱**写入 Token：

```ts
const token = generateToken({ userId: user.id, email: user.email })

```

此时 Token 只包含最小化的身份信息（`userId`、`email`），**不包含**完整的个人数据（如用户名、创建时间等）。

---

### **2. 验证 Token 并转化为个人数据（后续请求）**

在受保护的路由（如 `GET /api/auth/me`）中，请求头需携带：

```
Authorization: Bearer <token>

```

`authenticateToken` 中间件执行以下步骤：

1. **提取 Token**：从请求头中分割出 `Bearer` 后的字符串
2. **验证签名**：调用 `jwt.verify(token, JWT_SECRET, ...)` 验证 Token 是否有效、是否过期
3. **挂载到请求对象**：验证通过后，将解码后的 payload（即 `{ userId, email }`）赋值给 `req.user`

```ts
req.user = decoded as JwtPayload
next()

```

1. **查询数据库获取完整数据**：在后续路由处理中，使用 `req.user.userId` 向数据库查询完整的个人资料：

```ts
const user = await prisma.user.findUnique({
  where: { id: req.user!.userId },
  select: { id: true, email: true, name: true, createdAt: true },
})

```

---

### **总结**


| 步骤     | 操作                         | 数据内容                   |
| ------ | -------------------------- | ---------------------- |
| **生成** | `jwt.sign()`               | 仅写入 `userId` + `email` |
| **传输** | `Authorization: Bearer`    | 客户端携带 Token            |
| **验证** | `jwt.verify()`             | 还原出 `userId` + `email` |
| **转化** | `prisma.user.findUnique()` | 用 `userId` 查询完整个人信息    |


**核心设计**：Token 本身只存"用户标识"，不存敏感或个人数据；完整数据始终通过标识符从数据库实时查询，确保数据最新且可控。