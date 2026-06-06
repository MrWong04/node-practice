import { createApp } from 'vue'
import '@/utils/config'
import store from '@/stores/index'
import { priceTypeFormat } from '@/utils'
import { trackEvent } from '@/utils/log'

import App from './App.vue'
import router from './router'
import './styles/main.scss'

// 全局引入Vant UI组件库
import Vant from 'vant'
import 'vant/lib/index.css'
import './styles/vant.scss' // 自定义Vant样式覆盖

import './styles/theme-variables.scss'

// 创建应用实例
// 创建应用实例
const app = createApp(App)

app.config.globalProperties.$priceTypeFormat = priceTypeFormat
app.config.globalProperties.$trackEvent = trackEvent
// 使用Vant UI组件库
app.use(Vant)

// 注册其他插件

// 注册其他插件
app.use(store)
app.use(router)

// import('./mock')

// 挂载应用
app.mount('#app')
