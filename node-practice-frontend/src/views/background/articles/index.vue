<template>
  <div class="articles-view">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <el-button type="primary" size="small" @click="goToCreate">新增文章</el-button>
        </div>
      </template>

      <el-table :data="articles" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" min-width="100" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="180">
          <template #default="{ row }">
            {{ row.authorName }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goToEdit(row.id)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllPostsApi, deletePostApi, type Post } from '@/api/article'

const router = useRouter()
const articles = ref<Post[]>([])
const loading = ref(false)

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN')
}

async function fetchArticles() {
  loading.value = true
  try {
    const res = await getAllPostsApi()
    if (res.success) {
      articles.value = res.data
    }
  } catch (err) {
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

function goToCreate() {
  router.push('/background/content/articles/create')
}

function goToEdit(id: number) {
  router.push(`/background/content/articles/edit/${id}`)
}

async function handleDelete(row: Post) {
  try {
    await ElMessageBox.confirm('确认删除该文章？', '提示', { type: 'warning' })
    const res = await deletePostApi(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchArticles()
    }
  } catch (err) {
    // 取消删除或删除失败
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped lang="scss">
.articles-view {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }
}
</style>
