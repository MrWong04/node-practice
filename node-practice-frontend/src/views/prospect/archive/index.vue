<template>
  <div class="archive-view">
    <div class="page-header">
      <h1>文章归档</h1>
      <p>按时间线回顾所有文章</p>
    </div>

    <div class="archive-timeline" v-loading="loading">
      <el-timeline v-if="groupedPosts.length > 0">
        <el-timeline-item
          v-for="(group, index) in groupedPosts"
          :key="index"
          :timestamp="group.date"
          placement="top"
        >
          <el-card
            v-for="post in group.posts"
            :key="post.id"
            class="archive-card"
            @click="goToDetail(post.id)"
          >
            <h4>{{ post.title }}</h4>
            <p>{{ post.description || summaryOf(post.content) }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllPostsApi, type Post } from '@/api/article'

const router = useRouter()
const posts = ref<Post[]>([])
const loading = ref(false)

// 按日分组文章
const groupedPosts = computed(() => {
  const groups: Record<string, { date: string; posts: Post[] }> = {}

  posts.value.forEach((post) => {
    const date = new Date(post.createdAt)
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    if (!groups[key]) {
      groups[key] = { date: key, posts: [] }
    }
    groups[key].posts.push(post)
  })

  // 按日期倒序排列
  return Object.entries(groups)
    .map(([date, data]) => ({ date, posts: data.posts.sort((a, b) => b.id - a.id) }))
    .sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.match(/(\d+)年(\d+)月(\d+)日/) || []
      const [yearB, monthB, dayB] = b.date.match(/(\d+)年(\d+)月(\d+)日/) || []
      const dateA = new Date(Number(yearA), Number(monthA) - 1, Number(dayA))
      const dateB = new Date(Number(yearB), Number(monthB) - 1, Number(dayB))
      return dateB.getTime() - dateA.getTime()
    })
})

function summaryOf(content: string): string {
  const text = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
  return text.length > 100 ? text.slice(0, 100) + '…' : text
}

function goToDetail(id: number) {
  router.push(`/article/${id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getAllPostsApi({ pageSize: 100 })
    if (res.success) {
      posts.value = res.data.items
    }
  } catch (err) {
    console.error('获取文章列表失败', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.archive-view {
  .page-header {
    background-color: #fff;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

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

  .archive-timeline {
    padding: 16px;
  }

  .archive-card {
    h4 {
      margin: 0 0 8px;
      font-size: 16px;
      color: #333;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }
}
</style>
