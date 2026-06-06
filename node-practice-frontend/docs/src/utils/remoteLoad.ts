class RemoteLoad {
  load(url: any, hasCallback: any) {
    return this.createScript(url, hasCallback)
  }

  /**
   * 创建script
   * @param url
   * @returns {Promise}
   */
  // eslint-disable-next-line no-shadow, class-methods-use-this
  createScript(url: any, hasCallback: any) {
    const that = this
    const scriptElement = document.createElement('script')
    document.body.appendChild(scriptElement)
    const promise = new Promise((resolve, reject) => {
      scriptElement.addEventListener(
        'load',
        (e) => {
          // eslint-disable-next-line no-use-before-define
          that.removeScript(scriptElement)
          if (!hasCallback) {
            resolve(e)
          }
        },
        false
      )

      scriptElement.addEventListener(
        'error',
        (e) => {
          // eslint-disable-next-line no-use-before-define
          that.removeScript(scriptElement)
          reject(e)
        },
        false
      )

      //   if (hasCallback) {
      //     // eslint-disable-next-line no-underscore-dangle
      //     window.____callback____ = function () {
      //       resolve()
      //       // eslint-disable-next-line no-underscore-dangle
      //       window.____callback____ = null
      //     }
      //   }
    })

    if (hasCallback) {
      // eslint-disable-next-line no-param-reassign
      url += '&callback=____callback____'
    }

    scriptElement.src = url

    return promise
  }

  /**
   * 移除script标签
   * @param scriptElement script dom
   */
  // eslint-disable-next-line class-methods-use-this
  removeScript(scriptElement: any) {
    document.body.removeChild(scriptElement)
  }
}

export default RemoteLoad
