import service from '@/utils/service'

// 渠道端客户信息分页(h5)
export function getCustomerList(params: any) {
  return service.post('/emc/customer/page', params)
}
// 查询商客信息
export function getCustomerDetail(params: any) {
  return service.post('/emc/customer/get', params)
}
// 渠道商添加商客
export function setCustomer(params: any) {
  return service.post('/emc/customer/add', params)
}
// 修改渠道商添加商客
export function updateCustomer(params: any) {
  return service.post('/emc/customer/update', params)
}
// 文件上传
export function upload(file: any) {
  return service.post('/omc/file/private/upload', file, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// 文件下载
export function download(params: any) {
  return service({
    url: '/yk/omc/file/private/download',
    method: 'GET',
    responseType: 'blob',
    params: params
  })
  // .get('/omc/file/private/download', { params })
}
