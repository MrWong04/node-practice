# 前端页面同步 Skill

## 名称

frontend-page-sync

## 触发条件

当以下任一情况发生时，自动触发前端页面同步流程：

1. 后端接口文档发生变更（`docs/api/*.md` 新增或修改）
2. 用户明确要求"根据接口文档完善/更新前端页面"
3. 用户新增或修改后端路由控制器代码，需要前端同步适配
4. 用户在后续对话中提到"更新 agent.md"、"同步前端"等类似意图

## 执行流程

### Step 1：读取接口文档

读取 `node-practice-backend/docs/api/` 下的相关接口文档，提取以下信息：

- **HTTP 方法**：GET / POST / PUT / DELETE / PATCH 等
- **路由路径**：如 `/api/categories/:id`
- **权限**：公开 / 受保护（需登录）
- **请求参数**：字段名、类型、是否必填
- **响应结构**：成功/失败的 JSON 格式

### Step 2：检查前端 API 文件

检查 `node-practice-frontend/src/api/` 下是否存在对应的 API 文件：

- 若不存在 → 创建新的 API 文件，封装所有接口方法
- 若已存在 → 对比接口文档，补充缺失的方法或更新参数类型

### Step 3：检查前端页面

检查 `node-practice-frontend/src/views/background/` 下是否存在对应的管理页面：

- 若不存在 → 创建新的管理页面，包含列表、新增、编辑、删除功能
- 若已存在 → 对比接口文档，完善缺失的功能（如表单字段、表格列、操作按钮等）

### Step 4：更新 agent.md

在 `node-practice-frontend/agent.md` 中更新以下内容：

1. **项目结构**：补充新增的 API 文件和页面文件
2. **API 层**：补充新增的接口说明
3. **后台管理页面功能**：补充新增页面的功能说明
4. **已知问题与待办**：更新已完成的页面，移除过时的待办
5. **后续更新记录**：在末尾追加本次变更的详细记录（包含日期和具体变更内容）

### Step 5：同步更新

在后续对话中，当用户修改后端接口时，按以下顺序同步：

1. 先更新后端接口文档（如有 skill 则调用对应后端同步 skill）
2. 更新前端 API 文件（`src/api/*.ts`）
3. 更新前端管理页面（`src/views/background/*/index.vue`）
4. 更新 `agent.md` 文档
5. 向用户汇报同步结果

## 注意事项

- API 文件中的 axios 实例配置应与 `auth.ts` 保持一致（`baseURL: '/local/api'`）
- 页面组件使用 `<script setup lang="ts">` 语法
- 列表页使用 `el-table` + `el-card` 布局，操作列包含编辑和删除按钮
- 新增/编辑使用 `el-dialog` + `el-form` 弹窗
- 删除操作需使用 `ElMessageBox.confirm` 确认
- 请求拦截器自动注入 `Authorization: Bearer <token>`
- 响应拦截器直接返回 `response.data`
