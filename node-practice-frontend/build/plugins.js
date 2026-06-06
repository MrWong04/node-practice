import vue from '@vitejs/plugin-vue'
import viteEslint from 'vite-plugin-eslint'
import { createHtmlPlugin } from 'vite-plugin-html'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
// import basicSsl from '@vitejs/plugin-basic-ssl'
// import tsPlugin from 'vite-plugin-ts'

export default [
  vue(),
  // tsPlugin(),
  viteEslint(),
  // basicSsl(),
  createHtmlPlugin({
    inject: {
      data: {
        title: 'vue3 vite'
      }
    }
  }),
  Components({
    // 指定组件位置，默认是src/components
    dirs: ['src/components'],
    // ui库解析器
    resolvers: [VantResolver()],
    extensions: ['vue'],
    // 配置文件生成位置
    dts: 'src/components.d.ts'
  })
]
