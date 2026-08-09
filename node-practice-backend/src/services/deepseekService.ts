import { AppError } from '../utils/errors'
import { DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL } from '../config'

// ==========================================================================
// DeepSeek Service — OpenAI 兼容 API 调用（支持 SSE 流式）
// ==========================================================================

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionChunk {
  id: string
  content: string
}

/**
 * 调用 DeepSeek 流式接口，异步生成器逐个产出内容增量
 */
export async function* streamChatCompletion(
  messages: ChatCompletionMessage[]
): AsyncGenerator<ChatCompletionChunk> {
  if (!DEEPSEEK_API_KEY) {
    throw new AppError('服务端未配置 DEEPSEEK_API_KEY，请先在 .env 中配置', 500)
  }

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new AppError(
      `DeepSeek API 调用失败 (HTTP ${response.status}): ${errText.slice(0, 200)}`,
      502
    )
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // 按行切分 SSE 数据（处理分包/粘包）
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line.startsWith('data:')) continue // 忽略注释与事件行

      const payload = line.slice(5).trim()
      if (payload === '[DONE]') return

      try {
        const json = JSON.parse(payload)
        const content: string | undefined = json.choices?.[0]?.delta?.content
        if (content) {
          yield { id: json.id ?? '', content }
        }
      } catch {
        // 忽略无法解析的行（保持流健壮）
      }
    }
  }
}
