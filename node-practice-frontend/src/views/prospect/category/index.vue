<template>
  <div class="category-view">
    <div class="page-header">
      <h1>文章分类</h1>
      <p>按主题浏览所有文章</p>
    </div>

    <div class="category-list">
      <el-card
        v-for="(category, index) in categories"
        :key="index"
        class="category-card"
        shadow="hover"
      >
        <div class="category-info">
          <el-icon class="category-icon"><Folder /></el-icon>
          <div class="category-detail">
            <h3>{{ category.name }}</h3>
            <span class="category-count">{{ category.count }} 篇文章</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Folder } from '@element-plus/icons-vue'

const categories = ref([
  { name: '前端开发', count: 12 },
  { name: '后端开发', count: 8 },
  { name: '数据库', count: 5 },
  { name: ' DevOps', count: 3 },
  { name: '随笔', count: 6 }
])
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
  }

  .category-card {
    cursor: pointer;

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
