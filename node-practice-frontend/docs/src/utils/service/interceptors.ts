import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { handleError } from './errorHandler'
import { getHeaderInfo, formatRequestData } from './utils'
import type { RequestInterceptorsConfig, ApiResponse } from '@/typings/axios'
import formatResponse from '../formatResponse'
import mockToken from '@/utils/mockToken'

// const userStore = useUserStore()
export const requestInterceptor = (
  config: RequestInterceptorsConfig
): InternalAxiosRequestConfig<any> => {
  // 添加请求头
  config.headers = { ...config.headers, ...getHeaderInfo() }
  // 统一格式处理
  if (config.aFormat && config.data) {
    config.data = formatRequestData(config.data)
  }

  if (import.meta.env.NODE_ENV !== 'production') {
    const token = mockToken // 本地调试，改成自己的token
    document.cookie = `AFTOKEN=${token}`
  }

  // GET请求禁用缓存
  if (config.method?.toUpperCase() === 'GET') {
    config.headers['cache-control'] = 'no-cache'
    config.headers.Pragma = 'no-cache'
  }
  return config as InternalAxiosRequestConfig<any>
}

export const responseInterceptor = (response: AxiosResponse<ApiResponse>) => {
  const resData = formatResponse(response.data as any, (response.config as any).platform)
  if ((response.config as any).emptyUserId) {
    return resData
  }

  const { code, message } = resData
  const errorMsg = message || handleError(Number(code))

  // 二进制流处理
  if (response.config.responseType === 'blob') {
    return response
  }

  // 错误处理
  if (code === '401' || code === '601' || code !== '0') {
    if ((response.config as any).showErrorTips !== false) {
      showToast({ message: errorMsg, duration: 2000 })
    }
    return Promise.reject(resData)
  }

  return resData.data
}

export const responseErrorInterceptor = (error: any) => {
  const errorMsg = handleError(error.response?.status)
  error.message = errorMsg
  error.code = error.response?.status || 408
  return Promise.reject(error)
}
