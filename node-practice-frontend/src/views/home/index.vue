<template>
  <div class="note-page">
    <!-- <van-nav-bar :title="storeTitle" /> -->

    <div class="card">
      <div class="card-title">请输入笔记主题</div>
      <van-field
        v-model="topic"
        type="textarea"
        :rows="6"
        show-word-limit
        :autosize="{ minHeight: 140, maxHeight: 140 }"
        placeholder="描述一下笔记的主题，如“这家店我个人很喜欢番茄锅底，这家是店员帮忙煮好上桌，直接开吃，环境也很特别，太快乐啦”"
        class="topic-input"
        maxlength="200"
        ref="topicInput"
      />
      <div class="sub-tip">选择关键词加入笔记，由AI润色</div>

      <!-- 动态渲染主题分类和关键词 -->
      <div class="group-container">
        <div class="group" v-for="(config, index) in keywordConfigs" :key="index">
          <div class="group-title">{{ config.categoryName }}</div>
          <div class="chips">
            <div
              v-for="keyword in config.keywords"
              :key="keyword"
              class="chip"
              @click="addKeywordToInput(keyword, $event)"
            >
              {{ keyword }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-safe" />
    <!-- <div class="bottom-fixed"> -->
    <!-- 添加AI提示文字 -->
    <div class="ai-disclaimer">内容由AI生成，生成文案仅供参考</div>
    <van-button type="primary" block round @click="onPolish" class="polish-button">
      AI帮我润色
    </van-button>
    <!-- </div> -->
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onActivated, ref, onDeactivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getConfig } from '@/api/user-center'
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()

const router = useRouter()
const route = useRoute()
const storeName = ref('')
const storeTitle = computed(() => storeName.value)
const cardTitle = ref<HTMLElement | null>(null)

const storeIdRef = computed(() => {
  const storeId = String(route.query.storeId || '')
  return storeId
})

// 添加响应式数据
const topic = ref('')
const keywordConfigs = ref<Array<{ categoryName: string; keywords: string[] }>>([])
const selectedKeywords = ref<Record<string, Set<string>>>({})

onActivated(() => {
  fetchAndApplyKeywordConfig()
  document.body.addEventListener('touchstart', function () {}, false)
})
onDeactivated(() => {
  document.body.removeEventListener('touchstart', function () {}, false)
})

// 获取并应用关键词配置
async function fetchAndApplyKeywordConfig() {
  try {
    // 优先使用来自路由/缓存的 storeId；没有则回退到固定值
    const FALLBACK_STORE_ID = ''
    const currentStoreId = storeIdRef.value || FALLBACK_STORE_ID
    if (!currentStoreId) return
    const res = await getConfig({ storeId: currentStoreId })
    console.log('getConfig 返回数据:', res.data)
    localStorage.setItem(
      'trackingStoreInfo',
      JSON.stringify({ storeName: res?.data?.storeName, storeId: res?.data?.storeId })
    )
    // 设置title为storeName
    storeName.value = res?.data?.storeName || '有餐'
    document.title = res?.data?.storeName || '有餐'
    // 安全地获取 keywordConfigs
    const configs = res?.data?.keywordConfigs || []
    if (Array.isArray(configs) && configs.length > 0) {
      keywordConfigs.value = configs.map((config: any) => ({
        categoryName: config?.categoryName || '',
        keywords: Array.isArray(config?.keywords) ? config.keywords : []
      }))
      console.log('处理后的 keywordConfigs:', keywordConfigs.value)
    } else {
      console.warn('未找到有效的 keywordConfigs 数据:', res)
      keywordConfigs.value = []
    }
  } catch (error) {
    console.error('获取关键词配置失败:', error)
    keywordConfigs.value = []
    showToast('获取配置失败，请重试')
  }
}

// 判断关键词是否被选中
function isSelected(categoryName: string, keyword: string): boolean {
  if (!selectedKeywords.value[categoryName]) {
    selectedKeywords.value[categoryName] = new Set()
  }
  return selectedKeywords.value[categoryName].has(keyword)
}

