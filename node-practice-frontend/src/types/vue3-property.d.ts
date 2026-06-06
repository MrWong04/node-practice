export {}
declare module 'vue' {
  interface ComponentCustomProperties {
    $priceTypeFormat: (type: 'price' | 'unit', value: number) => string
  }
}
