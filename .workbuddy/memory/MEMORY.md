# 项目长期记忆 — node-practice

## 项目结构
- `node-practice-backend/`：Express 5 + Prisma 6 + MySQL + TypeScript，端口 3002，MVC 分层（routes → controllers → services），JWT 认证
- `node-practice-frontend/`：Vue3 + Vite + TS（Vant/Element Plus）

## 关键约定（必须遵守）
1. **`.env` 绝不允许 git 跟踪**：Key 放 `node-practice-backend/.env`（已 gitignore + `git rm --cached` 处理过）。新增环境变量只提交到 `.env.example`。
2. **AI 聊天配置**：商汤代理端点 `DEEPSEEK_BASE_URL=https://token.sensenova.cn/v1` + `DEEPSEEK_MODEL=deepseek-v4-flash`；代码默认 fallback 是官方 `api.deepseek.com` + `deepseek-chat`。
3. **`.env` 显式加载**：`src/config/index.ts` 顶部已有 `process.loadEnvFile()`（Node 20.12+），新增配置读取依赖它，不要依赖 Prisma 隐式加载。
4. **代码风格**：TypeScript 严格模式、统一响应 `{success, data?, message?}`、自定义错误类（utils/errors.ts）、中文注释、每任务验证后 git 提交。
5. **Prisma 注意**：Windows 上 `prisma generate` 若 EPERM/safe-delete 失败，先停 dev 服务（tsx watch 需杀进程链）→ PowerShell `Remove-Item -Recurse -Force` 删 `.prisma` → 重新 generate。

## 聊天模块速记
- 端点：`/api/chat/conversations` CRUD + `POST /:id/messages`（SSE）
- SSE 事件：user_message / message / done / error
- 聊天分页格式 `{list,total,page,pageSize}`（与 posts 的 `{items,pagination}` 不同）
- 上下文只带最近 20 条；标题用首条消息截断 20 字（不调模型）
