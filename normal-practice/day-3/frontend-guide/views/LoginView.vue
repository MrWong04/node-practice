<template>
  <div class="login-page">
    <h1>{{ isRegister ? '注册' : '登录' }}</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label>邮箱：</label>
        <input v-model="form.email" type="email" required />
      </div>
      <div>
        <label>密码：</label>
        <input v-model="form.password" type="password" required />
      </div>
      <div v-if="isRegister">
        <label>昵称：</label>
        <input v-model="form.name" type="text" />
      </div>
      <button type="submit">{{ isRegister ? '注册' : '登录' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <p @click="isRegister = !isRegister">
      {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isRegister = ref(false)
const error = ref('')
const form = reactive({
  email: '',
  password: '',
  name: '',
})

async function handleSubmit() {
  error.value = ''
  try {
    let res
    if (isRegister.value) {
      res = await authStore.register(form.email, form.password, form.name)
    } else {
      res = await authStore.login(form.email, form.password)
    }
    if (res.success) {
      router.push('/')
    }
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.login-page { max-width: 400px; margin: 50px auto; padding: 20px; }
form div { margin-bottom: 15px; }
input { width: 100%; padding: 8px; }
button { width: 100%; padding: 10px; }
.error { color: red; }
</style>
