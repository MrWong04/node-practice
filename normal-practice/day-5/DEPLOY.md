# 部署指南

## 方案一：Docker 部署（推荐）

### 前提条件

- 安装 Docker Desktop：[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

### 部署步骤

```bash
# 1. 构建 Docker 镜像
docker build -t node-practice-api .

# 2. 运行容器
docker run -d -p 3002:3002 --name node-api node-practice-api

# 或使用 docker-compose（更推荐）
docker-compose up -d
```

### 常用命令

```bash
# 查看运行中的容器
docker ps

# 查看日志
docker logs -f node-api

# 停止容器
docker stop node-api

# 删除容器
docker rm node-api
```

---

## 方案二：PM2 部署（轻量级）

### 安装 PM2

```bash
npm install -g pm2
```

### 启动服务

```bash
# 启动
pm2 start normal-practice/day-2/express-auth-server.js --name "api-server"

# 查看状态
pm2 status

# 查看日志
pm2 logs api-server

# 重启
pm2 restart api-server

# 停止
pm2 stop api-server

# 保存配置（开机自启）
pm2 save
pm2 startup
```

---

## 方案三：云服务器部署（阿里云/腾讯云）

1. 购买云服务器（推荐 Ubuntu 22.04）
2. 安装 Node.js、npm
3. 上传代码到服务器（`scp` 或 Git）
4. 安装依赖：`npm ci`
5. 运行迁移：`npx prisma migrate deploy`
6. 用 PM2 启动服务
7. 配置 Nginx 反向代理 + SSL

---

## 环境变量配置

生产环境必须修改的环境变量：

```env
NODE_ENV=production
DATABASE_URL=file:./dev.db
JWT_SECRET=你的强密码（至少32位随机字符串）
```

> ⚠️ **安全警告**：生产环境务必把 SQLite 换成 PostgreSQL/MySQL，且 JWT_SECRET 不能泄露！
