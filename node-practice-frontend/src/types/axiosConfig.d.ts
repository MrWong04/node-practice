import { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    aFormat?: boolean
    emptyUserId?: boolean
    // [自定义属性声明]
  }
}
