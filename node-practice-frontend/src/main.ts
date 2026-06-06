import { createApp } from 'vue'
import '@/utils/config'
import store from '@/stores/index'
import { priceTypeFormat } from '@/utils'
import { trackEvent } from '@/utils/log'

import App from './App.vue'
import router from './router'
import './styles/main.scss'

// 创建应用实例
const app = createApp(App)

app.config.globalProperties.$priceTypeFormat = priceTypeFormat
app.config.globalProperties.$trackEvent = trackEvent

// 注册其他插件
app.use(store)
app.use(router)

// 挂载应用
app.mount('#app')
