<template>
  <div class="prospect-layout">
    <header class="top-header">
      <h3 class="blog-title">个人博客</h3>
      <el-menu :default-active="activeIndex" class="top-menu" mode="horizontal" router>
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/category">分类</el-menu-item>
        <el-menu-item index="/archive">归档</el-menu-item>
      </el-menu>
      <HeaderUser name="访客" />
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderUser from '@/components/HeaderUser/index.vue'

const route = useRoute()

const activeIndex = computed(() => {
  if (route.path === '/category') return '/category'
  if (route.path === '/archive') return '/archive'
  return '/'
})
</script>

<style scoped lang="scss">
.prospect-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.top-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 24px 0 40px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;

  .blog-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .top-menu {
    margin-left: 40px;
    flex: 1;
    border-bottom: none;
  }
}

.main-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
}
</style>
