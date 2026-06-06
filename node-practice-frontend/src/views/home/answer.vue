<template>
  <div class="note-page">
    <!-- <van-nav-bar :title="storeTitle" left-arrow @click-left="onBack" /> -->

    <div class="xh-note-tip">由于小红书分享暂停接入，无法一键跳转小红书，敬请期待！</div>

    <div class="result-card">
      <div class="gen-status">
        <img src="./title-icon.png" alt="sparkle" class="sparkle-icon" />
        <span>{{ generating ? '正在生成小红书笔记...' : '已自动生成小红书笔记' }}</span>
      </div>
      <div class="divider"></div>
      <div class="result-title">{{ titleText }}</div>
      <div class="result-content">
        {{ processedResult }}
        <span v-if="generating" class="cursor">|</span>
      </div>
    </div>

    <div class="bottom-safe" />
    <div class="thinking-bottom result-bottom">
      <van-button
        class="btn-switch"
        type="primary"
        plain
        round
        @click="onSwitch"
        :disabled="isSwitchDisabled"
      >
        换一篇{{ switchCountText }}
      </van-button>
      <van-button
        class="btn-copy"
        type="primary"
        round
        @click="onCopy"
        :disabled="!result || generating"
      >
        复制笔记去平台发布
      </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onActivated, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getHeaderInfo, formatRequestData } from '@/utils/service/utils'

const route = useRoute()
const router = useRouter()

// 从路由接收参数
const storeTitle = computed(() => String(route.query.storeName || '笔记'))
const topic = computed(() => String(route.query.topic || ''))
const storeId = computed(() => String(route.query.storeId || ''))
const keywordList = computed(() => {
  const k = route.query.keywords
  const str = Array.isArray(k) ? k.join(',') : String(k || '')
  return str
    ? str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
})

// 标题：从生成的内容中提取，如果没有则使用默认格式
const titleText = computed(() => {
  // 尝试从生成的内容中提取标题
  if (result.value) {
    // 查找"标题:"后面的内容作为标题
    const titleMatch = result.value.match(/标题[:：]\s*(.+?)(?=\n|$)/)
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim()
    }

    // 如果没有找到"标题:"，尝试提取第一行作为标题
    const firstLine = result.value.split('\n')[0].trim()
    if (firstLine && !firstLine.includes('正文')) {
      return firstLine
    }
  }

  // 默认格式
  return ''
})

// 移除 loading 状态，直接显示内容
const result = ref('')

// 处理后的内容：去掉"标题:"和"正文:"标签
const processedResult = computed(() => {
  if (!result.value) return ''

  let content = result.value
  // 去掉第一行
  content = content.split('\n').slice(1).join('\n')
  // 去掉"标题:"行
  content = content.replace(/标题[:：]\s*.+?\n/g, '')

  // 去掉"正文:"标签，但保留后面的内容
  content = content.replace(/正文[:：]\s*/, '')

  // 去掉多余的换行
  content = content.replace(/\n{3,}/g, '\n\n')

  return content.trim()
})

// 流式处理相关状态
const generating = ref(false)
const abortController = ref<AbortController | null>(null)
const sessionId = ref('')

// 换一篇计数
const switchIndex = ref(1)
const switchTotal = 3
const switchCountText = computed(() => `${switchIndex.value}/${switchTotal}`)

// 是否达到最大换篇次数
const isMaxSwitchReached = computed(() => switchIndex.value >= switchTotal)

// 换篇按钮是否应该禁用
const isSwitchDisabled = computed(() => generating.value || isMaxSwitchReached.value)

// 添加一个标记，防止重复调用
const hasGenerated = ref(false)

function onBack() {
  router.back()
}

// SSE 流式处理 - noteGenerate
function openEventSourceGenerate(userContent: string, keywords: string[], storeId: string) {
  // 如有正在进行的请求，先中止
  closeEventSource()

  generating.value = true
  result.value = '' // 清空之前的内容
  abortController.value = new AbortController()
  const signal = abortController.value.signal

  // 准备请求参数
  const params = { userContent, keywords, storeId }
  const postParams = formatRequestData(params)

  console.log('🚀 ~ noteGenerate 请求参数:', { userContent, keywords, storeId })
  console.log('🚀 ~ 格式化后的请求参数:', postParams)

  const postUrl = new URL('/yk/app/ai/promotion/note/generate', window.location.origin)
  const customHeaders = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    ...getHeaderInfo()
  }

  fetch(postUrl, {
    method: 'POST',
    headers: customHeaders,
    body: JSON.stringify(postParams),
    credentials: 'include',
    signal
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      const processStream = ({
        done,
        value
      }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
        if (done || !generating.value) {
          generating.value = false
          return Promise.resolve()
        }

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 解析 SSE 行：以 data: 开头
        if (buffer.includes('data:')) {
          messageCore(buffer)

          // 清理 buffer：保留未完整的尾部
          const lastDataIndex = buffer.lastIndexOf('data:')
          const lastNewlineIndex = buffer.lastIndexOf('\n\n')
          if (lastNewlineIndex > lastDataIndex) {
            buffer = ''
          } else {
            buffer = buffer.substring(lastDataIndex)
          }
        }

        return reader.read().then(processStream)
      }

      return reader.read().then(processStream)
    })
    .catch((error) => {
      // 若是主动中止，无需提示为错误
      if (error && error.name === 'AbortError') {
        console.log('用户主动停止流式请求')
      } else {
        console.error('SSE stream error:', error)
        showToast('生成失败，请稍后重试')
      }
      generating.value = false
    })
}

