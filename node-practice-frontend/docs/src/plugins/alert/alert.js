import { createVNode, render } from 'vue'
import alertComponent from './alert.vue'

const myAlert = function (options) {
  const container = document.createElement('div')
  const vm = createVNode(alertComponent, options)
  render(vm, container)
  document.body.appendChild(container)
}
const alert = {
  install(app) {
    // 配置此应用
    app.config.globalProperties.$alert = myAlert
  }
}
export default alert
