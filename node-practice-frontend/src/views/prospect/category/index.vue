<template>
  <div class="category-view">
    <div class="page-header">
      <h1>文章分类</h1>
      <p>按主题浏览所有文章</p>
    </div>

    <div class="category-list" v-loading="loading">
      <el-empty v-if="!loading && categories.length === 0" description="暂无分类" />

      <el-card
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        shadow="hover"
        @click="goToCategory(category.id)"
      >
        <div class="category-info">
          <el-icon class="category-icon"><Folder /></el-icon>
          <div class="category-detail">
            <h3>{{ category.name }}</h3>
            <span class="category-count">{{ category._count?.posts ?? 0 }} 篇文章</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Folder } from '@element-plus/icons-vue'
import { getAllCategoriesApi, type Category } from '@/api/category'

const router = useRouter()
const categories = ref<Category[]>([])
const loading = ref(false)

function goToCategory(id: number) {
  router.push(`/category/${id}`)
}

async function fetchCategories() {
  loading.value = true
  try {
    const res = await getAllCategoriesApi({ pageSize: 100 })
    if (res.success) {
      categories.value = res.data.items
    }
  } catch {
    categories.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.category-view {
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

  .category-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    min-height: 120px;
  }

  .category-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 16px;

      .category-icon {
        font-size: 32px;
        color: #409eff;
      }

      .category-detail {
        h3 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #333;
        }

        .category-count {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
}
</style>
