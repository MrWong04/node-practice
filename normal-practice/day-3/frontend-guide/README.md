# Vue3 前端联调指南

## 前置条件

确保后端认证服务器已启动：

```bash
node normal-practice/day-2/express-auth-server.js
```

## 创建 Vue3 项目

```bash
cd normal-practice/day-3
npm create vue@latest frontend
# 选项：TypeScript / Pinia / Vue Router / ESLint

cd frontend
npm install
npm install axios pinia vue-router
npm run dev
```

## 核心文件说明

| 文件                  | 作用                                         |
| --------------------- | -------------------------------------------- |
| `api/request.js`      | Axios 封装：自动附加 JWT Token、统一错误处理 |
| `stores/auth.js`      | Pinia Store：管理登录态、Token、用户信息     |
| `router/index.js`     | 路由守卫：未登录拦截、已登录重定向           |
| `views/LoginView.vue` | 登录/注册页面                                |
| `views/PostsView.vue` | 文章列表 + 发布文章                          |

## CORS 处理

开发时后端需允许跨域。在 `express-auth-server.js` 顶部添加：

```javascript
const cors = require("cors")
app.use(cors({ origin: "http://localhost:5173" }))
```

然后安装：`npm install cors`

## 与后端的对应关系

| 前端                            | 后端                           |
| ------------------------------- | ------------------------------ |
| Axios baseURL                   | `http://localhost:3002/api`    |
| `localStorage.setItem('token')` | 登录成功返回 JWT               |
| `Authorization: Bearer <token>` | `authenticateToken` 中间件验证 |
| Pinia `isLoggedIn`              | 路由守卫判断登录态             |
| 401 自动跳转登录页              | Token 过期或无效               |
