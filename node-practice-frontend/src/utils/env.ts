// 从common中拆分出来
declare global {
  interface Window {
    __wxjs_environment: string
    ActiveXObject: any
  }
}

interface WXEnvironment {
  platform: string
}

declare const WXEnvironment: WXEnvironment

export function isPCAndMac(): boolean {
  const inBrowser = typeof window !== 'undefined'
  const inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform
  const weexPlatform = inWeex && WXEnvironment.platform.toLowerCase()
  const UA = inBrowser && window.navigator.userAgent.toLowerCase()

  const isAndroid = (UA && UA.indexOf('android') > 0) || weexPlatform === 'android'
  const isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || weexPlatform === 'ios'
  const isMac = UA && /mac\sos\sx/.test(UA)
  const isWeiXinPC = UA ? /windowswechat/.test(UA) : ''
  const width = document.body.clientWidth || window.innerWidth
  const isWindowsWechat = UA && UA.indexOf('windowswechat') > -1
  const isWindowsWechatMiniProgramEnv = UA && UA.indexOf('miniprogramenv/windows') > -1
  const isMacWechatMiniProgramEnv = UA && UA.indexOf('miniprogramenv/mac') > -1
  const isHarmony = UA && /openharmony/.test(UA)

  if (isWindowsWechat && (isWindowsWechatMiniProgramEnv || isMacWechatMiniProgramEnv)) {
    return false
  }

  if (isWindowsWechat) {
    return true
  }

  if (isMac && import.meta.env.MODE !== 'production') {
    return false
  }

  if (isMac && width < 540) {
    return false
  }

  if (isWeiXinPC) {
    return false
  }

  return !isAndroid && !isIOS && !isHarmony
}

export function isIE(): boolean {
  return !!window.ActiveXObject || 'ActiveXObject' in window
}

export function isWXMP(): boolean {
  return window.__wxjs_environment === 'miniprogram'
}

export function isLeadeon(): boolean {
  const ua = navigator.userAgent
  const results = ua.match(/leadeon/gi)
  return !!(results && results.length)
}
