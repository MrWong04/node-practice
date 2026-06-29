# Agent 项目上下文 — node-practice-frontend

> 本文件由 AI 生成，用于后续对话中快速理解项目上下文。每次重大变更后请更新此文件。

---

## 1. 项目概述

- **名称**：vue3-vite-ts（前端项目）
- **类型**：Vue 3 单页应用（后台管理系统 + 前台博客）
- **语言**：TypeScript
- **构建工具**：Vite 5.x
- **UI 框架**：Element Plus 2.x（后台）+ Vant 4.x（移动端/前台）
- **状态管理**：Pinia 2.x + pinia-plugin-persistedstate
- **路由**：Vue Router 4.x（hash 模式）
- **HTTP 客户端**：Axios
- **Node 版本**：>= 16

---

## 2. 技术栈

| 类别      | 技术                                                 |
| --------- | ---------------------------------------------------- |
| 框架      | Vue 3.4.x (Composition API)                          |
| 语言      | TypeScript 5.x                                       |
| 构建工具  | Vite 5.x                                             |
| UI 组件库 | Element Plus 2.14.x (后台) / Vant 4.9.x (H5/前台)    |
| 状态管理  | Pinia 2.x + Composition API (ref/computed)           |
| 路由      | Vue Router 4.x (createWebHashHistory)                |
| HTTP      | Axios 1.x                                            |
| 样式      | SCSS + CSS Variables                                 |
| 代码规范  | ESLint 8.x + Prettier 2.x                            |
| 自动导入  | unplugin-vue-components (按需导入 Vant + 自定义组件) |
| 包管理    | npm / pnpm                                           |

---

## 3. 项目结构

