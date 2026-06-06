import dayjs from 'dayjs'
import { trackingAdd } from '@/api/log'

/**
 * 埋点记录方法
 * @param {string} operationCode - 操作代码，由外部传入
 * @returns {Promise} 返回埋点请求的Promise
 */
export function trackEvent(operationCode: string) {
  try {
    // 从 localStorage 获取门店信息
    const trackingStoreInfoStr = localStorage.getItem('trackingStoreInfo')
    const trackingStoreInfo = trackingStoreInfoStr ? JSON.parse(trackingStoreInfoStr) : {}

    // 构建请求体
    const data = {
      operationTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      clientTag: 2, // 渠道类型,1-⼩程序, 2-H5, 3-PC, 4-APP'
      userTag: 2, // ⽤⼾标识, 1-商⼾ 2-⽤⼾',
      storeId: trackingStoreInfo?.storeId || '',
      storeName: trackingStoreInfo?.storeName || '',
      businessType: '1001',
      operationCode: operationCode || '',
      extraData: {
        uuid: getUuId() || ''
      }
    }

    // 调用埋点API
    return trackingAdd(data)
  } catch (error) {
    console.error('埋点记录失败:', error)
    return Promise.reject(error)
  }
}

export function generateUuId() {
  // 返回一个visitor+随机五位数字
  return `visitor${Math.floor(10000 + Math.random() * 90000)}`
}

export function getUuId() {
  const uuId = localStorage.getItem('uuId')
  if (!uuId) {
    const newUuId = generateUuId()
    localStorage.setItem('uuId', newUuId)
    return newUuId
  }
  return uuId
}
