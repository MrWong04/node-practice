// @ts-nocheck
import { defineConfig, normalizePath } from 'vite'
import plugins from './build/plugins.js'
import server from './build/server.js'
import resolve from './build/resolve.js'
import path from 'path'
import autoprefixer from 'autoprefixer'

// 全局 scss 文件的路径
// 用 normalizePath 解决 window 下的路径问题
const variablePath = normalizePath(path.resolve('./src/styles/variable.scss'))

export default defineConfig({
  base: './',
  plugins,
  server,
  resolve,
  // 生产环境去除 console debugger
  esbuild: {
    pure: ['console.log', 'debugger']
  },
  css: {
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
        })
      ]
    }
  }
})