```
node-practice-frontend/
├── build/                      # Vite 构建配置拆分
│   ├── plugins.js              # Vite 插件配置（unplugin-vue-components 等）
│   ├── css.js                  # CSS/PostCSS 配置（px-to-viewport 等）
│   ├── server.js               # 开发服务器配置（代理等）
│   ├── resolve.js              # 路径别名配置
│   └── alias.js                # 额外别名
├── src/
│   ├── main.ts                 # 应用入口：创建 Vue 实例，注册插件
│   ├── App.vue                 # 根组件（仅挂载 <router-view>）
│   ├── api/
│   │   ├── auth.ts             # 认证相关 API（登录/注册/获取用户信息）
│   │   ├── article.ts          # 文章相关 API（列表、详情、创建、更新、删除），支持分类和标签
│   │   ├── category.ts         # 分类模块 API（列表、详情、创建、更新、删除）
│   │   ├── tag.ts              # 标签模块 API（列表、详情、创建、更新、删除）
│   │   └── user-center.ts      # 用户中心 API
│   ├── assets/
│   │   └── images/             # 静态图片资源
│   ├── components/
│   │   └── HeaderUser/         # 用户头部组件（自动导入）
│   ├── components.d.ts         # 自动导入组件类型声明（unplugin-vue-components 生成）
│   ├── hooks/                  # 自定义 Composition Hooks
│   ├── layout/
│   │   ├── background/         # 后台管理布局（侧边栏 + 顶部导航）
│   │   └── prospect/           # 前台博客布局（导航栏 + 页脚）
│   ├── router/
│   │   ├── index.ts            # 路由入口：创建路由实例 + 全局守卫
│   │   └── modules/
│   │       ├── auth.ts         # 认证路由（/auth/login）
│   │       ├── background.ts   # 后台路由（/background/*）
│   │       └── prospect.ts     # 前台路由（/, /category, /archive）
│   ├── stores/
│   │   ├── index.ts            # Pinia 实例创建（带持久化插件）
│   │   └── user.ts             # 用户状态管理（user, isLoggedIn, setUser, clearUser）
│   ├── styles/
│   │   ├── main.scss           # 全局样式入口
│   │   └── variable.scss       # SCSS 变量（全局注入）
│   ├── types/                  # 类型声明文件
│   │   ├── axiosConfig.d.ts
│   │   ├── css-vars-ponyfill.d.ts
│   │   ├── mockjs.d.ts
│   │   ├── vue3-property.d.ts
│   │   └── vue3-slide-verify.d.ts
│   ├── typings/                # 业务类型定义
│   │   ├── axios.d.ts
│   │   ├── common.ts
│   │   ├── http.ts             # HTTP 响应类型
│   │   ├── product.ts
│   │   └── user.ts
│   ├── utils/
│   │   ├── common.ts           # 通用工具函数
│   │   └── service.ts          # Axios 封装（blogService + service 双实例）
│   ├── views/                  # 页面视图组件
│   │   ├── auth/login/         # 登录/注册页
│   │   ├── background/         # 后台管理页面
│   │   │   ├── analytics/      # 访问分析
│   │   │   ├── articles/       # 文章列表
│   │   │   ├── categories/     # 分类管理
│   │   │   ├── dashboard/      # 数据概览
│   │   │   ├── roles/          # 角色权限
│   │   │   ├── tags/           # 标签管理
│   │   │   └── users/          # 用户管理
│   │   └── prospect/           # 前台博客页面
│   │       ├── archive/        # 文章归档
│   │       ├── category/       # 文章分类
│   │       └── home/           # 博客首页
│   ├── shims-vue.d.ts          # Vue 文件类型声明
│   └── env.d.ts                # Vite 环境变量类型声明
├── public/                     # 静态资源（不经过构建）
│   ├── favicon.ico
│   ├── default.png
│   └── default2.png
├── index.html                  # HTML 模板
├── vite.config.ts              # Vite 主配置（导入 build/ 下的拆分配置）
├── tsconfig.json               # TS 配置（引用 tsconfig.app.json + tsconfig.node.json）
├── tsconfig.app.json           # 应用 TS 配置（@vue/tsconfig 继承）
├── tsconfig.node.json          # Node 环境 TS 配置（vite.config 等）
├── env.d.ts                    # 环境变量类型声明
├── .env.dev / .env.pre / .env.prod / .env.test  # 多环境变量
├── .eslintrc.cjs               # ESLint 配置（Vue3 + TS + Prettier）
├── .prettierrc.json            # Prettier 配置
├── .eslintignore               # ESLint 忽略规则
├── .npmrc                      # npm 镜像配置（淘宝镜像）
├── package.json                # 依赖与脚本
├── pnpm-lock.yaml              # pnpm 锁定文件
└── README.md                   # 项目说明文档
```

---

## 4. 路由架构

采用 **模块化路由** + **布局组件** 设计：

| 路由模块        | 路径前缀      | 布局组件            | 说明                               |
| --------------- | ------------- | ------------------- | ---------------------------------- |
| `prospect.ts`   | `/`           | `layout/prospect`   | 前台博客（首页、分类、归档）       |
| `background.ts` | `/background` | `layout/background` | 后台管理（数据、文章、用户、权限） |
| `auth.ts`       | `/auth`       | 无（独立页面）      | 登录/注册页                        |

### 路由守卫（router.beforeEach）

1. **动态设置页面标题**：`document.title = meta.title + " - 我的blog"`
2. **自动恢复登录状态**：刷新页面时，若 `localStorage` 中有 `blog_token` 且 Pinia 中无用户信息，自动调用 `getMeApi()` 恢复用户状态

---

## 5. 状态管理（Pinia）

### Store 列表

| Store  | 文件             | 状态                 | 说明             |
| ------ | ---------------- | -------------------- | ---------------- |
| `user` | `stores/user.ts` | `user`, `isLoggedIn` | 当前登录用户信息 |

### 新增 API 文件

| 文件              | 说明                                                       |
| ----------------- | ---------------------------------------------------------- |
| `api/category.ts` | 分类模块 API（列表、详情、创建、更新、删除）               |
| `api/tag.ts`      | 标签模块 API（列表、详情、创建、更新、删除、文章标签关联） |

