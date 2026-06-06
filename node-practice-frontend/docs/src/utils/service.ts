import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { get64String, responseToJson } from './index'
import { showToast } from 'vant'
// 创建userStroe实例
axios.defaults.headers.withCredentials = true
// create an axios instance
const service = axios.create({
  baseURL: '/yk', // api 的 base_url
  timeout: 50000, // request timeout
  method: 'post',
  headers: {
    'Content-type': 'application/json; charset=utf-8'
  }
})
// request interceptor
service.interceptors.request.use(
  (config: any) => {
    const userStore = useUserStore()
    // 在发送请求之前做些什么
    config.headers = {
      ...config.headers
    }
    if (config.url === '/auth/v1/login') {
      config.headers['clientId'] = config.data.clientId
      config.headers['Data-Auth-Appid'] = 'APP1'
      config.headers['Data-Auth-Domain'] = ''
      delete config.data.clientId
    }
    const { token } = storeToRefs(userStore)
    const { httpHeader } = storeToRefs(userStore)
    if (httpHeader && httpHeader.value) {
      config.headers = Object.assign(config.headers, httpHeader.value)
    }

    if (!userStore.isCorp) {
      // 不需要转换的白名单接口
      const whiteUrl = userStore.whiteUrl || []
      if (!whiteUrl.includes(config.url)) {
        config.url = config.url.replace('/emc', '/app')
      }
    }
    if (
      config.url.indexOf('/web/auth/v1/sms/intent/send_code') !== -1 ||
      config.url.indexOf('/web/auth/v1/sms/corp_add_customer/send_code') !== -1
    ) {
      config.baseURL = ''
    }
    if (token) {
      config.headers['access-token'] = token.value
    }
    // 默认 aFormat = true
    if (config.aFormat === undefined) config.aFormat = true
    // 统一格式处理
    if (config.aFormat) {
      // 文件上传不用这种格式
      if (config.headers['Content-Type'] !== 'multipart/form-data') {
        const requestId = get64String()
        const formatData = {
          head: { requestId },
          data: config.data
        }
        config.data = formatData
      }
    }

    if (config.url === '/web/manage/v1/self/update-pwd') {
      config.baseURL = ''
    }
    return config
  },
  (error) => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  async (response) => {
    const userStore = useUserStore()
    let res = response.data
    // 如果二进制类型能转成 JSON，则按照普通接口方式处理
    if (response.request.responseType === 'blob') {
      try {
        const jsonData = await responseToJson(res)
        res = jsonData
      } catch (e) {
        // 二进制类型直接返回
        return res
      }
    }
    if ((response.config as any).emptyUserId) {
      return res
    }
    const errorMsg = response.data?.head?.respDesc || '请求失败，请检查网络是否连接正常'
    if (response.config.headers.ignoreReject) {
      return res
    }
    if (res.head && !res.head.respCode && !res.head.respDesc && !res.head.requestId) {
      showToast('登录过期' + errorMsg)
      userStore.logout().then(() => {
        location.reload()
      })
      return Promise.reject(res)
    }
    // 过期
    if (
      (res.head && res.head.respCode === '000007') ||
      res.head.respCode === '010001' ||
      res.head.respCode === '010003'
    ) {
      showToast('登录过期' + errorMsg)
      userStore.logout()
      return Promise.reject(res)
    }
    // 无效token/token未找到
    if (res.head && res.head.respCode === '000006') {
      showToast('无效token' + errorMsg)
      userStore.logout().then(() => {
        location.reload()
      })
      return Promise.reject(res)
    }
    if (res.head && res.head.respCode === '000004') {
      showToast(errorMsg)
      return Promise.reject(res)
    }
    if (res.head && res.head.respCode !== '000000' && res.head.respCode !== '00') {
      showToast(errorMsg)
      return Promise.reject(res)
    }
    return res
  },
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过 xmlhttprequest 来状态码标识 逻辑可写在下面error中
   * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
   */
  (error) => {
    console.log('err' + error) // for debug
    const msg = '网络出错，请稍后再试!'
    return Promise.reject(error)
  }
)

export default service
