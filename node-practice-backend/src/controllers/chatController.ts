import { Request, Response, NextFunction } from 'express'
import { successResponse } from '../utils/response'
import { ValidationError } from '../utils/errors'
import * as chatService from '../services/chatService'

// ==========================================================================
// Chat Controller — 请求解析、响应封装、SSE 流式转发
// ==========================================================================

/** 解析 :id 路径参数（Express 5 类型为 string | string[]） */
function parseId(raw: string | string[]): number {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('非法的会话 ID')
  }
  return id
}

export async function createConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, firstMessage } = req.body ?? {}
    const conversation = await chatService.createConversation(req.user!.userId, title, firstMessage)
    res.status(201).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))
    const result = await chatService.listConversations(req.user!.userId, page, pageSize)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export async function getConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const conversation = await chatService.getConversation(req.user!.userId, parseId(req.params.id))
    res.json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export async function renameConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await chatService.renameConversation(
      req.user!.userId,
      parseId(req.params.id),
      req.body?.title
    )
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export async function deleteConversation(req: Request, res: Response, next: NextFunction) {
  try {
    await chatService.deleteConversation(req.user!.userId, parseId(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

/**
 * 发送消息（SSE 流式）
 * 流程：入库用户消息 → 逐块转发 DeepSeek 增量 → 完整回复入库 → done 事件
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId
    const conversationId = parseId(req.params.id)
    const { content } = req.body ?? {}

    const { userMessage, stream } = await chatService.sendMessage(userId, conversationId, content)

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    // 先发送用户消息回执（含数据库 id）
    res.write(`event: user_message\ndata: ${JSON.stringify(userMessage)}\n\n`)

    let fullContent = ''
    try {
      for await (const chunk of stream) {
        fullContent += chunk.content
        res.write(`event: message\ndata: ${JSON.stringify(chunk)}\n\n`)
      }

      const assistantMessage = await chatService.addAssistantMessage(conversationId, fullContent)
      res.write(
        `event: done\ndata: ${JSON.stringify({ messageId: assistantMessage?.id ?? null })}\n\n`
      )
      res.end()
    } catch (streamErr) {
      // 上游流式错误：通过 SSE error 事件通知前端，不落库不完整回复
      const msg = streamErr instanceof Error ? streamErr.message : 'AI 回复生成失败'
      res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`)
      res.end()
    }
  } catch (err) {
    next(err)
  }
}
