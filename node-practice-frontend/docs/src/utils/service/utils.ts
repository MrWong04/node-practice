import type { HeaderInfo } from '@/typings/axios'
import {
  get64String,
  getLocalStorage,
  getQueryObject,
  getSessionStorage,
  queryLocationParamAppInstanceId
} from '@/utils/common'
import { useUserStore } from '@/stores/user'

export const transformRequestData = (data: any, headers: any) => {
  if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    let ret = ''
    for (const it in data) {
      ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
    }
    return ret
  } else if (headers['Content-Type'] === 'multipart/form-data') {
    return data
  }
  return JSON.stringify(data)
}

export const getHeaderInfo = (): HeaderInfo => {
  const selEnterprise = getLocalStorage('selEnterprise') || {}
  const queryObj = getQueryObject(window.location.href)
  const userStore = useUserStore()

  return {
    'ENTERPRISE-ID': selEnterprise.enterpriseId || queryObj.enterpriseId,
    userId: (userStore.userInfo && userStore.userInfo.userId) || '',
    euserId: selEnterprise.euserId || '',
    'Content-Security-Policy': "default-src 'self' *.trusted.com",
    'Data-Auth-Instanceid': queryLocationParamAppInstanceId() || getSessionStorage('entranceId')
  }
}

export const formatRequestData = (data: any) => {
  return {
    head: { requestId: get64String() },
    data
  }
}
