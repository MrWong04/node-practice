declare module 'css-vars-ponyfill' {
  interface Options {
    rootElement?: Document | HTMLElement
    shadowDOM?: boolean
    onlyLegacy?: boolean
    watch?: boolean
  }

  function cssVars(options?: Options): void
  export default cssVars
}
