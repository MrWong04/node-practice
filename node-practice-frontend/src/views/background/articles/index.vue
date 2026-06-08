<template>
  <div class="articles-view">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章列表</span>
          <el-button type="primary" size="small">新增文章</el-button>
        </div>
      </template>
      <p class="placeholder">文章列表页面占位</p>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.articles-view {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }

  .placeholder {
    margin: 0;
    color: #909399;
    text-align: center;
    padding: 40px 0;
  }
}
</style>
