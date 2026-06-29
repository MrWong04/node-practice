<template>
  <div class="home-view">
    <div class="welcome-card">
      <h1>欢迎来到个人博客</h1>
      <p>这是一个简洁的博客系统，记录技术、生活与思考。</p>
    </div>

    <div class="article-list">
      <h2>最新文章</h2>
      <el-card
        v-for="article in articles"
        :key="article.id"
        class="article-card"
        shadow="hover"
        @click="goToDetail(article.id)"
      >
        <template #header>
          <div class="article-header">
            <span class="article-title">{{ article.title }}</span>
            <span class="article-date">{{ formatDate(article.createdAt) }}</span>
          </div>
        </template>
        <div class="article-summary">{{ article.description }}</div>
        <div class="article-meta">
          <span class="article-author">作者：{{ article.authorName }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllPostsApi, type Post } from '@/api/article'

const router = useRouter()
const articles = ref<Post[]>([])

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN')
}

function summaryOf(content: string): string {
  // 截取纯文本前 120 字作为摘要
  const text = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
  return text.length > 120 ? text.slice(0, 120) + '…' : text
}

function goToDetail(id: number) {
  router.push(`/article/${id}`)
}

onMounted(async () => {
  try {
    const res = await getAllPostsApi({ pageSize: 100 })
    if (res.success) {
      articles.value = res.data.items
    }
  } catch (err) {
    console.error('获取文章列表失败', err)
  }
})
</script>

<style scoped lang="scss">
.home-view {
  .welcome-card {
    background-color: #fff;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    margin-bottom: 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 12px;
    }

    p {
      font-size: 16px;
      color: #666;
    }
  }

  .article-list {
    h2 {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
      padding-left: 8px;
      border-left: 4px solid #409eff;
    }
  }

  .article-card {
    margin-bottom: 16px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .article-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .article-date {
        font-size: 13px;
        color: #999;
      }
    }

    .article-summary {
      color: #666;
      line-height: 1.6;
      margin-bottom: 12px;
    }

    .article-tags {
      .tag-item {
        margin-right: 8px;
      }
    }
  }
}
</style>
