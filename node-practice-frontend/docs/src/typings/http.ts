// 声明返回类型供@/api下的文件使用
export interface ResType<T> {
  context?: T
  data?: T
  message?: string
  status?: number
}
export interface CommonListRespType<T> {
  head: {
    requestId: string
    respStatus: string
    respCode: string
    respDesc: string
  }
  data: {
    total: number
    list: T[]
    pageSize: number
    pageNum: number
  }
}

export interface CommonDataRespType<T> {
  head: {
    requestId: string
    respStatus: string
    respCode: string
    respDesc: string
  }
  data: T
}

export interface CommonJudgeRespType {
  head: {
    requestId: string
    respStatus: string
    respCode: string
    respDesc: string
  }
  data: boolean
}
