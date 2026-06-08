<template>
  <div class="dashboard-view">
    <div class="page-header">
      <h1>数据概览</h1>
      <p>欢迎回到后台管理系统，以下是今日核心数据。</p>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">128</div>
          <div class="stat-label">文章总数</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>较上月 +12%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">4,520</div>
          <div class="stat-label">今日访问</div>
          <div class="stat-trend up">
            <el-icon><ArrowUp /></el-icon>
            <span>较昨日 +8%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">86</div>
          <div class="stat-label">评论数</div>
          <div class="stat-trend down">
            <el-icon><ArrowDown /></el-icon>
            <span>较昨日 -3%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">12</div>
          <div class="stat-label">待审文章</div>
          <div class="stat-trend">
            <span>暂无变化</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近一周访问趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><TrendCharts /></el-icon>
            <p>图表组件占位区</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>分类文章占比</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-icon class="chart-icon"><PieChart /></el-icon>
            <p>图表组件占位区</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="latest-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>最近发布</span>
          <el-button text type="primary">查看全部</el-button>
        </div>
      </template>
      <el-table :data="latestArticles" style="width: 100%">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="date" label="发布时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUp, ArrowDown, TrendCharts, PieChart } from '@element-plus/icons-vue'

const latestArticles = ref([
  {
    title: 'Vue 3 组合式 API 最佳实践',
    category: '前端开发',
    date: '2024-06-01 10:30',
    status: '已发布',
    statusType: 'success'
  },
  {
    title: 'TypeScript 高级类型体操',
    category: 'TypeScript',
    date: '2024-05-28 14:20',
    status: '已发布',
    statusType: 'success'
  },
  {
    title: 'Node.js 性能优化指南',
    category: 'Node.js',
    date: '2024-05-20 09:15',
    status: '审核中',
    statusType: 'warning'
  },
  {
    title: '前端工程化实践',
    category: '前端开发',
    date: '2024-04-15 16:45',
    status: '已发布',
    statusType: 'success'
  }
])
</script>

<style scoped lang="scss">
.dashboard-view {
  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px;
      font-size: 22px;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #606266;
    }
  }

  .stat-row {
    margin-bottom: 16px;

    .stat-card {
      margin-bottom: 16px;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 12px;
      }

      .stat-trend {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #909399;

        &.up {
          color: #67c23a;
        }

        &.down {
          color: #f56c6c;
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;

    .chart-card {
      margin-bottom: 16px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
      }

      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 220px;
        color: #909399;

        .chart-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        p {
          margin: 0;
          font-size: 14px;
        }
      }
    }
  }

  .latest-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
  }
}
</style>
