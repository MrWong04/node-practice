# 阶段 1：构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 阶段 2：运行
FROM node:20-alpine AS runner

WORKDIR /app

# 安装 PM2（进程管理）
RUN npm install -g pm2

# 复制构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/normal-practice ./normal-practice
COPY --from=builder /app/.env ./

# 暴露端口
EXPOSE 3002

# 启动命令：先迁移数据库，再启动服务
CMD ["sh", "-c", "npx prisma migrate deploy && pm2-runtime normal-practice/day-2/express-auth-server.js --name api-server"]
