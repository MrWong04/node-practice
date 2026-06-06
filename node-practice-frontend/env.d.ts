/// <reference types="vite/client" />

declare module '@/utils/themeManage' {
  export const applyTheme: (tempThemeName: string) => Promise<void>
}

declare module '@/config/domainConfigs' {
  export const domainConfigs: {
    name: string
    themeName: string
    appId: number | null
    isOneKeyLogin: boolean
    privacyList: {
      name: string
      url: string
    }[]
  }[]
}
