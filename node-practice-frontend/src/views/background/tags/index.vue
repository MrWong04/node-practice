<template>
  <div class="tags-view">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
          <el-button type="primary" size="small">新增标签</el-button>
        </div>
      </template>
      <p class="placeholder">标签管理页面占位</p>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.tags-view {
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
