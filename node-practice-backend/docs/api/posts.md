# 文章模块接口文档 (Posts)

> 基础路径前缀：`/api/posts`
>
> 提供文章列表浏览（公开）及创建、更新、删除（需登录）。

---

## GET /api/posts

**功能**：获取所有文章列表

**权限**：公开

### 请求参数

无。

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Hello World",
      "content": "This is my first post.",
      "createdAt": "2026-06-11T08:00:00.000Z",
      "user": {
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com"
      }
    }
  ]
}
```

---

## GET /api/posts/:id

**功能**：获取单篇文章详情

**权限**：公开

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 文章 ID |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Hello World",
    "content": "This is my first post.",
    "createdAt": "2026-06-11T08:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
}
```

**失败 (404)** — 文章不存在

```json
{
  "success": false,
  "message": "Post not found"
}
```

---

## POST /api/posts

**功能**：创建新文章

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 请求参数 (Request Body)

| 字段    | 类型   | 必填 | 说明     |
| ------- | ------ | ---- | -------- |
| title   | string | 是   | 文章标题 |
| content | string | 是   | 文章内容 |

### 请求示例

```json
{
  "title": "New Post",
  "content": "This is the content."
}
```

### 响应示例

**成功 (201)**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "New Post",
    "content": "This is the content.",
    "author": "alice@example.com",
    "createdAt": "2026-06-11T08:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
}
```

**失败 (400)** — 缺少标题或内容

```json
{
  "success": false,
  "message": "Title and content are required"
}
```

---

## PUT /api/posts/:id

**功能**：更新文章（仅允许更新自己的文章）

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 文章 ID |

### 请求参数 (Request Body)

| 字段    | 类型   | 必填 | 说明                     |
| ------- | ------ | ---- | ------------------------ |
| title   | string | 否   | 文章标题（不传则不更新） |
| content | string | 否   | 文章内容（不传则不更新） |

### 请求示例

```json
{
  "title": "Updated Title"
}
```

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "content": "This is the content.",
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
}
```

**失败 (404)** — 文章不存在

```json
{
  "success": false,
  "message": "Post not found"
}
```

**失败 (403)** — 无权更新他人文章

```json
{
  "success": false,
  "message": "You can only update your own posts"
}
```

---

## DELETE /api/posts/:id

**功能**：删除文章（仅允许删除自己的文章）

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 文章 ID |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Hello World",
    "content": "This is my first post.",
    "authorId": 1,
    "createdAt": "2026-06-11T08:00:00.000Z"
  }
}
```

**失败 (404)** — 文章不存在

```json
{
  "success": false,
  "message": "Post not found"
}
```

**失败 (403)** — 无权删除他人文章

```json
{
  "success": false,
  "message": "You can only delete your own posts"
}
```
