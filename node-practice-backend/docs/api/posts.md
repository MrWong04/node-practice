# 文章模块接口文档 (Posts)

> 基础路径前缀：`/api/posts`
>
> 提供文章列表浏览（公开）及创建、更新、删除（需登录）。
> 每篇文章可关联一个分类和多个标签。
> 所有接口返回的文章对象结构统一（见下方「文章对象」说明）。

### 文章对象（Post）

| 字段        | 类型     | 说明                                      |
| ----------- | -------- | ----------------------------------------- |
| id          | integer  | 文章 ID                                   |
| title       | string   | 标题                                      |
| description | string   | 摘要（可选）                              |
| content     | string   | 正文                                      |
| author      | string   | 作者标识（一般为作者邮箱）                |
| authorId    | integer  | 作者用户 ID（可为 null）                  |
| authorName  | string   | 作者显示名（优先取 user.name，否则 author） |
| createdAt   | string   | 创建时间（ISO 8601）                      |
| updatedAt   | string   | 更新时间（ISO 8601）                      |
| user        | object   | 作者用户信息（可为 null）                 |
| category    | object   | 分类信息（可为 null）                     |
| tags        | array    | 标签数组（扁平结构，非嵌套 `tag` 对象）   |

---

## GET /api/posts

**功能**：获取文章列表（支持筛选与分页）

**权限**：公开

### 查询参数 (Query Parameters)

| 字段       | 类型    | 必填 | 说明                               |
| ---------- | ------- | ---- | ---------------------------------- |
| keyword    | string  | 否   | 关键词，模糊匹配标题和描述         |
| categoryId | integer | 否   | 按分类 ID 筛选                     |
| tagId      | integer | 否   | 按标签 ID 筛选                     |
| page       | integer | 否   | 页码，默认 `1`                     |
| pageSize   | integer | 否   | 每页条数，默认 `10`，最大 `100`    |

### 请求示例

```
GET /api/posts?keyword=Vue&categoryId=1&page=1&pageSize=10
```

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Hello World",
        "description": "My first post",
        "content": "This is my first post.",
        "author": "alice@example.com",
        "authorId": 1,
        "authorName": "Alice",
        "createdAt": "2026-06-11T08:00:00.000Z",
        "updatedAt": "2026-06-11T08:00:00.000Z",
        "user": {
          "id": 1,
          "name": "Alice",
          "email": "alice@example.com"
        },
        "category": {
          "id": 1,
          "name": "技术",
          "slug": "ji-shu"
        },
        "tags": [
          {
            "id": 1,
            "name": "JavaScript",
            "slug": "javascript"
          },
          {
            "id": 2,
            "name": "Vue",
            "slug": "vue"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**失败 (400)** — 分页参数无效

```json
{
  "success": false,
  "message": "page 必须为正整数"
}
```

**失败 (400)** — 筛选参数类型错误

```json
{
  "success": false,
  "message": "categoryId 必须为整数"
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
    "description": "My first post",
    "content": "This is my first post.",
    "author": "alice@example.com",
    "authorId": 1,
    "authorName": "Alice",
    "createdAt": "2026-06-11T08:00:00.000Z",
    "updatedAt": "2026-06-11T08:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    },
    "category": {
      "id": 1,
      "name": "技术",
      "slug": "ji-shu"
    },
    "tags": [
      {
        "id": 1,
        "name": "JavaScript",
        "slug": "javascript"
      }
    ]
  }
}
```

**失败 (404)** — 文章不存在

```json
{
  "success": false,
  "message": "文章不存在"
}
```

---

## POST /api/posts

**功能**：创建新文章（支持分类和标签）

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 请求参数 (Request Body)

| 字段        | 类型     | 必填 | 说明                           |
| ----------- | -------- | ---- | ------------------------------ |
| title       | string   | 是   | 文章标题                       |
| content     | string   | 是   | 文章内容                       |
| description | string   | 否   | 文章描述                       |
| categoryId  | integer  | 否   | 分类 ID（指定文章所属分类）    |
| tagIds      | number[] | 否   | 标签 ID 数组（为文章添加标签） |

### 请求示例

```json
{
  "title": "New Post",
  "content": "This is the content.",
  "description": "A description",
  "categoryId": 1,
  "tagIds": [1, 2]
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
    "description": "A description",
    "content": "This is the content.",
    "author": "alice@example.com",
    "authorId": 1,
    "authorName": "Alice",
    "createdAt": "2026-06-11T08:00:00.000Z",
    "updatedAt": "2026-06-11T08:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    },
    "category": {
      "id": 1,
      "name": "技术",
      "slug": "ji-shu"
    },
    "tags": [
      {
        "id": 1,
        "name": "JavaScript",
        "slug": "javascript"
      },
      {
        "id": 2,
        "name": "Vue",
        "slug": "vue"
      }
    ]
  }
}
```

**失败 (400)** — 缺少标题或内容

```json
{
  "success": false,
  "message": "标题和内容为必填项"
}
```

---

## PUT /api/posts/:id

**功能**：更新文章（支持修改分类和标签）

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 文章 ID |

### 请求参数 (Request Body)

| 字段        | 类型     | 必填 | 说明                           |
| ----------- | -------- | ---- | ------------------------------ |
| title       | string   | 否   | 文章标题（不传则不更新）       |
| content     | string   | 否   | 文章内容（不传则不更新）       |
| description | string   | 否   | 文章描述（不传则不更新）       |
| categoryId  | integer  | 否   | 分类 ID（传 null 则移除分类）  |
| tagIds      | number[] | 否   | 标签 ID 数组（会替换原有标签） |

### 请求示例

```json
{
  "title": "Updated Title",
  "categoryId": 2,
  "tagIds": [3, 4]
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
    "description": "My first post",
    "content": "This is the content.",
    "author": "alice@example.com",
    "authorId": 1,
    "authorName": "Alice",
    "createdAt": "2026-06-11T08:00:00.000Z",
    "updatedAt": "2026-06-11T09:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    },
    "category": {
      "id": 2,
      "name": "生活",
      "slug": "sheng-huo"
    },
    "tags": [
      {
        "id": 3,
        "name": "React",
        "slug": "react"
      }
    ]
  }
}
```

**失败 (404)** — 文章不存在

```json
{
  "success": false,
  "message": "文章不存在"
}
```

**失败 (403)** — 无权更新他人文章

```json
{
  "success": false,
  "message": "只能更新自己的文章"
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
    "description": "My first post",
    "content": "This is my first post.",
    "author": "alice@example.com",
    "authorId": 1,
    "authorName": "Alice",
    "createdAt": "2026-06-11T08:00:00.000Z",
    "updatedAt": "2026-06-11T08:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    },
    "category": {
      "id": 1,
      "name": "技术",
      "slug": "ji-shu"
    },
    "tags": []
  }
}
```

**失败 (404)** — 文章不存在

```json
{
  "success": false,
  "message": "文章不存在"
}
```

**失败 (403)** — 无权删除他人文章

```json
{
  "success": false,
  "message": "只能删除自己的文章"
}
```
