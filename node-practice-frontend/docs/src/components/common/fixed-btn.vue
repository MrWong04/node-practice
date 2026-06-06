<template>
  <!-- 添加右侧悬浮按钮 -->
  <div class="floating-buttons">
    <img src="@/assets/images/cart/to-cart.png" alt="logo" class="icon" @click="goToCart" />
    <img src="@/assets/images/cart/to-call.png" alt="logo" class="icon" @click="contactService" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const router = useRouter()
// 跳转到购物车
const goToCart = () => {
  if (!userStore.token) {
    router.push({ path: '/shopping-cart' })
    return
  }

  router.push('/shopping-cart')
}

// 联系客服
const contactService = () => {
  // 这里可以实现联系客服的逻辑
  // 例如打开聊天窗口或拨打客服电话
  // showToast('正在连接客服...')
  // 打开手机的拨号键，并拨号10086
  window.location.href = 'tel:10086'
}
</script>

<style scoped lang="scss">
.floating-buttons {
  position: fixed;
  right: 20px;
  bottom: 180px;
  z-index: 99;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .icon {
    width: 96px;
    height: 96px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
