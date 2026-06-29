# 标签模块接口文档 (Tags)

> 基础路径前缀：`/api/tags`
>
> 提供标签列表浏览（公开）及创建、更新、删除（需登录）。
>
> 同时支持为文章添加/移除标签的功能。

---

## GET /api/tags

**功能**：获取标签列表（支持筛选与分页）

**权限**：公开

### 查询参数 (Query Parameters)

| 字段     | 类型    | 必填 | 说明                            |
| -------- | ------- | ---- | ------------------------------- |
| name     | string  | 否   | 标签名称，模糊匹配              |
| slug     | string  | 否   | 标签 slug，模糊匹配             |
| page     | integer | 否   | 页码，默认 `1`                  |
| pageSize | integer | 否   | 每页条数，默认 `10`，最大 `100` |

### 请求示例

```
GET /api/tags?slug=java&page=1&pageSize=20
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
        "name": "JavaScript",
        "slug": "javascript",
        "createdAt": "2026-06-22T08:00:00.000Z",
        "updatedAt": "2026-06-22T08:00:00.000Z",
        "_count": {
          "postTags": 5
        }
      },
      {
        "id": 2,
        "name": "Vue",
        "slug": "vue",
        "createdAt": "2026-06-22T08:00:00.000Z",
        "updatedAt": "2026-06-22T08:00:00.000Z",
        "_count": {
          "postTags": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 2,
      "totalPages": 1
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

---

## GET /api/tags/:id

**功能**：根据 ID 获取单个标签详情（包含该标签下的文章列表）

**权限**：公开

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 标签 ID |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z",
    "postTags": [
      {
        "post": {
          "id": 1,
          "title": "Hello World",
          "description": "My first post",
          "createdAt": "2026-06-22T08:00:00.000Z",
          "user": {
            "name": "Alice"
          }
        }
      }
    ]
  }
}
```

**失败 (404)** — 标签不存在

```json
{
  "success": false,
  "message": "标签不存在"
}
```

---

## GET /api/tags/slug/:slug

**功能**：根据 slug 获取单个标签详情

**权限**：公开

### 路径参数 (Path Parameters)

| 字段 | 类型   | 必填 | 说明      |
| ---- | ------ | ---- | --------- |
| slug | string | 是   | 标签 slug |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z",
    "_count": {
      "postTags": 5
    }
  }
}
```

**失败 (404)** — 标签不存在

```json
{
  "success": false,
  "message": "标签不存在"
}
```

---

## POST /api/tags

**功能**：创建新标签

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 请求参数 (Request Body)

| 字段 | 类型   | 必填 | 说明                                                              |
| ---- | ------ | ---- | ----------------------------------------------------------------- |
| name | string | 是   | 标签名称                                                          |
| slug | string | 否   | 标签 slug（未提供则从 name 转拼音自动生成，如 `"前端"` → `qian-duan`） |

### 请求示例

仅传名称（slug 自动生成）：

```json
{
  "name": "JavaScript"
}
```

手动指定 slug：

```json
{
  "name": "JavaScript",
  "slug": "js"
}
```

### 响应示例

**成功 (201)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "js",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z"
  }
}
```

**失败 (400)** — 参数错误

```json
{
  "success": false,
  "message": "标签名称为必填项"
}
```

**失败 (401)** — 未登录

```json
{
  "success": false,
  "message": "未提供认证令牌"
}
```

**失败 (409)** — 标签名称或 slug 已存在

```json
{
  "success": false,
  "message": "标签名称已存在"
}
```

---

## PUT /api/tags/:id

**功能**：更新标签

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 标签 ID |

### 请求参数 (Request Body)

| 字段 | 类型   | 必填 | 说明                                                              |
| ---- | ------ | ---- | ----------------------------------------------------------------- |
| name | string | 否   | 标签名称                                                          |
| slug | string | 否   | 标签 slug（传入 name 且未传 slug 时，自动从 name 转拼音更新 slug） |

### 请求示例

仅更新名称（slug 自动同步为拼音）：

```json
{
  "name": "前端开发"
}
```

手动指定 slug：

```json
{
  "name": "前端开发",
  "slug": "frontend"
}
```

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "前端开发",
    "slug": "frontend",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:30:00.000Z"
  }
}
```

**失败 (404)** — 标签不存在

```json
{
  "success": false,
  "message": "标签不存在"
}
```

**失败 (409)** — 标签名称或 slug 已存在

```json
{
  "success": false,
  "message": "标签名称已存在"
}
```

---

## DELETE /api/tags/:id

**功能**：删除标签

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 标签 ID |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z"
  }
}
```

**失败 (404)** — 标签不存在

```json
{
  "success": false,
  "message": "标签不存在"
}
```

### 注意事项

- 删除标签时，关联的 `PostTag` 记录会被自动删除（由于 `onDelete: Cascade`），文章不会被删除。

---

## POST /api/posts/:postId/tags

**功能**：为文章添加标签（支持批量添加）

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段   | 类型    | 必填 | 说明    |
| ------ | ------- | ---- | ------- |
| postId | integer | 是   | 文章 ID |

### 请求参数 (Request Body)

| 字段   | 类型     | 必填 | 说明         |
| ------ | -------- | ---- | ------------ |
| tagIds | number[] | 是   | 标签 ID 数组 |

### 请求示例

```json
{
  "tagIds": [1, 2, 3]
}
```

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
    "author": "Alice",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:30:00.000Z",
    "tags": [
      {
        "id": 1,
        "postId": 1,
        "tagId": 1,
        "createdAt": "2026-06-22T08:30:00.000Z",
        "tag": {
          "id": 1,
          "name": "JavaScript",
          "slug": "javascript",
          "createdAt": "2026-06-22T08:00:00.000Z",
          "updatedAt": "2026-06-22T08:00:00.000Z"
        }
      },
      {
        "id": 2,
        "postId": 1,
        "tagId": 2,
        "createdAt": "2026-06-22T08:30:00.000Z",
        "tag": {
          "id": 2,
          "name": "Vue",
          "slug": "vue",
          "createdAt": "2026-06-22T08:00:00.000Z",
          "updatedAt": "2026-06-22T08:00:00.000Z"
        }
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

**失败 (404)** — 部分标签不存在

```json
{
  "success": false,
  "message": "部分标签不存在"
}
```

### 注意事项

- 如果文章已经关联了某些标签，重复添加会被忽略（`skipDuplicates: true`）。

---

## DELETE /api/posts/:postId/tags/:tagId

**功能**：从文章移除标签

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段   | 类型    | 必填 | 说明    |
| ------ | ------- | ---- | ------- |
| postId | integer | 是   | 文章 ID |
| tagId  | integer | 是   | 标签 ID |

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
    "author": "Alice",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:30:00.000Z",
    "tags": [
      {
        "id": 2,
        "postId": 1,
        "tagId": 2,
        "createdAt": "2026-06-22T08:30:00.000Z",
        "tag": {
          "id": 2,
          "name": "Vue",
          "slug": "vue",
          "createdAt": "2026-06-22T08:00:00.000Z",
          "updatedAt": "2026-06-22T08:00:00.000Z"
        }
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

**失败 (404)** — 标签不存在

```json
{
  "success": false,
  "message": "标签不存在"
}
```

### 注意事项

- 移除标签只会删除文章与标签的关联关系，不会删除标签本身。
