declare module 'vue3-slide-verify' {
  import { DefineComponent } from 'vue'

  export interface SlideVerifyInstance {
    reset: () => void
  }

  const SlideVerify: DefineComponent<{
    sliderText?: string
    accuracy?: number
  }>

  export default SlideVerify
}
