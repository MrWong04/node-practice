import service from '@/utils/service'
import { type CommonListRespType } from '@/typings/http'
interface CollectListParams {
  pageNum: number
  pageSize: number
}
export interface CollectItem {
  id: number
  spuId?: string
  mobile?: string
  enterpriseId?: string
  createTime?: string
  productShowName: string
  productPic: string
  price: string | number
  count: number
  selected: boolean
  priceNegotiable: number
  priceType: number
}

// 获取收藏列表
export function getCollectList(data: CollectListParams): Promise<CommonListRespType<CollectItem>> {
  return service.post('/yk/app/product_collection/page', data)
}

// 获取点赞列表
export function getUpVoteList(data: CollectListParams): Promise<CommonListRespType<CollectItem>> {
  return service.post('/yk/app/product_upvote/page', data)
}

// 搜搜应用
export function applicationSearch(data: any) {
  return service.post('/app/application/search', data)
}

// 推荐应用
export function applicationRecommend(params: any) {
  return service.get('/app/application/recommend', { params })
}

// 生成推广文案——第一次生成（流式）
export function noteGenerate(params: any) {
  return service.post('/app/ai/promotion/note/generate', params)
}

// 生成笔记——换一篇推广文案（流式）
export function noteRegenerate(params: any) {
  return service.post('/app/ai/promotion/note/regenerate', params)
}

// 用户端获取门店关键词配置
export function getConfig(params: any) {
  return service.post('/app/ai/promotion/keyword/config/get', params)
}
