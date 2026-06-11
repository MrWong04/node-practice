# ===========================================================================
# Dockerfile — 多阶段构建配置
# ===========================================================================
# 使用多阶段构建 (Multi-stage) 减小最终镜像体积
# 阶段 1 (builder): 安装依赖、编译 TypeScript
# 阶段 2 (runner): 仅复制运行所需的产物，不含 devDependencies
# ===========================================================================

# ---------------------------------------------------------------------------
# 阶段 1: 构建阶段 (Builder)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

# 设置工作目录，后续所有命令在此目录下执行
WORKDIR /app

# 先复制依赖清单文件（利用 Docker 层缓存）
# 只要 package*.json 不变，npm ci 层就不会重新执行
COPY package*.json ./
COPY prisma ./prisma/

# 安装全部依赖（含 devDependencies，因为需要 TypeScript 编译器）
# npm ci 比 npm install 更快且更严格，适合 CI/CD 环境
RUN npm ci

# 复制源代码和配置文件
COPY . .

# 生成 Prisma Client（根据 schema.prisma 生成类型安全的客户端代码）
RUN npx prisma generate

# 编译 TypeScript 到 dist/ 目录
RUN npm run build

# ---------------------------------------------------------------------------
# 阶段 2: 运行阶段 (Runner)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# 仅复制生产依赖所需的文件
# node_modules: 运行时依赖
# package*.json: npm 元数据
# prisma: Prisma schema 和生成的 client（运行时需要）
# dist: TypeScript 编译后的 JavaScript 产物
# .env: 环境变量（生产环境通常应通过 docker-compose 注入，而非复制文件）
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# 暴露应用端口（3002 是 src/app.ts 中定义的默认端口）
EXPOSE 3002

# 启动命令:
# 1. 先执行 Prisma 数据库迁移部署（确保数据库结构最新）
# 2. 再启动 Node.js 应用（使用编译后的 dist/app.js）
# 生产环境建议改用 PM2 或 systemd 管理进程，示例:
# CMD ["sh", "-c", "npx prisma migrate deploy && pm2-runtime dist/app.js --name api-server"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
