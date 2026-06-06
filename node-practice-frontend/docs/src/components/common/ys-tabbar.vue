<template>
  <div>
    <FixedBtn></FixedBtn>
    <van-tabbar
      :model-value="currentTabIndex"
      :active-color="themeVars.tabbarActiveColor"
      :fixed="true"
      :border="false"
      :inactive-color="themeVars.tabbarInactiveColor"
      :z-index="100"
    >
      <van-tabbar-item
        v-for="(item, index) in filteredTabbarOptions"
        :key="item.name"
        @click="handleTabClick(item, index)"
      >
        <span>{{ item.name }}</span>
        <template #icon="props">
          <img :src="props.active ? item.actIcon : item.icon" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

import FixedBtn from './fixed-btn.vue'

// 导入图标
import homeIcon from '@/assets/images/tabs-icon/home.png'
import homeActiveIcon from '@/assets/images/tabs-icon/home-active.png'
import productIcon from '@/assets/images/tabs-icon/product.png'
import productActiveIcon from '@/assets/images/tabs-icon/product-active.png'
import solutionIcon from '@/assets/images/tabs-icon/solution.png'
import solutionActiveIcon from '@/assets/images/tabs-icon/solution-active.png'
import myIcon from '@/assets/images/tabs-icon/my.png'
import myActiveIcon from '@/assets/images/tabs-icon/my-active.png'
import workbench from '@/assets/images/tabs-icon/workbench.png'
import workbenchActive from '@/assets/images/tabs-icon/workbench-active.png'

// 类型定义
interface TabbarItem {
  name: string
  icon: string
  actIcon: string
  link: string
  isShow: boolean
  requiresAuth?: boolean
}

// 主题变量
const themeVars = {
  tabbarActiveColor: 'var(--primary-color)',
  tabbarInactiveColor: '#4D4C4D'
}

// 状态管理
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Tabbar 配置
const tabbarConfig: TabbarItem[] = [
  {
    name: '首页',
    icon: homeIcon,
    actIcon: homeActiveIcon,
    link: '/home',
    isShow: true
  },
  {
    name: '产品',
    icon: productIcon,
    actIcon: productActiveIcon,
    link: '/product',
    isShow: true
  },
  {
    name: '解决方案',
    icon: solutionIcon,
    actIcon: solutionActiveIcon,
    link: '/solution',
    isShow: true
  },
  // {
  //   name: '购物车',
  //   icon: cartIcon,
  //   actIcon: cartActiveIcon,
  //   link: '/shopping-cart',
  //   isShow: true
  // },
  {
    name: '工作台',
    icon: workbench,
    actIcon: workbenchActive,
    link: '/workbench',
    isShow: true
  },
  {
    name: '我的',
    icon: myIcon,
    actIcon: myActiveIcon,
    link: '/my',
    isShow: true,
    requiresAuth: true
  }
]

// 计算属性：过滤显示的选项
const filteredTabbarOptions = computed(() => tabbarConfig.filter((item) => item.isShow))

// 计算当前激活的标签页索引
const currentTabIndex = computed(() => {
  const currentPath = route.path
  return filteredTabbarOptions.value.findIndex((item) => item.link === currentPath)
})

// 处理标签点击
async function handleTabClick(item: TabbarItem, index: number): Promise<void> {
  // 检查是否需要登录
  // if (item.requiresAuth && !userStore.getToken) {
  //   showToast({
  //     message: '请先登录',
  //     duration: 2000
  //   })
  //   userStore.logout()
  //   return
  // }

  // 导航到目标页面
  await router.push(item.link)
}
</script>
