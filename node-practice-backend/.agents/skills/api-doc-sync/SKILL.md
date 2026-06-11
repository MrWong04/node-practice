# API 文档同步 Skill

## 名称

api-doc-sync

## 触发条件

当以下任一情况发生时，自动触发本文档同步流程：

1. 用户在 `src/app.ts`（或任何包含 Express 路由定义的文件）中新增、修改或删除了路由处理逻辑
2. 用户调整了请求参数（`req.body`、`req.params`、`req.query`）或响应结构（`res.json()`）
3. 用户修改了中间件使用方式（如添加或移除 `authenticateToken`）
4. 用户新增了路由模块文件
5. 用户明确提到"更新文档"、"同步接口文档"、"文档与代码不一致"等类似意图

## 路由与文档映射规则

代码中的路由按前缀自动映射到 `docs/api/` 下的文档文件：

| 路由前缀          | 对应文档文件           | 模块名             |
| ----------------- | ---------------------- | ------------------ |
| `/api/auth/*`     | `docs/api/auth.md`     | 认证模块           |
| `/api/posts/*`    | `docs/api/posts.md`    | 文章模块           |
| `/api/users/*`    | `docs/api/users.md`    | 用户模块（待创建） |
| `/api/comments/*` | `docs/api/comments.md` | 评论模块（待创建） |

> 若新增的路由前缀不在上表中，则需要在 `docs/api/README.md` 的模块概览表中注册新映射，并创建对应模块文档文件。

## 执行流程

### Step 1：检测变更

分析用户的代码变更（diff 或文件内容），提取以下信息：

- **HTTP 方法**：GET / POST / PUT / DELETE / PATCH 等
- **路由路径**：如 `/api/posts/:id`
- **权限变化**：是否增加了 `authenticateToken` 或移除了保护中间件
- **请求参数变化**：
  - Body 参数（字段名、类型、是否必填）
  - Path 参数（`:id` 等）
  - Query 参数
- **响应变化**：成功/失败的 HTTP 状态码、返回的 JSON 结构
- **业务逻辑变化**：错误处理、权限检查、字段校验规则等

### Step 2：定位目标文档

根据变更的路由前缀，从映射表中定位到对应的 `.md` 文件：

1. 若目标文件已存在 → 进入 Step 3
2. 若目标文件不存在 → 在 `docs/api/` 下创建新文件，并在 `docs/api/README.md` 中注册模块概览和快速索引

### Step 3：更新文档内容

打开目标文档文件，根据变更类型执行以下操作：

#### 3.1 新增接口

- 在文档末尾追加新的接口章节，格式如下：

````markdown
## {METHOD} {PATH}

**功能**：{简要描述}

**权限**：{公开 / 受保护（需说明 Token 传递方式）}

### 请求参数 ({参数位置})

| 字段    | 类型   | 必填     | 说明   |
| ------- | ------ | -------- | ------ |
| {field} | {type} | {yes/no} | {desc} |

### 请求示例

```json
{...}
```
````

### 响应示例

**成功 ({status})**

```json
{...}
```

**失败 ({status})** — {错误场景}

```json
{...}
```

````

- 同步更新 `docs/api/README.md` 快速索引，添加新接口的锚点链接

#### 3.2 修改接口

- 定位到该接口对应的章节（通过 `## {METHOD} {PATH}` 标题匹配）
- 对比现有文档与代码变更，更新以下内容：
  - 功能描述
  - 权限说明
  - 请求参数字段表（增删改字段、修改必填状态、修改类型）
  - 请求/响应示例 JSON（必须与代码中实际返回的结构一致）
  - 错误码和错误消息

#### 3.3 删除接口

- 在对应章节顶部添加废弃标记：

```markdown
> ⚠️ **已废弃**：该接口于 {日期} 被移除，请勿继续使用。
````

- 保留章节内容至少一个版本周期后，可由维护者手动删除
- 在 `docs/api/README.md` 快速索引中标注为废弃或移除

### Step 4：同步总纲

无论进行何种变更，都必须同步检查并更新 `docs/api/README.md`：

- 确保模块概览表中的模块列表与实际文档文件一致
- 确保快速索引中的接口链接与实际文档中的章节锚点一致
- 若新增了模块，在目录结构代码块中补充新文件

## 一致性校验清单

更新完成后，请按以下清单逐项确认：

- [ ] 文档中的路由路径与代码中 `app.{method}("{path}")` 完全一致
- [ ] 文档中的 HTTP 方法与代码中的方法名（get/post/put/delete）完全一致
- [ ] 文档中的请求参数字段名与代码中解构的字段名（`req.body.xxx`、`req.params.xxx`）完全一致
- [ ] 文档中的必填状态与代码中的校验逻辑一致（代码中 `if (!xxx)` 返回 400 的字段标记为必填）
- [ ] 文档中的响应 JSON 结构与代码中 `res.json({...})` 返回的结构一致
- [ ] 文档中的状态码与代码中 `res.status(xxx)` 一致
- [ ] 文档中的权限说明与代码中是否使用 `authenticateToken` 一致
- [ ] `docs/api/README.md` 的快速索引包含所有活跃接口

## 示例场景

### 场景 A：新增路由

**代码变更**：

```typescript
app.get('/api/users', authenticateToken, async (req, res) => {
  const users = await prisma.user.findMany()
  res.json({ success: true, data: users })
})
```

**Skill 执行**：

1. 检测到新路由 `/api/users`
2. 前缀 `/api/users` 无现有映射 → 创建 `docs/api/users.md`
3. 在 `docs/api/users.md` 中写入 `GET /api/users` 章节
4. 在 `docs/api/README.md` 中注册 "用户模块" 和快速索引

### 场景 B：修改响应结构

**代码变更**：

```typescript
// 原代码返回 { success: true, data: post }
// 新代码返回：
res.json({ success: true, data: post, meta: { total: count } })
```

**Skill 执行**：

1. 定位到 `docs/api/posts.md` 中对应接口章节
2. 更新响应示例 JSON，添加 `meta.total` 字段
3. 更新文档中的响应字段说明表（如有）

### 场景 C：删除路由

**代码变更**：移除了 `app.delete("/api/posts/:id", ...)` 的处理逻辑

**Skill 执行**：

1. 定位到 `docs/api/posts.md` 中的 `DELETE /api/posts/:id` 章节
2. 在章节顶部添加废弃标记
3. 在 `docs/api/README.md` 快速索引中标注为废弃

## 注意事项

- 本文档同步是**代码变更的强制配套动作**，不应当在代码已合并后遗漏
- 若一次代码变更涉及多个接口，需要逐一更新所有受影响的文档文件
- 保持 Markdown 锚点稳定：章节标题格式固定为 `## {METHOD} {PATH}`，避免频繁变更导致 README 中的链接失效
- 对于复杂的嵌套响应结构，只需示例 JSON 中展示前两级字段，不必穷举所有嵌套属性
