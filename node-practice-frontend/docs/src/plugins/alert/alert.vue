<template>
  <div class="custom-alert" :class="customClass" ref="customAlert">
    <div class="custom-overlay" @click="clickOverlay"></div>
    <div class="custom-alert-cont">
      <!-- <div class="custom-alert-bg"></div> -->
      <div class="custom-alert__main">
        <div class="custom-alert-type" :class="[iconType]"></div>
        <div class="custom-alert-title" v-html="title" v-if="title"></div>
        <div class="custom-alert-detail">
          <div v-html="message" v-if="message" class="custom-alert-message"></div>
        </div>
        <div class="custom-alert-btn-group">
          <button
            :class="['custom-alert-btn-cancel', cancelBtnClass]"
            @click="handleCancel"
            v-if="!hideCancel"
          >
            {{ cancelBtnText }}
          </button>
          <button class="custom-alert-btn-create" @click="handleOk">{{ confirmBtnText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps({
  // 弹窗自定义class，引入的页面可以定制修改弹窗样式
  customClass: {
    type: String,
    default: ''
  },
  // 弹窗标题
  title: {
    type: String,
    default: '信息提示'
  },
  // 弹窗内容
  message: {
    type: String,
    default: ''
  },
  // 取消按钮自定义样式
  cancelBtnClass: {
    type: String,
    default: ''
  },
  // 确定按钮文案
  confirmBtnText: {
    type: String,
    default: '确定'
  },
  // 取消按钮文案
  cancelBtnText: {
    type: String,
    default: '取消'
  },
  iconType: {
    type: String,
    default: 'success'
  },
  // 是否显示关闭按钮
  isCloseIcon: {
    type: Boolean,
    default: false
  },
  // 点击确定回调
  callback: {
    type: Function
  },
  // 点击取消按钮回调
  callbackCancel: {
    type: Function
  },
  // 影藏取消按钮
  hideCancel: {
    type: Boolean,
    default: false
  },
  // 点击遮罩层关闭弹窗
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})
const customAlert = ref(null)
// 关闭弹窗
function removeModal() {
  let parent = (customAlert.value && customAlert.value['parentNode']) || null
  if (customAlert.value && document.body.contains(parent) && parent) {
    document.body.removeChild(parent)
  }
}
// 点击取消按钮
function handleCancel() {
  removeModal()
  props.callbackCancel && props.callbackCancel()
}
// 点击确定按钮
function handleOk() {
  removeModal()
  props.callback && props.callback()
}
// 点击遮罩层
function clickOverlay() {
  props.closeOnClickOverlay && removeModal()
}
</script>

<style lang="scss">
.custom-alert {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  .custom-alert-close {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;
    width: 28px;
  }
  // .custom-alert-bg {
  //   display: block;
  //   width: 640px;
  //   height: 320px;
  // }

  .custom-alert-type {
    display: block;
    width: 100px;
    height: 100px;
    margin: 80px auto 38px;
    background: url('@/assets/images/common/icon-success.png') no-repeat;
    background-size: 100% auto;
    &.fail {
      background: url('@/assets/images/common/icon-failure.png') no-repeat;
      background-size: 100% auto;
    }
  }
  .custom-alert-title {
    color: #181818;
    font-size: 36px;
    font-weight: 500;
    line-height: 36px;
    letter-spacing: 0;
    text-align: center;
  }
  .custom-alert-cont {
    min-width: 636px;
    background: url('@/assets/images/common/alert-bg.png') no-repeat 100% 100%;
    background-size: 100% 100%;
    padding-bottom: 48px;
    position: relative;
    border-radius: 40px;
  }
  .custom-alert__main {
    display: block;
    position: relative;
    width: 636px;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .custom-overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  .custom-alert-detail {
    padding-top: 25px;
  }
  .custom-alert-message {
    font-size: 30px;
    font-weight: 400;
    color: #333;
    line-height: 40px;
    text-align: center;
    max-width: 497px;
    margin: 0 auto;
  }
  .custom-alert-btn-group {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 21px;
  }
  // 按钮样式
  .custom-alert-btn-create,
  .custom-alert-btn-cancel {
    width: 240px;
    height: 64px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 32px;
    color: var(--primary-color);
    padding: 0;
    background: #fff;
    text-align: center;
    border-radius: 44px;
    border: 2px solid var(--primary-color);
  }
  .custom-alert-btn-create {
  }
  .custom-alert-btn-cancel {
  }
}
</style>
