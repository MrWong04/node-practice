<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const pageTitle = ref('有餐')
const isInMiniProgram = ref(false)
const isBack = ref(false)
const isShow = ref(false)

// 返回上一页
const onClickLeft = () => {
  router.go(-1)
}

// 检测是否在小程序环境中
onMounted(() => {
  // 检查是否在小程序WebView中
  const ua = navigator.userAgent.toLowerCase()
  isInMiniProgram.value =
    ua.indexOf('miniprogram') > -1 || window.__wxjs_environment === 'miniprogram'
})

// 使用路由守卫设置标题
router.beforeEach((to, from, next) => {
  const tabbar = ['/home', '/use', '/product', '/my', '/workbench']
  // 设置页面标题
  let title = (to.meta.title as string) || '有餐'
  // 如果有title参数，使用title参数
  if (to.query.title) {
    title = to.query.title as string
  }
  document.title = title
  pageTitle.value = title
  // 设置其他状态
  isShow.value = !!to.meta.showTitle || false
  if (tabbar.includes(to.path) && isInMiniProgram.value) {
    // 如果是在小程序环境，tabbar 的标题 隐藏
    isShow.value = false
  }
  isBack.value = !!to.meta.back || false
  next()
})
</script>

<template>
  <van-nav-bar :title="pageTitle" v-if="isShow" :left-arrow="isBack" @click-left="onClickLeft">
  </van-nav-bar>
  <!-- <van-nav-bar :title="pageTitle" v-if="!isInMiniProgram" left-arrow @click-left="onClickLeft">
  </van-nav-bar> -->
  <router-view v-slot="{ Component }">
    <keep-alive :include="caches">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<style scoped lang="scss"></style>
