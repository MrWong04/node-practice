import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { RequestConfig, ApiResponse } from '@/typings/axios'
import { requestInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors'
import { transformRequestData } from './utils'

const service = axios.create({
  baseURL: '/',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  // 转化函数待设计
  transformRequest: [transformRequestData]
})

// 绑定拦截器
service.interceptors.request.use(requestInterceptor as (config: any) => any, (error) =>
  Promise.reject(error)
)
service.interceptors.response.use(responseInterceptor, responseErrorInterceptor)

// 导出请求方法
const request = <T = any>(config: RequestConfig) => {
  return service.request<ApiResponse<T>>(config as AxiosRequestConfig)
}

export default request
