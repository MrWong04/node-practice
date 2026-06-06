declare module 'mockjs' {
  export interface MockjsRequestHandler {
    url: string
    type: string
    body: string
  }

  const Mock: {
    Random: any
    mock: (url: string | RegExp, type: string, template: any) => void
  }

  export default Mock
}
