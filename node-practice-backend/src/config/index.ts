// ==========================================================================
// 全局配置 — 集中读取环境变量，避免硬编码散布在各处
// ==========================================================================

export const PORT = parseInt(process.env.PORT || '3002', 10)

export const SALT_ROUNDS = 10

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
