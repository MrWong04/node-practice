<template>
  <div class="gradient-title">
    <div class="gradient-line left"></div>
    <div class="title-text">{{ title }}</div>
    <div class="gradient-line right"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style lang="scss" scoped>
.gradient-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30px;
  margin: 20px 0;

  .title-text {
    font-size: 32px;
    font-weight: 500;
    color: #333;
    padding: 0 24px;
    white-space: nowrap;
  }

  .gradient-line {
    flex: 1;
    height: 2px;

    &.left {
      background: linear-gradient(to right, rgba(255, 107, 53, 0), rgba(255, 107, 53, 0.8));
    }

    &.right {
      background: linear-gradient(to left, rgba(255, 107, 53, 0), rgba(255, 107, 53, 0.8));
    }
  }
}
</style>
