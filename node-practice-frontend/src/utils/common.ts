export function formatDateTime(str: string): string | boolean {
  try {
    if (!str) return '无数据'
    const dateTime = new Date(str)
    if (!dateTime) return false
    const year = dateTime.getFullYear()
    let month: number | string = dateTime.getMonth() + 1
    let date: number | string = dateTime.getDate()
    if (month < 10) month = '0' + month
    if (date < 10) date = '0' + date
    return `${year}-${month}-${date}`
  } catch (e) {
    console.error('时间格式出错')
    return ''
  }
}

export function queryLocationParam(): Record<string, string> {
  const url = window.location.href.split('?')[1]
  if (url) {
    const theRequest: Record<string, string> = {}
    const strs = url.split('&')
    for (let i = 0; i < strs.length; i++) {
      const [key, value] = strs[i].split('=')
      theRequest[key] = decodeURIComponent(value)
    }
    return theRequest
  }
  return {}
}
