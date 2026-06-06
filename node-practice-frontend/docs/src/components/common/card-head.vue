<template>
  <div class="card-head" :style="{ height: px2vw(height), fontWeight: bold }">
    {{ title }}
  </div>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue'
import { px2vw } from '@/utils'

type Props = {
  height: any
  title: string
  bold: string | number
}
const props = withDefaults(defineProps<Props>(), {
  height: '36px',
  title: '标题',
  bold: '500'
})
</script>

<style lang="scss" scoped>
.card-head {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 32px;
  color: #181818;
  box-sizing: content-box;

  &::before {
    content: '';
    width: 6px;
    height: 24px;
    margin-right: 10px;
    background: var(--primary-color);
    border-radius: 4px;
  }
}
</style>
