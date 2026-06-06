import type { QueryParams } from '@/typings/common'
import defaultConfig from '@/utils/params'
export * from './env'
export * from './storage'
export * from './dom'

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

export function queryLocationParam(): QueryParams {
  const url = window.location.href.split('?')[1]
  if (url) {
    const theRequest: QueryParams = {}
    const strs = url.split('&')
    for (let i = 0; i < strs.length; i++) {
      const [key, value] = strs[i].split('=')
      theRequest[key] = decodeURIComponent(value)
    }
    return theRequest
  }
  return {}
}

// ... 其他函数的TypeScript实现
// ... 前面的代码保持不变 ...

interface ScrollTarget extends Element {
  scrollTo: {
    (options?: ScrollToOptions): void
    (x: number, y: number): void
  }
  scrollTop: number
  scrollY?: number
}

interface SpecialTopicParams {
  title: string
  disContent: string
  itemId: string
  place: string
  comType: string
}

export function scrollTo(
  pos: number,
  dom?: ScrollTarget | ((args: any) => void),
  callback?: () => void,
  animation = true
): void {
  if (typeof dom === 'function') {
    callback = dom as () => void
    dom = undefined
  }
  const target = (dom || window) as ScrollTarget & Window
  let top = target.scrollTop || target.scrollY || 0

  if (animation) {
    smooth()
  } else {
    if (target.scrollTo) {
      target.scrollTo(0, pos)
    } else {
      target.scrollTop = pos
    }
    callback?.()
  }

  function smooth(): void {
    top = top + (pos - top) / 4
    if (Math.abs(top - pos) <= 1) {
      if (target.scrollTo) {
        target.scrollTo(0, pos)
      } else {
        target.scrollTop = pos
      }
      callback?.()
      return
    }
    if (target.scrollTo) {
      target.scrollTo(0, top)
    } else {
      target.scrollTop = top
    }
    requestAnimationFrame(smooth)
  }
}

export function scrollToDom(dom: HTMLElement): void {
  const H = window.innerHeight
  const h = dom.offsetHeight
  const target = dom.offsetTop - H / 2 + h / 2
  document.documentElement.scrollTop = target
  try {
    window.pageYOffset = target
  } catch (e) {
    console.log(e)
  }
  document.body.scrollTop = target
}

export const get64String = (): string => {
  const str = '12345qwertyui67890opasdfghj09876klzxcvbnm54321'
  let res = ''
  for (let i = 0; i < 48; i++) {
    res += str.split('')[Math.floor(Math.random() * str.length)]
  }
  return `${Date.now()}asp${res}`.toUpperCase()
}

const invert = <T extends Record<string, string>>(obj: T): Record<string, string> => {
  const result: Record<string, string> = {}
  const keys = Object.keys(obj)
  for (let i = 0, length = keys.length; i < length; i++) {
    result[obj[keys[i]]] = keys[i]
  }
  return result
}

const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
} as const

const unescapeMap = invert(escapeMap)

const createEscaper = (map: Record<string, string>) => {
  const escaper = (match: string): string => map[match]
  const source = '(?:' + Object.keys(map).join('|') + ')'
  const testRegexp = RegExp(source)
  const replaceRegexp = RegExp(source, 'g')

  return (string: string | null): string => {
    string = string == null ? '' : '' + string
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string
  }
}

export const htmlEscape = createEscaper(escapeMap)
export const htmlUnescape = createEscaper(unescapeMap)

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let canRun = true
  return function (this: any, ...args: Parameters<T>) {
    if (!canRun) return
    canRun = false
    setTimeout(() => {
      fn.apply(this, args)
      canRun = true
    }, delay)
  }
}

export function isNoEmptyObj(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0
}

export function getCookie(cname: string): string | undefined {
  const name = cname + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim()
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return undefined
}

export function downloadFile(file: Blob | string, name: string): void {
  const url = file instanceof Blob ? window.URL.createObjectURL(new Blob([file])) : file
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  if (url.includes('.pdf') || url.includes('.txt')) {
    link.setAttribute('target', '_blank')
  }
  link.setAttribute('download', name)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const responseToJson = async (data: Blob): Promise<any> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      try {
        const jsonData = JSON.parse(this.result as string)
        resolve(jsonData)
      } catch (err) {
        console.log(err)
        reject(err)
      }
    }
    fileReader.readAsText(data)
  })
}

