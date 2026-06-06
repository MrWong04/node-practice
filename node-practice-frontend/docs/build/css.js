import { normalizePath } from 'vite'
import path from 'path'
import autoprefixer from 'autoprefixer'
import postcsspxtoviewport from 'postcss-px-to-viewport'

// 全局 scss 文件的路径
// 用 normalizePath 解决 window 下的路径问题
const variablePath = normalizePath(path.resolve('./src/styles/variable.scss'))

export default {
  extract: true,
  modules: {
    // 其中，name 表示当前文件名，local 表示类名
    generateScopedName: '[name]__[local]___[hash:base64:5]'
  },
  preprocessorOptions: {
    // 省略预处理器配置
    scss: {
      // additionalData 的内容会在每个 scss 文件的开头自动注入
      additionalData: `@import "${variablePath}";`
    }
  },
  postcss: {
    plugins: [
      autoprefixer({
        // 指定目标浏览器
        overrideBrowserslist: ['Chrome > 40', 'ff > 31', 'ie 11']
      }),
      postcsspxtoviewport({
        unitToConvert: 'px', // 要转化的单位
        viewportWidth: 750, // UI设计稿的宽度
        unitPrecision: 6, // 转换后的精度，即小数点位数
        propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
        viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
        fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
        selectorBlackList: ['ignore-'], // 指定不转换为视窗单位的类名，
        minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
        mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
        replace: true, // 是否转换后直接更换属性值
        exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
        landscape: false // 是否处理横屏情况
      })
    ]
  }
}
