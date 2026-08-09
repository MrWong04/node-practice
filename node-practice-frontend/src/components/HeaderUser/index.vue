<template>
  <div class="header-user">
    <el-button
      circle
      class="theme-btn"
      :title="isDark ? '切换白天模式' : '切换黑夜模式'"
      @click="toggleTheme"
    >
      <el-icon :size="18">
        <Sunny v-if="isDark" />
        <Moon v-else />
      </el-icon>
    </el-button>

    <el-dropdown>
      <span class="user-info">
        <el-avatar :size="28" :icon="UserFilled" />
        <span class="user-name">{{ userName }}</span>
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
          <el-dropdown-item @click="handleSwitch">
            {{ isBackground ? '切换至前台' : '切换至后台' }}
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, ArrowDown, Sunny, Moon } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { removeToken } from '@/utils/auth'

const props = withDefaults(
  defineProps<{
    name?: string
  }>(),
  {
    name: '管理员'
  }
)

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => props.name)
const isBackground = computed(() => route.path.startsWith('/background'))

const isDark = ref(false)

const applyTheme = (dark: boolean) => {
  const html = document.documentElement
  if (dark) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    isDark.value = true
  } else if (saved === 'light') {
    isDark.value = false
  } else {
    // 默认跟随系统
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme(isDark.value)
})

const goToProfile = () => {
  // TODO: 跳转到个人中心页面
  ElMessage.info('个人中心功能开发中')
}

const handleSwitch = () => {
  if (isBackground.value) {
    router.push('/')
  } else {
    router.push('/background')
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 清除本地登录态与用户信息
      removeToken()
      userStore.clearUser()
      ElMessage.success('已退出登录')
      router.push('/auth/login')
    })
    .catch(() => {
      // 取消退出
    })
}
</script>

<style scoped lang="scss">
.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .theme-btn {
    color: #333;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #333;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }

    .user-name {
      font-size: 14px;
    }
  }
}
</style>
