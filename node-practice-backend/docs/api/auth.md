# 认证模块接口文档 (Auth)

> 基础路径前缀：`/api/auth`
>
> 涉及用户注册、登录及 JWT 身份校验。

---

## POST /api/auth/register

**功能**：用户注册

**权限**：公开

### 请求参数 (Request Body)

| 字段     | 类型   | 必填 | 说明              |
| -------- | ------ | ---- | ----------------- |
| email    | string | 是   | 用户邮箱          |
| password | string | 是   | 密码（至少 6 位） |
| name     | string | 否   | 用户昵称          |

### 请求示例

```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Alice"
}
```

### 响应示例

**成功 (201)**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Alice",
      "createdAt": "2026-06-11T08:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**失败 (400)** — 缺少邮箱/密码或密码过短

```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**失败 (409)** — 邮箱已注册

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## POST /api/auth/login

**功能**：用户登录

**权限**：公开

### 请求参数 (Request Body)

| 字段     | 类型   | 必填 | 说明     |
| -------- | ------ | ---- | -------- |
| email    | string | 是   | 用户邮箱 |
| password | string | 是   | 密码     |

### 请求示例

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Alice"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**失败 (401)** — 邮箱或密码错误

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## GET /api/auth/me

**功能**：获取当前登录用户信息

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 请求参数

无 Body 参数。需通过 Header 传入 JWT Token。

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Alice",
    "createdAt": "2026-06-11T08:00:00.000Z"
  }
}
```

**失败 (404)** — 用户不存在

```json
{
  "success": false,
  "message": "User not found"
}
```
