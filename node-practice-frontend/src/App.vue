<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>
