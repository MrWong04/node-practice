<template>
  <div class="article-detail-view">
    <div class="article-meta">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-info">
        <span class="author">作者：{{ article.author }}</span>
        <span class="date">{{ formatDate(article.createdAt) }}</span>
      </div>
    </div>
    <el-divider />
    <div class="markdown-body" v-html="renderedContent"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { getPostByIdApi, type Post } from '@/api/article'

const route = useRoute()
const router = useRouter()

const article = ref<Post>({
  id: 0,
  title: '',
  content: '',
  author: '',
  createdAt: '',
  updatedAt: '',
  authorId: null,
  authorName: '',
  user: null
})

const renderedContent = computed(() => {
  return article.value.content ? marked.parse(article.value.content, { async: false }) : ''
})

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) {
    router.push('/')
    return
  }
  try {
    const res = await getPostByIdApi(id)
    if (res.success) {
      article.value = res.data
    } else {
      router.push('/')
    }
  } catch (err) {
    console.error('获取文章详情失败', err)
    router.push('/')
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/markdown.scss' as *;

.article-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;

  .article-meta {
    text-align: center;
    margin-bottom: 20px;

    .article-title {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .article-info {
      color: #999;
      font-size: 14px;

      .author {
        margin-right: 16px;
      }
    }
  }
}
</style>
