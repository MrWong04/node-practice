# API 文档总纲

> 本目录用于集中存放项目所有 REST API 的接口文档。
> 当接口发生变更时，请先定位到对应模块的文档进行同步更新。

## 目录结构

```
docs/api/
├── README.md          # 总纲（本文件）：模块概览与快速索引
├── auth.md            # 认证模块：注册 / 登录 / 获取当前用户
└── posts.md           # 文章模块：文章的增删改查
```

## 模块概览

| 模块         | 文件路径                 | 说明                                                  |
| ------------ | ------------------------ | ----------------------------------------------------- |
| 认证 (Auth)  | [`auth.md`](./auth.md)   | 用户注册、登录、JWT 校验、获取当前登录用户信息        |
| 文章 (Posts) | [`posts.md`](./posts.md) | 公开文章列表/详情、创建/更新/删除文章（后三者需登录） |

## 快速索引

- **认证**
  - [`POST /api/auth/register`](./auth.md#post-apiauthregister)
  - [`POST /api/auth/login`](./auth.md#post-apiauthlogin)
  - [`GET /api/auth/me`](./auth.md#get-apiauthme)
- **文章**
  - [`GET /api/posts`](./posts.md#get-apiposts)
  - [`GET /api/posts/:id`](./posts.md#get-apipostsid)
  - [`POST /api/posts`](./posts.md#post-apiposts)
  - [`PUT /api/posts/:id`](./posts.md#put-apipostsid)
  - [`DELETE /api/posts/:id`](./posts.md#delete-apipostsid)

## 通用响应格式

```json
{
  "success": true, // 或 false
  "data": {}, // 业务数据（失败时可能无此字段）
  "message": "" // 提示信息
}
```

## 更新维护

- 新增接口：在对应模块文档中追加，并在本文件快速索引中注册。
- 修改接口：同步修改对应模块文档中的路径、方法、参数、返回值描述。
- 删除接口：在对应模块文档中标记为已废弃，并在本文件快速索引中移除或标注。
