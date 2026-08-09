// ==========================================================================
// 全局配置 — 集中读取环境变量，避免硬编码散布在各处
// ==========================================================================

// 显式加载 .env（Node 20.12+ 内置），避免依赖 Prisma 隐式加载的时序
try {
  process.loadEnvFile()
} catch {
  // .env 不存在时忽略（如生产容器环境变量已注入）
}

export const PORT = parseInt(process.env.PORT || '3002', 10)

export const SALT_ROUNDS = 10

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// --------------------------------------------------------------------------
// DeepSeek AI 配置
// --------------------------------------------------------------------------

export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

// 组装上下文时最多携带的历史消息条数（控制 token 成本）
export const MAX_CONTEXT_MESSAGES = 20

// 单条消息最大长度
export const MAX_MESSAGE_LENGTH = 4000

// 会话标题截断长度
export const TITLE_MAX_LENGTH = 20