// 切换关键词选中状态
function toggle(categoryName: string, keyword: string): void {
  if (!selectedKeywords.value[categoryName]) {
    selectedKeywords.value[categoryName] = new Set()
  }

  if (selectedKeywords.value[categoryName].has(keyword)) {
    selectedKeywords.value[categoryName].delete(keyword)
  } else {
    selectedKeywords.value[categoryName].add(keyword)
  }
}

// 收集所有选中的关键词
function collectSelectedKeywords(): string[] {
  const allSelected: string[] = []
  Object.values(selectedKeywords.value).forEach((set) => {
    allSelected.push(...Array.from(set))
  })
  return allSelected
}
const topicInput = ref<any>(null)

// 添加关键词到输入框
function addKeywordToInput(keyword: string, event: Event) {
  // highlightedKeyword.value = keyword
  topic.value += keyword + '，'
  // 聚焦到输入框
}

// 修改后的 onPolish 方法 - 直接跳转
function onPolish() {
  // @ts-ignore
  instance?.proxy?.$trackEvent('10014')
  const userContent = topic.value.trim()
  const keywords = collectSelectedKeywords()
  const FIXED_STORE_ID = storeIdRef.value

  // 校验
  if (!userContent) {
    showToast('请先输入主题')
    return
  }

  console.log('🎯 跳转到 answer 页面')
  console.log('📝 用户内容:', userContent)
  console.log('🏷️ 关键词:', keywords)
  console.log('🏪 门店ID:', FIXED_STORE_ID)

  // 直接跳转到 answer 页面，传递参数
  router.push({
    path: '/answer',
    query: {
      storeName: storeTitle.value,
      topic: userContent,
      keywords: '',
      storeId: FIXED_STORE_ID
    }
  })
}
</script>

<style lang="scss" scoped>
.note-page {
  min-height: 98vh;
  background: #f6f7f9;

  .card {
    background: #fff;
    border-radius: 24px;
    padding: 32px;
    margin: 24px 24px 0;
  }

  .card-title {
    font-size: 28px;
    font-weight: 500;
    color: #1f2329;
    margin-bottom: 16px;
  }

  .topic-input {
    background: #f7f8fa;
    border-radius: 16px;
    :deep(.van-field__control) {
      line-height: 1.6;
    }
  }

  .sub-tip {
    margin-top: 16px;
    font-size: 22px;
    color: #9aa0a6;
  }
  .group-container {
    height: 570px;
    overflow-y: auto;
    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
  .group {
    margin-top: 32px;
  }

  .group-title {
    margin-bottom: 20px;
    color: #1f2329;
    font-size: 28px;
    font-weight: 500;
  }

  .chips {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    /* 隐藏滚动条但保持滚动功能 */
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .chip {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 6px;
    border: 2px solid #e5e6eb;
    background: #f7f8f9;
    color: #999999;
    font-size: 24px;
    line-height: 1;
    margin-right: 20px;
    vertical-align: top;
    cursor: pointer;
    transition: opacity 0.2s;
    // user-select: none;
    position: relative;
    -webkit-appearance: none;
    -webkit-text-size-adjust: 100%;
    &:active::before {
      opacity: 0.2;
    }
    // &:hover::before {
    //   opacity: 0.2;
    // }

    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      background-color: #0088fe;
      border: inherit;
      border-color: #0088fe;
      color: #fff;
      border-radius: inherit;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      opacity: 0;
      content: ' ';
    }
  }

  .ai-disclaimer {
    text-align: center;
    font-size: 20px;
    color: #999;
    margin-top: 12px;
    line-height: 1.4;
  }

  .polish-button {
    position: fixed;
    bottom: 50px;
    left: 0;
    right: 0;
    height: 88px;
    font-size: 32px;
    font-weight: 500;
    background: #0088fe;
    border: none;
    border-radius: 44px;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    margin: 0 auto 0;
    width: 330px;
    display: block;

    &:active {
      transform: translateY(1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}
</style>
