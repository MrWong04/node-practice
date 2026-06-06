<template>
  <div class="dashboard">
    <aside class="sidebar">
      <div class="logo">后台管理系统</div>
      <nav class="menu">
        <router-link to="/" class="menu-item active">
          <span class="icon">📊</span>
          <span>数据概览</span>
        </router-link>
        <router-link to="/" class="menu-item">
          <span class="icon">📋</span>
          <span>内容管理</span>
        </router-link>
        <router-link to="/" class="menu-item">
          <span class="icon">👤</span>
          <span>用户管理</span>
        </router-link>
        <router-link to="/" class="menu-item">
          <span class="icon">⚙️</span>
          <span>系统设置</span>
        </router-link>
      </nav>
    </aside>

    <main class="main">
      <header class="header">
        <h1>数据概览</h1>
        <div class="user-info">
          <span>管理员</span>
          <div class="avatar">A</div>
        </div>
      </header>

      <div class="content">
        <div class="stats-cards">
          <div class="card stat-card">
            <div class="stat-title">总用户数</div>
            <div class="stat-value">12,580</div>
            <div class="stat-trend up">↑ 12.5%</div>
          </div>
          <div class="card stat-card">
            <div class="stat-title">今日访问</div>
            <div class="stat-value">3,245</div>
            <div class="stat-trend up">↑ 8.2%</div>
          </div>
          <div class="card stat-card">
            <div class="stat-title">订单数量</div>
            <div class="stat-value">892</div>
            <div class="stat-trend down">↓ 3.1%</div>
          </div>
          <div class="card stat-card">
            <div class="stat-title">营收金额</div>
            <div class="stat-value">¥ 45,230</div>
            <div class="stat-trend up">↑ 15.8%</div>
          </div>
        </div>

        <div class="card chart-card">
          <h3>最近7天访问趋势</h3>
          <div class="chart-placeholder">
            <div
              v-for="(height, index) in chartData"
              :key="index"
              class="bar"
              :style="{ height: height + '%' }"
            >
              <div class="bar-tooltip">{{ height * 100 }}</div>
            </div>
          </div>
        </div>

        <div class="card table-card">
          <h3>最新动态</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>用户</th>
                <th>操作</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in recentActivities" :key="index">
                <td>{{ item.time }}</td>
                <td>{{ item.user }}</td>
                <td>{{ item.action }}</td>
                <td>
                  <span class="tag" :class="item.status">{{ item.statusText }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const chartData = ref([45, 62, 38, 75, 55, 80, 68])

const recentActivities = ref([
  {
    time: '2024-06-06 14:32',
    user: '张三',
    action: '创建了新订单',
    status: 'success',
    statusText: '成功'
  },
  {
    time: '2024-06-06 13:15',
    user: '李四',
    action: '更新了个人资料',
    status: 'info',
    statusText: '完成'
  },
  {
    time: '2024-06-06 11:48',
    user: '王五',
    action: '提交了退款申请',
    status: 'warning',
    statusText: '待审核'
  },
  {
    time: '2024-06-06 10:22',
    user: '赵六',
    action: '登录系统',
    status: 'success',
    statusText: '成功'
  },
  {
    time: '2024-06-06 09:05',
    user: '孙七',
    action: '导出了数据报表',
    status: 'info',
    statusText: '完成'
  }
])
</script>

<style scoped lang="scss">
.dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  color: #fff;
  flex-shrink: 0;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu {
    padding: 16px 0;

    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 24px;
      color: rgba(255, 255, 255, 0.65);
      transition: all 0.3s;
      cursor: pointer;

      &:hover,
      &.active {
        color: #fff;
        background-color: #1890ff;
      }

      .icon {
        margin-right: 10px;
        font-size: 16px;
      }
    }
  }
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 20px;
    font-weight: 500;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #1890ff;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
  }
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  .stat-title {
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }

  .stat-trend {
    font-size: 13px;

    &.up {
      color: #52c41a;
    }

    &.down {
      color: #f5222d;
    }
  }
}

.chart-card {
  margin-bottom: 24px;

  h3 {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 500;
  }

  .chart-placeholder {
    height: 200px;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    gap: 12px;
    padding: 20px 0;

    .bar {
      flex: 1;
      max-width: 60px;
      background: linear-gradient(to top, #1890ff, #69c0ff);
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;

        .bar-tooltip {
          opacity: 1;
          transform: translate(-50%, -8px);
        }
      }

      .bar-tooltip {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        opacity: 0;
        transition: all 0.3s;
        white-space: nowrap;
        pointer-events: none;

        &::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #333;
        }
      }
    }
  }
}

.table-card {
  h3 {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 500;
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  th {
    color: #666;
    font-weight: 500;
    background-color: #fafafa;
  }

  td {
    color: #333;
  }

  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;

    &.success {
      background-color: #f6ffed;
      color: #52c41a;
      border: 1px solid #b7eb8f;
    }

    &.info {
      background-color: #e6f7ff;
      color: #1890ff;
      border: 1px solid #91d5ff;
    }

    &.warning {
      background-color: #fffbe6;
      color: #faad14;
      border: 1px solid #ffe58f;
    }
  }
}
</style>
