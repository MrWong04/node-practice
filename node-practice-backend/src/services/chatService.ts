import { prisma } from '../../prisma/client'
import { ValidationError, NotFoundError } from '../utils/errors'
import { MAX_CONTEXT_MESSAGES, MAX_MESSAGE_LENGTH, TITLE_MAX_LENGTH } from '../config'
import { streamChatCompletion, ChatCompletionMessage } from './deepseekService'

// ==========================================================================
// Chat Service — 会话 CRUD、消息持久化、上下文组装、AI 流式回复
// ==========================================================================

/** 会话列表项（不含消息） */
function toConversationSummary(c: {
  id: number
  title: string
  createdAt: Date
  updatedAt: Date
  _count: { messages: number }
}) {
  return {
    id: c.id,
    title: c.title,
    messageCount: c._count.messages,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

/** 校验会话归属，返回会话；不存在或不属于当前用户均抛 404 */
async function findOwnedConversation(userId: number, conversationId: number) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  })
  if (!conversation) throw new NotFoundError('会话不存在')
  return conversation
}

/** 创建会话；若携带首条消息，则先入库用户消息并用其生成标题 */
export async function createConversation(userId: number, title?: string, firstMessage?: string) {
  const conversation = await prisma.conversation.create({
    data: { title: title?.trim() ? title.trim().slice(0, 50) : '新对话', userId },
    select: { id: true, title: true, userId: true, createdAt: true, updatedAt: true },
  })

  if (firstMessage && firstMessage.trim()) {
    const content = firstMessage.trim()
    await addUserMessage(conversation.id, content)

    // 用首条消息生成标题（不额外调模型，控制成本）
    const generatedTitle =
      content.length > TITLE_MAX_LENGTH ? `${content.slice(0, TITLE_MAX_LENGTH)}…` : content
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { title: generatedTitle },
    })
  }

  return prisma.conversation.findUnique({
    where: { id: conversation.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
}

/** 会话列表（分页，按更新时间倒序） */
export async function listConversations(userId: number, page = 1, pageSize = 20) {
  const where = { userId }
  const [total, list] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { messages: true } } },
    }),
  ])
  return {
    list: list.map(toConversationSummary),
    total,
    page,
    pageSize,
  }
}

/** 会话详情（含全部消息） */
export async function getConversation(userId: number, conversationId: number) {
  await findOwnedConversation(userId, conversationId)
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
}

/** 重命名会话 */
export async function renameConversation(userId: number, conversationId: number, title: string) {
  const trimmed = title?.trim()
  if (!trimmed) throw new ValidationError('标题不能为空')
  await findOwnedConversation(userId, conversationId)
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { title: trimmed.slice(0, 50) },
    select: { id: true, title: true, updatedAt: true },
  })
}

/** 删除会话（级联删除消息） */
export async function deleteConversation(userId: number, conversationId: number) {
  await findOwnedConversation(userId, conversationId)
  await prisma.conversation.delete({ where: { id: conversationId } })
}

/** 校验并写入一条用户消息 */
export async function addUserMessage(conversationId: number, content: string) {
  const trimmed = content?.trim()
  if (!trimmed) throw new ValidationError('消息内容不能为空')
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(`消息内容过长（最多 ${MAX_MESSAGE_LENGTH} 字符）`)
  }
  return prisma.message.create({
    data: { conversationId, role: 'user', content: trimmed },
  })
}

/** 追加一条助手消息（流结束后写入完整内容），并刷新会话 updatedAt */
export async function addAssistantMessage(conversationId: number, content: string) {
  const trimmed = content?.trim()
  if (!trimmed) return null
  const message = await prisma.message.create({
    data: { conversationId, role: 'assistant', content: trimmed },
  })
  // 触发会话 updatedAt 刷新
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {},
  })
  return message
}

/** 组装发送消息所需上下文（该会话最近 N 条历史） */
async function buildContextMessages(conversationId: number): Promise<ChatCompletionMessage[]> {
  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: MAX_CONTEXT_MESSAGES,
    select: { role: true, content: true },
  })
  // 倒序取出后需要反转回时间正序
  return history
    .reverse()
    .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
}

/**
 * 发送消息核心流程：
 * 1. 校验会话归属
 * 2. 用户消息入库
 * 3. 组装上下文（含刚写入的用户消息）
 * 4. 返回 { userMessage, stream } — stream 为 AsyncGenerator，调用方负责逐块转发
 */
export async function sendMessage(userId: number, conversationId: number, content: string) {
  await findOwnedConversation(userId, conversationId)
  const userMessage = await addUserMessage(conversationId, content)

  const context = await buildContextMessages(conversationId)
  const stream = streamChatCompletion(context)

  return { userMessage, stream }
}
