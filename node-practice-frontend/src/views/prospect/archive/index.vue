<template>
  <div class="archive-view">
    <div class="page-header">
      <h1>文章归档</h1>
      <p>按时间线回顾所有文章</p>
    </div>

    <div class="archive-timeline">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in archives"
          :key="index"
          :timestamp="item.date"
          placement="top"
        >
          <el-card class="archive-card">
            <h4>{{ item.title }}</h4>
            <p>{{ item.summary }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const archives = ref([
  {
    title: 'Vue 3 组合式 API 最佳实践',
    date: '2024-06-01',
    summary: '详细介绍了 Vue 3 组合式 API 的使用方法与核心概念。'
  },
  {
    title: 'TypeScript 高级类型体操',
    date: '2024-05-28',
    summary: '深入探讨 TypeScript 中的高级类型操作。'
  },
  {
    title: 'Node.js 性能优化指南',
    date: '2024-05-20',
    summary: '从实际项目出发，分享 Node.js 性能优化经验。'
  },
  {
    title: '前端工程化实践',
    date: '2024-04-15',
    summary: '关于前端工程化体系建设的一些思考。'
  }
])
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