// 解析每一段 SSE 数据
function messageCore(data: string) {
  const lines = data.split('\n')
  console.log('🚀 ~ messageCore ~ lines:', lines)
  for (const line of lines) {
    if (!line.startsWith('data:')) continue
    const jsonStr = line.substring(5).trim()
    if (!jsonStr) continue

    if (jsonStr === '[DONE]') {
      generating.value = false
      return
    }

    try {
      const payload = JSON.parse(jsonStr)
      console.log('📦 收到流式数据:', payload)

      // 收集内容片段，实时显示
      if (payload.content) {
        console.log('📝 内容片段:', payload.content)
        result.value += payload.content
      }

      // 收集 sessionId
      if (payload.sessionId) {
        console.log('🔑 会话ID:', payload.sessionId)
        sessionId.value = payload.sessionId
      }

      if (payload.done === true) {
        generating.value = false
      }
    } catch (e) {
      console.log('🚀 ~ messageCore ~ e:', e)
      // 非 JSON，当作纯文本处理
      console.log('📄 纯文本数据:', jsonStr)
      // result.value += jsonStr
    }
  }
}

// 停止/关闭 SSE
function closeEventSource() {
  generating.value = false
  if (abortController.value) {
    try {
      abortController.value.abort()
    } catch (e) {
      console.warn('中止请求时出错:', e)
    }
    abortController.value = null
  }
}

// 初始生成
async function generate() {
  const userContent = topic.value
  const keywords = keywordList.value
  const currentStoreId = storeId.value

  if (!userContent) {
    showToast('缺少用户输入内容')
    return
  }

  console.log('🎯 开始调用 noteGenerate 流式接口')
  console.log('📝 用户内容:', userContent)
  console.log('🏷️ 关键词:', keywords)
  console.log('🏪 门店ID:', currentStoreId)

  // 标记已生成，防止重复调用
  hasGenerated.value = true
  // 重置换篇计数
  switchIndex.value = 1

  // 调用流式接口
  openEventSourceGenerate(userContent, keywords, currentStoreId)
}

// 检查是否需要生成内容
function checkAndGenerate() {
  console.log('🔍 检查是否需要生成内容')
  console.log('📊 当前状态:', {
    hasGenerated: hasGenerated.value,
    generating: generating.value,
    topic: topic.value,
    result: result.value
  })

  // 如果有用户输入内容且还没有生成过，则开始生成
  if (topic.value && !hasGenerated.value && !generating.value) {
    console.log('✅ 满足生成条件，开始生成')
    generate()
  } else {
    console.log('❌ 不满足生成条件')
  }
}

// 修改 openEventSourceRegenerate 函数，传递 sessionId 和 storeId
function openEventSourceRegenerate(params: {
  userContent: string
  keywords: string[]
  sessionId?: string
  storeId?: string
}) {
  const url = '/yk/app/ai/promotion/note/regenerate'

  generating.value = true
  result.value = '' // 清空之前的内容

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream'
  }

  // 使用 getHeaderInfo 获取鉴权头
  try {
    const headerInfo = getHeaderInfo()
    Object.assign(headers, headerInfo)
  } catch (error) {
    console.log('获取鉴权头失败:', error)
  }

  // 构建请求体，包含 sessionId 和 storeId
  const requestData: any = {
    userContent: params.userContent,
    keywords: params.keywords
  }

  if (params.sessionId) {
    requestData.sessionId = params.sessionId
  }

  if (params.storeId) {
    requestData.storeId = params.storeId
  }

  const body = JSON.stringify(formatRequestData(requestData))

  console.log('🔄 noteRegenerate 请求参数:', requestData)

  fetch(url, { method: 'POST', headers, body, credentials: 'include' })
    .then((response) => {
      if (!response.ok || !response.body) throw new Error(`HTTP error! status: ${response.status}`)
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      const read = (): any =>
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('[noteRegenerate] stream finished')
            generating.value = false
            return
          }
          const chunk = decoder.decode(value, { stream: true })

          // 逐行解析 data: 前缀
          chunk.split('\n').forEach((line) => {
            if (!line.startsWith('data:')) return
            const dataStr = line.slice(5).trim()
            if (!dataStr) return

            if (dataStr === '[DONE]') {
              console.log('[noteRegenerate] [DONE]')
              generating.value = false
              return
            }

            try {
              const json = JSON.parse(dataStr)
              console.log('[noteRegenerate] event(JSON):', json)
              // 若后端包含 content 字段，则实时展示
              if (typeof json.content === 'string') {
                result.value += json.content
              }
            } catch {
              // 纯文本行
              console.log('[noteRegenerate] event(text):', dataStr)
              // result.value += dataStr
            }
          })

          return read()
        })

      return read()
    })
    .catch((err) => {
      console.error('[noteRegenerate] stream error:', err)
      generating.value = false
      showToast('生成失败，请稍后重试')
    })
}

