import cssVars from 'css-vars-ponyfill'
// 引入css-vars-ponyfill插件做兼容性问题处理

/**
 * 初始化 CSS 变量兼容性处理
 * 使用 css-vars-ponyfill 插件处理 CSS 变量在旧版浏览器中的兼容性问题
 */
cssVars({
  rootElement: document,
  shadowDOM: false,
  onlyLegacy: true,
  watch: true
})

/**
 * 当前主题名称
 */
const currentTheme: string = ''

/**
 * 处理主题变更
 * @param themeClass - 新的主题类名
 */
const onThemeChange = (themeClass: string): void => {
  const rootElement = document.documentElement
  const currenntThemeClass = themeClass || currentTheme
  rootElement.setAttribute('data-theme', currenntThemeClass)
}

/**
 * 应用主题
 * @param tempThemeName - 临时主题名称
 * @returns Promise<void>
 */
export const applyTheme = async (tempThemeName: string): Promise<void> => {
  // 通过url的参数获取当前theme，也可以通过缓存、请求等方式
  onThemeChange(tempThemeName)
}
