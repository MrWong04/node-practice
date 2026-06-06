// 一些公共的类型定义
// 城市数据
export interface CityData {
  id: number
  name: string
  code: string | number
  children: CityData[]
}

export interface QueryParams {
  [key: string]: string
}
