<template>
  <div class="category-detail-view">
    <div class="page-header">
      <el-button link class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回分类
      </el-button>
      <h1>{{ category?.name || '分类详情' }}</h1>
      <p v-if="category">{{ postCount }} 篇文章</p>
    </div>

    <div class="article-list" v-loading="loading">
      <el-empty v-if="!loading && posts.length === 0" description="该分类下暂无文章" />

      <el-card
        v-for="post in posts"
        :key="post.id"
        class="article-card"
        shadow="hover"
        @click="goToArticle(post.id)"
      >
        <template #header>
          <div class="article-header">
            <span class="article-title">{{ post.title }}</span>
            <span class="article-date">{{ formatDate(post.createdAt) }}</span>
          </div>
        </template>
        <div class="article-summary">{{ post.description || '暂无摘要' }}</div>
        <div class="article-meta">
          <span class="article-author">作者：{{ post.user?.name || '未知' }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getCategoryByIdApi, type CategoryDetail } from '@/api/category'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const category = ref<CategoryDetail | null>(null)

const posts = computed(() => category.value?.posts ?? [])
const postCount = computed(() => posts.value.length)

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN')
}

function goBack() {
  router.push('/category')
}

function goToArticle(id: number) {
  router.push(`/article/${id}`)
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) {
    router.push('/category')
    return
  }

  loading.value = true
  try {
    const res = await getCategoryByIdApi(id)
    if (res.success) {
      category.value = res.data
    } else {
      router.push('/category')
    }
  } catch {
    router.push('/category')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.category-detail-view {
  .page-header {
    background-color: #fff;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    position: relative;

    .back-btn {
      position: absolute;
      left: 24px;
      top: 24px;
      font-size: 14px;
    }

    h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #666;
    }
  }

  .article-list {
    min-height: 120px;
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

    .article-meta {
      font-size: 13px;
      color: #999;
    }
  }
}
</style>
