<template>
  <div class="home-view">
    <div class="welcome-card">
      <h1>欢迎来到个人博客</h1>
      <p>这是一个简洁的博客系统，记录技术、生活与思考。</p>
    </div>

    <div class="article-list">
      <h2>最新文章</h2>
      <el-card
        v-for="(article, index) in articles"
        :key="index"
        class="article-card"
        shadow="hover"
      >
        <template #header>
          <div class="article-header">
            <span class="article-title">{{ article.title }}</span>
            <span class="article-date">{{ article.date }}</span>
          </div>
        </template>
        <div class="article-summary">{{ article.summary }}</div>
        <div class="article-tags">
          <el-tag v-for="tag in article.tags" :key="tag" size="small" class="tag-item">
            {{ tag }}
          </el-tag>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const articles = ref([
  {
    title: 'Vue 3 组合式 API 最佳实践',
    date: '2024-06-01',
    summary:
      '本文详细介绍了 Vue 3 组合式 API 的使用方法，包括 setup 函数、响应式 API、生命周期钩子等核心概念。',
    tags: ['Vue', '前端']
  },
  {
    title: 'TypeScript 高级类型体操',
    date: '2024-05-28',
    summary: '深入探讨 TypeScript 中的高级类型操作，包括条件类型、映射类型、模板字面量类型等。',
    tags: ['TypeScript', '进阶']
  },
  {
    title: 'Node.js 性能优化指南',
    date: '2024-05-20',
    summary: '从实际项目出发，分享 Node.js 应用性能优化的经验和技巧，包括内存管理、异步优化等。',
    tags: ['Node.js', '性能']
  }
])
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
