// import { Toast } from 'vant'
import router from '@/router'

const ERROR_TIPS: Record<number, string> = {
  401: '登录过期，请重新登录',
  402: '您未关联企业，请与企业管理员联系',
  403: '您关联的企业状态异常，请与企业管理员联系',
  404: '奥哦，请求资源失败！',
  408: '请求超时，请检查网络是否连接正常',
  500: '哎哟！网络断开了～请检查网络后重试！',
  502: '哎哟！网络断开了～请检查网络后重试！',
  503: '哎哟！网络断开了～请检查网络后重试！',
  504: '哎哟！网络断开了～请检查网络后重试！',
  601: '抱歉，您无权限访问，请检查账号是否正确'
}

export const handleError = (status?: number) => {
  if (!status) return '请求失败，请检查网络是否已连接'

  const errorMsg = ERROR_TIPS[status] || '请求失败，请检查网络'
  // Toast({ message: errorMsg, duration: 2000 })
  console.error(errorMsg)

  if (status === 401) {
    setTimeout(() => router.push('/login'), 1000)
  } else if (status === 601) {
    setTimeout(() => router.push('/common/no-eid'), 1000)
  }
}
