<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- 左侧品牌展示 -->
      <div class="auth-banner">
        <div class="banner-content">
          <h1 class="banner-title">个人博客</h1>
          <p class="banner-desc">记录生活，分享技术</p>
          <div class="banner-features">
            <div class="feature-item">
              <el-icon><Document /></el-icon>
              <span>文章管理</span>
            </div>
            <div class="feature-item">
              <el-icon><Collection /></el-icon>
              <span>分类归档</span>
            </div>
            <div class="feature-item">
              <el-icon><User /></el-icon>
              <span>用户中心</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="auth-form-wrapper">
        <div class="auth-form-box">
          <h2 class="form-title">{{ activeTab === 'login' ? '欢迎回来' : '创建账号' }}</h2>
          <p class="form-subtitle">
            {{ activeTab === 'login' ? '登录以继续访问您的账户' : '注册以开始使用博客系统' }}
          </p>

          <el-tabs v-model="activeTab" class="auth-tabs">
            <!-- 登录 Tab -->
            <el-tab-pane label="登录" name="login">
              <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                class="auth-form"
                @keyup.enter="handleLogin"
              >
                <el-form-item prop="email">
                  <el-input
                    v-model="loginForm.email"
                    placeholder="请输入邮箱"
                    size="large"
                    :prefix-icon="Message"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    size="large"
                    :prefix-icon="Lock"
                    show-password
                    clearable
                  />
                </el-form-item>
                <el-form-item>
                  <div class="form-options">
                    <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                    <el-link type="primary" :underline="false" @click="handleForgotPassword">
                      忘记密码？
                    </el-link>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    class="submit-btn"
                    :loading="loading"
                    @click="handleLogin"
                  >
                    登 录
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 注册 Tab -->
            <el-tab-pane label="注册" name="register">
              <el-form
                ref="registerFormRef"
                :model="registerForm"
                :rules="registerRules"
                class="auth-form"
                @keyup.enter="handleRegister"
              >
                <el-form-item prop="nickname">
                  <el-input
                    v-model="registerForm.nickname"
                    placeholder="请输入昵称"
                    size="large"
                    :prefix-icon="Avatar"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="email">
                  <el-input
                    v-model="registerForm.email"
                    placeholder="请输入邮箱"
                    size="large"
                    :prefix-icon="Message"
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="请输入密码（至少6位）"
                    size="large"
                    :prefix-icon="Lock"
                    show-password
                    clearable
                  />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="请确认密码"
                    size="large"
                    :prefix-icon="Lock"
                    show-password
                    clearable
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    size="large"
                    class="submit-btn"
                    :loading="loading"
                    @click="handleRegister"
                  >
                    注 册
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Avatar, Message, Document, Collection } from '@element-plus/icons-vue'
import { loginApi, registerApi } from '@/api/auth'

const router = useRouter()
const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)
const rememberMe = ref(false)

const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// 登录表单
const loginForm = reactive({
  email: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 确认密码校验
const validateConfirmPassword = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void
) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 登录校验规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

// 注册校验规则
const registerRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
}

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
  } catch {
    return // 表单校验失败，静默处理
  }

  loading.value = true
  try {
    const res = await loginApi({ email: loginForm.email, password: loginForm.password })
    if (res.success) {
      localStorage.setItem('blog_token', res.data.token)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
  } catch {
    return // 表单校验失败，静默处理
  }

  loading.value = true
  try {
    const res = await registerApi({
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.nickname
    })
    if (res.success) {
      ElMessage.success('注册成功，请登录')
      activeTab.value = 'login'
      // 清空注册表单
      registerForm.nickname = ''
      registerForm.email = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      ElMessage.error(res.message || '注册失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || '注册失败')
  } finally {
    loading.value = false
  }
}

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* 左侧 banner */
.auth-banner {
  flex: 1;
  background: linear-gradient(160deg, #409eff 0%, #1677ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 40px;

  .banner-content {
    text-align: center;
  }

  .banner-title {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: 2px;
  }

  .banner-desc {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 48px;
  }

  .banner-features {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      opacity: 0.95;

      .el-icon {
        font-size: 20px;
      }
    }
  }
}

/* 右侧表单 */
.auth-form-wrapper {
  width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  .auth-form-box {
    width: 100%;
  }

  .form-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 8px;
    text-align: center;
  }

  .form-subtitle {
    font-size: 14px;
    color: #999;
    margin-bottom: 28px;
    text-align: center;
  }
}

.auth-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }

  :deep(.el-tabs__item) {
    font-size: 16px;
    padding: 0 24px;
  }
}

.auth-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .submit-btn {
    width: 100%;
    font-size: 16px;
    letter-spacing: 4px;
    border-radius: 8px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    padding: 4px 12px;
  }
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .auth-container {
    width: 100%;
    flex-direction: column;
    min-height: auto;
  }

  .auth-banner {
    padding: 30px 20px;

    .banner-title {
      font-size: 28px;
    }

    .banner-features {
      flex-direction: row;
      justify-content: center;
      gap: 24px;
    }
  }

  .auth-form-wrapper {
    width: 100%;
    padding: 30px 24px;
  }
}
</style>
