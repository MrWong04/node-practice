import { AxiosRequestConfig } from 'axios'

declare module 'axios' {
  // eslint-disable-next-line no-unused-vars
  interface AxiosInstance {
    // eslint-disable-next-line no-unused-vars
    (config: AxiosRequestConfig): Promise<any>
  }
}