### 后台管理页面功能

| 页面                                    | 路由                             | 功能                       |
| --------------------------------------- | -------------------------------- | -------------------------- |
| `views/background/categories/index.vue` | `/background/content/categories` | 分类列表、新增、编辑、删除 |
| `views/background/tags/index.vue`       | `/background/content/tags`       | 标签列表、新增、编辑、删除 |

### User Store 结构

```typescript
const user = ref<User | null>(null)
const isLoggedIn = computed(() => !!user.value)
const setUser = (userData: User) => {
  user.value = userData
}
const clearUser = () => {
  user.value = null
}
```

### 持久化

- 使用 `pinia-plugin-persistedstate` 插件
- 注意：当前 userStore 未配置持久化，用户信息仅在内存中
- token 存储在 `localStorage`（key: `blog_token`）

---

## 6. API 层

### 双 Axios 实例设计

| 实例                  | 文件                   | baseURL      | 用途                                   |
| --------------------- | ---------------------- | ------------ | -------------------------------------- |
| `blogService`（博客） | `src/utils/service.ts` | `/local/api` | 对接 node-practice-backend（JWT 认证） |
| `service`（业务）     | `src/utils/service.ts` | `/yk`        | 对接原有业务后端（access-token 认证）  |

### 博客认证 API（auth.ts）

```typescript
registerApi(params: RegisterParams)  => POST /auth/register
loginApi(params: LoginParams)        => POST /auth/login
getMeApi()                           => GET  /auth/me
```

- `blogService` 请求拦截器：自动注入 `Authorization: Bearer <token>`（从 localStorage 读取 `blog_token`）
- `blogService` 响应拦截器：直接返回 `response.data`
- API 文件（auth.ts / article.ts / category.ts / tag.ts）统一从 `src/utils/service.ts` 导入 `blogService`

### 业务 API（service.ts）

- 复杂的请求/响应拦截器（处理 `head`/`data` 格式、token 过期、错误码等）
- 使用 `access-token` 头部而非 `Authorization: Bearer`
- 响应格式包含 `head.respCode` / `head.respDesc` 等业务状态码

---

## 7. 环境变量

```bash
# .env.dev
VUE_APP_BUILD_TYPE=dev
NODE_ENV=production

# .env.pre
VUE_APP_BUILD_TYPE=pre
NODE_ENV=production

# .env.prod
VUE_APP_BUILD_TYPE=prod
NODE_ENV=production

# .env.test
VUE_APP_BUILD_TYPE=test
NODE_ENV=production
```

> 注意：所有环境变量文件中的 `NODE_ENV` 均为 `production`，实际环境区分通过 `VUE_APP_BUILD_TYPE` 判断。

---

## 8. 常用命令

```bash
# 开发
npm run dev              # vite 启动开发服务器

# 构建
npm run build            # 生产构建（run-p build-only）
npm run build-only       # vite build

# 预览
npm run preview          # vite preview

# 类型检查
npm run type-check       # vue-tsc --noEmit

# 代码规范
npm run lint             # ESLint 检查并修复
npm run format           # Prettier 格式化 src/
```

---

## 9. 开发规范

### 代码风格

- **Prettier**：semi=false, singleQuote=true, tabWidth=2, printWidth=100, trailingComma=none
- **ESLint**：plugin:vue/vue3-essential + @vue/eslint-config-typescript + prettier
- **TypeScript**：strict 模式（通过 @vue/tsconfig 继承）

### 组件规范

- 使用 `<script setup lang="ts">` 语法
- 组件名：关闭 `vue/multi-word-component-names` 规则（允许单名单词组件）
- 自动导入：`unplugin-vue-components` 自动导入 `src/components/` 和 Vant 组件

### 文件命名

