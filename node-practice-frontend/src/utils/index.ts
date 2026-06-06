// 随机生成64个字符
export const get64String = () => {
  const str = '12345qwertyui67890opasdfghj09876klzxcvbnm54321'
  let res = ''
  for (let i = 0; i < 48; i++) {
    res += str.split('')[Math.floor(Math.random() * str.length)]
  }
  return `${Date.now()}asp${res}`.toUpperCase()
}
export const priceTypeFormat = (type: 'price' | 'unit', value: number) => {
  const format: Record<'price' | 'unit', Record<number, string>> = {
    price: {
      1: '一次性费用',
      2: '月租费用',
      3: '年费费用'
    },
    unit: {
      1: '元',
      2: '元/月',
      3: '元/年',
      4: '元/月/路',
      5: '元起'
    }
  }
  return format[type]?.[value] || ''
}

/** 本地存储操作 */
export const storage = {
  set(key: any, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: any) {
    try {
      const value = localStorage.getItem(key)
      if (value === null || value === undefined || value === '') {
        return null
      }
      return JSON.parse(localStorage.getItem(key) as string)
    } catch (err) {
      return null
    }
  },
  remove(key: any) {
    localStorage.removeItem(key)
  }
}

/**
 * 优化 try-catch 的错误处理
 * @param {*} asyncFun 异步函数
 * @param {*} params
 * @returns [err, res] 返回被捕获异常和成功的结果
 */
export const captured = async (asyncFun: any, params?: any) => {
  try {
    const res = await asyncFun(params)
    return [null, res]
  } catch (err) {
    return [err, null]
  }
}

/**
 * 响应二进制数据出错时的处理
 * @param {Object} data 接口返回的响应对象
 * @returns {Promise} 处理后的响应对象
 */
export function responseToJson(data: any) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      try {
        // 说明是普通对象数据，后台转换失败
        const jsonData = JSON.parse(this.result as any)
        resolve(jsonData)
      } catch (err) {
        // 解析成对象失败，说明是正常的文件流
        // console.log(err)
        reject(err)
      }
    }
    fileReader.readAsText(data)
  })
}

// const url = ref<string>('https://newcall.yhszd.com:8606')
export function httpPro(url: any) {
  if (!/^https?:\/\//i.test(url)) {
    url = window.origin + url
  }
  return url
}

/**
 * px 单位转换 vw
 */
export function px2vw(px: any) {
  if (/%/gi.test(px)) {
    return px
  } else {
    // 如果px小于等于1像素不进行转换 || 750 UI设计稿的宽度
    return parseFloat(px) <= 1 ? px : (parseFloat(px) / 750) * 100 + 'vw'
  }
}

export const isWx = () => /MicroMessenger/.test(window.navigator.userAgent)