function onSwitch() {
  if (generating.value) {
    showToast('正在生成中，请稍候...')
    return
  }

  switchIndex.value += 1

  // 传递 sessionId 和 storeId 给 noteRegenerate
  openEventSourceRegenerate({
    userContent: topic.value,
    keywords: keywordList.value,
    sessionId: sessionId.value,
    storeId: storeId.value
  })
}

async function onCopy() {
  try {
    const text = result.value || ''
    if (!text) {
      showToast('暂无可复制内容')
      return
    }
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    showToast('已复制到剪贴板')
  } catch {
    showToast('复制失败，请手动选择复制')
  }
}

// 监听路由变化，当路由参数变化时重新生成
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    console.log('🔄 路由参数变化:', { newQuery, oldQuery })
    // 重置状态
    hasGenerated.value = false
    result.value = ''
    sessionId.value = ''
    switchIndex.value = 1

    // 检查并生成内容
    checkAndGenerate()
  },
  { immediate: true, deep: true }
)

// 页面激活时检查
onActivated(() => {
  console.log('📱 页面激活 (onActivated)')
  if (route.query.storeName) {
    document.title = route.query.storeName as string
  }
  checkAndGenerate()
})

// 组件挂载时检查
onMounted(() => {
  console.log('🏗️ 组件挂载 (onMounted)', route.query)

  checkAndGenerate()
})
</script>

<style lang="scss" scoped>
.note-page {
  min-height: 100vh;
  background: #f6f7f9;

  .bottom-safe {
    height: 8px;
  }

  .xh-note-tip {
    text-align: center;
    color: #999999;
    font-size: 22px;
    margin: 24px 0 24px;
  }

  .thinking-card {
    background: #fff;
    border-radius: 16px;
    margin: 0 16px;
    padding: 20px 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #4e5969;
  }

  .gen-card {
    background: #fff;
    border-radius: 16px;
    margin: 0 32px 24px;
    padding: 28px 32px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #999999;
    font-size: 28px;
    font-weight: 500;
    .sparkle-icon {
      width: 32px;
      height: 32px;
    }
  }

  .result-card {
    background: #fff;
    border-radius: 16px;
    margin: 0 32px 170px;
    padding: 20px 16px;
    .gen-status {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #999999;
      font-size: 26px;
      padding: 12px 12px 8px;
      .sparkle-icon {
        width: 28px;
        height: 28px;
      }
    }
    .divider {
      height: 1px;
      background: #f0f0f0;
      margin: 8px 12px 0;
    }
  }
  .result-title {
    font-size: 36px;
    line-height: 44px;
    font-weight: 500;
    color: #1f2329;
    margin: 40px 28px 40px;
  }
  .result-content {
    white-space: pre-wrap;
    color: #3d3d3d;
    line-height: 44px;
    font-size: 28px;
    font-weight: 500;
    margin: 40px 28px 40px;
  }

  .thinking-bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: max(env(safe-area-inset-bottom), 8px);
    display: flex;
    gap: 22px;
    padding: 0 28px;
  }
  .btn-switch {
    flex: 0 0 auto;
    width: 262px;
    height: 80px;
    border-radius: 44px;
    color: #0088fe;
    border-color: #0088fe;
    background: #fff;
    font-size: 32px;
  }
  .btn-copy {
    flex: 1;
    height: 80px;
    border-radius: 44px;
    background: #0088fe;
    border: none;
    opacity: 1;
    font-size: 32px;
    &:disabled {
      // color: #ccc;
      // border-color: #ccc;
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.497), rgba(255, 255, 255, 0.497)),
        #0088fe;
    }
  }
}
</style>
