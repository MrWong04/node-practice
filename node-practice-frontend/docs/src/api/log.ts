import service from '@/utils/service'

// 埋点记录
export function trackingAdd(params: any) {
  return service.post('/app/ai/promotion/tracking/add', params)
}
