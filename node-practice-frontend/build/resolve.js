import { fileURLToPath, URL } from 'node:url'
import path from 'path'

export default {
  alias: {
    '@': fileURLToPath(new URL('../src', import.meta.url)),
    '@smart-market': path.resolve(__dirname, '../src/lib') // 使用 path 解析实际路径
  }
}
