<template>
  <div class="column-one">
    <component :is="getBlockById(blockType)" :data-config="blockConfig" :state="state"></component>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getContentBlock, getBlockById } from '@/utils/tool.ts'

// 定义 props 类型
const props = defineProps({
  columnData: {
    type: Object as () => {
      columnType: number
      // 其他字段根据实际情况添加
    },
    default: () => ({})
  },
  index: {
    type: Number,
    default: 0
  },
  state: {
    type: Number,
    default: 0
  },
  edit: {
    type: Boolean,
    default: false
  }
})

// 定义响应式变量
const blockType = ref('')
const blockConfig = ref({})
const portalTheme = ref({})

// 定义设置块的函数
const setBlock = (val: { columnType: number }) => {
  const { blockType: bt, blockConfig: bc } = getContentBlock(val, portalTheme.value)
  blockType.value = bt
  blockConfig.value = bc
}

// 监听 props.columnData 的变化
watch(
  () => props.columnData,
  (val) => {
    setBlock(val)
  }
)

// 组件挂载时执行的逻辑
onMounted(() => {
  setBlock(props.columnData)
  // console.log('ui组件接收的数据', props.columnData)
})

// 导出需要在模板中使用的变量和函数
defineExpose({
  blockType,
  blockConfig,
  getBlockById
})
</script>

<style scoped>
.base-ui {
  position: relative;
}
.el-icon-delete {
  display: none;
  position: absolute;
  right: 0px;
  top: -10px;
  z-index: 10;
}
.base-ui:hover i {
  display: block;
}
</style>
