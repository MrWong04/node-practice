/**
 * @description 提供一个声明文件，告诉它如何处理一些setup之类，ts无法识别的vue文件
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
