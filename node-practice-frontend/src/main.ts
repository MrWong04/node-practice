import { createApp } from 'vue'
import store from '@/stores/index'
import App from './App.vue'
import router from './router'
import './styles/main.scss'
import '@/styles/markdown.scss'

import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(store)
app.use(router)
app.mount('#app')