- 页面组件：`views/{module}/{name}/index.vue`
- 布局组件：`layout/{name}/index.vue`
- 路由模块：`router/modules/{name}.ts`
- API 文件：`api/{feature}.ts`
- Store 文件：`stores/{name}.ts`

### 类型定义

- 业务类型：`typings/` 目录下
- 第三方库类型：`types/` 目录下
- 自动生成的类型：`components.d.ts`, `env.d.ts`

---

## 10. 与后端对接说明

- 后端项目：`node-practice-backend`（localhost:3002）
- 前端代理配置：`/local/api` → `http://localhost:3002`
- 登录流程：
  1. 用户提交表单 → `loginApi()` → 后端返回 `{ user, token }`
  2. 前端存储 `localStorage.setItem('blog_token', token)`
  3. 调用 `userStore.setUser(user)` 更新状态
  4. 后续请求自动携带 `Authorization: Bearer <token>`
- 刷新恢复：路由守卫检测 `blog_token` 存在但 userStore 为空时，自动调用 `getMeApi()` 恢复

---

## 11. 布局系统

### 前台布局（prospect）

- 博客风格，展示文章列表、分类、归档
- 路由：`/`, `/category`, `/archive`

### 后台布局（background）

- 管理系统风格，使用 Element Plus 组件
- 侧边栏导航 + 顶部面包屑/用户信息
- 路由：`/background/dashboard`, `/background/content/articles`, `/background/system/users` 等
- 分类管理、标签管理页面已完善（列表、新增、编辑、删除）
- 文章管理页面已完善（列表、新增、编辑、删除），支持分类和标签选择
- 其他页面（用户管理、角色权限、访问分析等）仍为占位页面

---

## 12. 已知问题与待办

1. **后台页面部分完善**：分类管理、标签管理、文章列表/编辑页面已实现，但用户管理、角色权限等页面仍为占位
2. **用户 Store 未持久化**：刷新页面后需依赖路由守卫重新获取用户信息
3. **Axios 实例已统一**：`src/utils/service.ts` 中已导出 `blogService`（博客后端，JWT 认证）和 `service`（业务后端，access-token 认证），博客相关 API 统一引用 `blogService`

---

## 13. 后续更新记录

<!-- 每次重大变更后在此记录，便于 AI 后续对话快速理解变更 -->

### 2026-06-19

- 初始生成 agent.md
- 前端包含完整的 Vue 3 + Vite + TS 项目结构
- 已实现前台/后台双布局、路由模块化、Pinia 状态管理
- 认证系统已对接后端 JWT（登录/注册/获取用户信息）
- 后台管理页面框架已搭建（Element Plus），具体功能待完善

### 2026-06-22

- 完善分类管理页面：实现分类列表展示、新增、编辑、删除功能，对接 `/api/categories` 接口
- 完善标签管理页面：实现标签列表展示、新增、编辑、删除功能，对接 `/api/tags` 接口
- 新增 `api/category.ts`：封装分类相关 API（getAllCategoriesApi, createCategoryApi, updateCategoryApi, deleteCategoryApi 等）
- 新增 `api/tag.ts`：封装标签相关 API（getAllTagsApi, createTagApi, updateTagApi, deleteTagApi 等）
- 更新文章列表页面：完善文章列表展示和删除功能，增加分类和标签列展示
- 更新文章编辑页面：新增分类下拉选择和标签多选功能，支持创建/编辑时关联分类和标签
- 更新 `api/article.ts`：增加 `PostCategory`、`PostTag` 类型，`Post` 增加 `category` 和 `tags` 字段，`CreatePostParams`/`UpdatePostParams` 增加 `categoryId` 和 `tagIds` 参数
- 统一博客后端 API：新增 `blogService`（`baseURL: '/local/api'`，JWT 认证），`auth.ts` / `article.ts` / `category.ts` / `tag.ts` 统一从 `src/utils/service.ts` 导入 `blogService`，不再各自创建 axios 实例

---
