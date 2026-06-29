# 分类模块接口文档 (Categories)

> 基础路径前缀：`/api/categories`
>
> 提供分类列表浏览（公开）及创建、更新、删除（需登录）。

---

## GET /api/categories

**功能**：获取分类列表（支持筛选与分页）

**权限**：公开

### 查询参数 (Query Parameters)

| 字段     | 类型    | 必填 | 说明                            |
| -------- | ------- | ---- | ------------------------------- |
| name     | string  | 否   | 分类名称，模糊匹配              |
| slug     | string  | 否   | 分类 slug，模糊匹配             |
| page     | integer | 否   | 页码，默认 `1`                  |
| pageSize | integer | 否   | 每页条数，默认 `10`，最大 `100` |

### 请求示例

```
GET /api/categories?name=技术&page=1&pageSize=10
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
        "name": "技术",
        "slug": "ji-shu",
        "createdAt": "2026-06-22T08:00:00.000Z",
        "updatedAt": "2026-06-22T08:00:00.000Z",
        "_count": {
          "posts": 5
        }
      },
      {
        "id": 2,
        "name": "生活",
        "slug": "sheng-huo",
        "createdAt": "2026-06-22T08:00:00.000Z",
        "updatedAt": "2026-06-22T08:00:00.000Z",
        "_count": {
          "posts": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
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
  "message": "pageSize 必须为 1-100 之间的整数"
}
```

---

## GET /api/categories/:id

**功能**：根据 ID 获取单个分类详情（包含该分类下的文章列表）

**权限**：公开

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 分类 ID |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "技术",
    "slug": "ji-shu",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z",
    "posts": [
      {
        "id": 1,
        "title": "Hello World",
        "description": "My first post",
        "createdAt": "2026-06-22T08:00:00.000Z",
        "user": {
          "name": "Alice"
        }
      }
    ]
  }
}
```

**失败 (404)** — 分类不存在

```json
{
  "success": false,
  "message": "分类不存在"
}
```

---

## GET /api/categories/slug/:slug

**功能**：根据 slug 获取单个分类详情

**权限**：公开

### 路径参数 (Path Parameters)

| 字段 | 类型   | 必填 | 说明      |
| ---- | ------ | ---- | --------- |
| slug | string | 是   | 分类 slug |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "技术",
    "slug": "ji-shu",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z",
    "_count": {
      "posts": 5
    }
  }
}
```

**失败 (404)** — 分类不存在

```json
{
  "success": false,
  "message": "分类不存在"
}
```

---

## POST /api/categories

**功能**：创建新分类

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 请求参数 (Request Body)

| 字段 | 类型   | 必填 | 说明                                                              |
| ---- | ------ | ---- | ----------------------------------------------------------------- |
| name | string | 是   | 分类名称                                                          |
| slug | string | 否   | 分类 slug（未提供则从 name 转拼音自动生成，如 `"技术"` → `ji-shu`） |

### 请求示例

仅传名称（slug 自动生成）：

```json
{
  "name": "技术"
}
```

手动指定 slug：

```json
{
  "name": "技术",
  "slug": "tech"
}
```

### 响应示例

**成功 (201)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "技术",
    "slug": "tech",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z"
  }
}
```

**失败 (400)** — 参数错误

```json
{
  "success": false,
  "message": "分类名称为必填项"
}
```

**失败 (401)** — 未登录

```json
{
  "success": false,
  "message": "未提供认证令牌"
}
```

**失败 (409)** — 分类名称或 slug 已存在

```json
{
  "success": false,
  "message": "分类名称已存在"
}
```

---

## PUT /api/categories/:id

**功能**：更新分类

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 分类 ID |

### 请求参数 (Request Body)

| 字段 | 类型   | 必填 | 说明                                                              |
| ---- | ------ | ---- | ----------------------------------------------------------------- |
| name | string | 否   | 分类名称                                                          |
| slug | string | 否   | 分类 slug（传入 name 且未传 slug 时，自动从 name 转拼音更新 slug） |

### 请求示例

仅更新名称（slug 自动同步为拼音）：

```json
{
  "name": "前端技术"
}
```

手动指定 slug：

```json
{
  "name": "前端技术",
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
    "name": "前端技术",
    "slug": "frontend",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:30:00.000Z"
  }
}
```

**失败 (404)** — 分类不存在

```json
{
  "success": false,
  "message": "分类不存在"
}
```

**失败 (409)** — 分类名称或 slug 已存在

```json
{
  "success": false,
  "message": "分类名称已存在"
}
```

---

## DELETE /api/categories/:id

**功能**：删除分类

**权限**：受保护（需在请求头携带 `Authorization: Bearer <token>`）

### 路径参数 (Path Parameters)

| 字段 | 类型    | 必填 | 说明    |
| ---- | ------- | ---- | ------- |
| id   | integer | 是   | 分类 ID |

### 响应示例

**成功 (200)**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "技术",
    "slug": "ji-shu",
    "createdAt": "2026-06-22T08:00:00.000Z",
    "updatedAt": "2026-06-22T08:00:00.000Z"
  }
}
```

**失败 (404)** — 分类不存在

```json
{
  "success": false,
  "message": "分类不存在"
}
```

### 注意事项

- 删除分类时，关联的文章的 `categoryId` 会被设置为 `null`，文章不会被删除。
