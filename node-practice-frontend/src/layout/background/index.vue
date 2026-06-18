<template>
  <div class="background-layout">
    <header class="background-header">
      <div class="header-left">
        <h3 class="system-title">后台管理系统</h3>
      </div>
      <el-menu :default-active="topActiveIndex" class="header-menu" mode="horizontal" router>
        <el-menu-item index="/background">概览</el-menu-item>
        <el-menu-item index="/background/content">内容</el-menu-item>
        <el-menu-item index="/background/system">系统</el-menu-item>
      </el-menu>
      <HeaderUser :name="userStore.user?.name || '管理员'" />
    </header>

    <div class="background-body">
      <aside class="background-sidebar">
        <el-menu :default-active="sideActiveIndex" class="side-menu" router>
          <el-sub-menu index="/background/dashboard">
            <template #title>
              <el-icon><DataLine /></el-icon>
              <span>仪表盘</span>
            </template>
            <el-menu-item index="/background">数据概览</el-menu-item>
            <el-menu-item index="/background/dashboard/analytics">访问分析</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/background/content">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </template>
            <el-menu-item index="/background/content/articles">文章列表</el-menu-item>
            <el-menu-item index="/background/content/categories">分类管理</el-menu-item>
            <el-menu-item index="/background/content/tags">标签管理</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="/background/system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/background/system/users">用户管理</el-menu-item>
            <el-menu-item index="/background/system/roles">角色权限</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <main class="background-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataLine, Document, Setting } from '@element-plus/icons-vue'
import HeaderUser from '@/components/HeaderUser/index.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const route = useRoute()

const topActiveIndex = computed(() => {
  if (route.path.startsWith('/background/content')) return '/background/content'
  if (route.path.startsWith('/background/system')) return '/background/system'
  return '/background'
})

const sideActiveIndex = computed(() => route.path)
</script>

<style scoped lang="scss">
.background-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.background-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;

  .header-left {
    flex-shrink: 0;

    .system-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .header-menu {
    flex: 1;
    margin-left: 32px;
    border-bottom: none;
  }
}

.background-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.background-sidebar {
  width: 220px;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;

  .side-menu {
    height: 100%;
    border-right: none;
  }
}

.background-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
