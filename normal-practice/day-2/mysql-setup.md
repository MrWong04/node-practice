# MySQL 迁移步骤

## 环境信息

- MySQL 版本：8.2.0
- 安装路径：`E:\MySQL\mysql-8.2.0-winx64`
- 客户端命令：`E:\MySQL\mysql-8.2.0-winx64\bin\mysql.exe`

## 步骤 1：手动创建数据库

打开 CMD，执行以下命令（将 `你的密码` 替换为 root 密码）：

```bash
"E:\MySQL\mysql-8.2.0-winx64\bin\mysql.exe" -u root -p
```

输入密码后，在 `mysql>` 提示符下执行：

```sql
CREATE DATABASE node_practice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

## 步骤 2：配置 Prisma 连接字符串

打开 `.env` 文件，修改为：

```env
DATABASE_URL="mysql://root:你的密码@localhost:3306/node_practice"
```

> ⚠️ 将 `你的密码` 替换为你的 MySQL root 实际密码！

## 步骤 3：修改 Prisma Schema

打开 `prisma/schema.prisma`，将 datasource 改为 mysql：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 步骤 4：重新生成迁移

```bash
# 删除旧的 SQLite 迁移文件
rmdir /s /q prisma\migrations

# 重新创建迁移
npx prisma migrate dev --name init_mysql
```

## 步骤 5：验证

```bash
node normal-practice/day-2/api-auth-client-test.js
```

如果一切正常，数据现在会存储在 MySQL 中，而不是 SQLite 文件里。

## 迁移后验证 MySQL 数据

```bash
"E:\MySQL\mysql-8.2.0-winx64\bin\mysql.exe" -u root -p
```

```sql
USE node_practice;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM posts;
```