export function specialTopicParamsHandle(specialTopicParams?: string): SpecialTopicParams {
  if (!specialTopicParams) {
    specialTopicParams = sessionStorage.getItem('specialTopicParams') || ''
  }
  specialTopicParams = decodeURIComponent(specialTopicParams)
  const specialTopicArr = specialTopicParams.split('||')
  const NONE = 'null'

  return {
    title: specialTopicArr[0] || NONE,
    disContent: typeof specialTopicArr[1] !== 'undefined' ? specialTopicArr[1] : NONE,
    itemId: specialTopicArr[2] && specialTopicArr[2] !== '0' ? specialTopicArr[2] : NONE,
    place: typeof specialTopicArr[3] !== 'undefined' ? specialTopicArr[3] : NONE,
    comType: typeof specialTopicArr[4] !== 'undefined' ? specialTopicArr[4] : NONE
  }
}

export function queryLocationParamAppInstanceId(): string {
  const routParams = queryLocationParam()
  return routParams.appInstanceId || ''
}

export function getQueryObject(url?: string): Record<string, string> {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj: Record<string, string> = {}
  const reg = /([^?&=]+)=([^?&=]*)/g

  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })

  return obj
}

interface QueryAplusUrlArgs {
  [key: string]: any
}

interface RedirectParams {
  redirectUrl?: string
  enterpriseParamId?: string
  [key: string]: any
}

export function queryAplusUrl(
  page: string,
  args: QueryAplusUrlArgs = {},
  redirect: RedirectParams = {}
): string {
  function getClientFrom(): string {
    let returnClientFrom = localStorage.getItem('theme') || 'mobile'
    if (queryLocationParamAppInstanceId()) {
      returnClientFrom = 'flz'
    }
    return returnClientFrom
  }

  // 从环境变量中获取构建类型
  const type = import.meta.env.VUE_APP_BUILD_TYPE as string
  const routParams = queryLocationParam()
  const clientFrom = getClientFrom()
  const enterpriseId =
    JSON.parse(localStorage.getItem('selEnterprise') || '{}')?.enterpriseId ||
    (routParams && (routParams.ascriptionId || routParams.enterpriseId)) ||
    redirect?.enterpriseParamId
  const preUrl = defaultConfig.HOST_AUTH

  let href = window.location.href.split('?')[0]
  const param = { ...routParams }

  if (enterpriseId) {
    param.enterpriseId = enterpriseId
  }

  delete param.entpId
  delete param.token
  href = href.replace(/\/login|\/common\/no-eid|\/404|\/common\/404/, '/home')

  if (redirect.redirectUrl) {
    href = redirect.redirectUrl
  }

  const toUrl = encodeURIComponent(`${href}?${stringifyParam(param)}`)

  const params: Record<string, string> = {
    grant_type: 'password',
    client_id: type === 'prod' || type === 'pre' ? 'ecare' : type === 'test' ? 'ecare' : 'weboop',
    client_secret: 'password',
    redirect_url: toUrl,
    client_from: clientFrom
  }

  if (page === 'register') {
    delete params.grant_type
    delete params.client_id
    delete params.client_secret
  }

  localStorage.setItem('redirect_url', window.location.href)

  if (enterpriseId) {
    params.enterpriseId = enterpriseId
  }

  defaultConfig.login_params.forEach((item: string) => {
    if (routParams?.[item]) {
      params[item] = routParams[item]
    }
  })

  for (const key in args) {
    if (args[key]) {
      params[key] = args[key]
    }
  }

  if (routParams.type_from === 'ghtyb') {
    params.entpId = routParams.entpId
  }

  return `${preUrl}/#/${page}?${stringifyParam(params)}`
}

export function stringifyParam(params: Record<string, any>): string {
  let str = ''
  for (const it in params) {
    if (Object.prototype.hasOwnProperty.call(params, it)) {
      str += encodeURIComponent(it) + '=' + encodeURIComponent(params[it]) + '&'
    }
  }
  return str[str.length - 1] === '&' ? str.slice(0, -1) : str
}
