// 从common中拆分出来
function isObject(value: any): boolean {
  return value !== null && typeof value === 'object'
}

function isSupportStorage(): boolean {
  return !!(window.sessionStorage && window.localStorage)
}

export function setLocalStorage(name: string, value: any): void {
  if (!isSupportStorage()) {
    return
  }

  let list: string[] = []
  let obj: Record<string, any> = {}
  let objName = ''

  if (name.includes('.')) {
    list = name.split('.')
    const shiftedName = list.shift()
    if (shiftedName !== undefined) {
      objName = shiftedName
      obj = getLocalStorage(objName)
      obj = isObject(obj) ? obj : {}
      _turn(obj, list, value)
      value = JSON.stringify(obj)
      localStorage.setItem(objName, value)
    }
  } else {
    if (isObject(value)) {
      value = JSON.stringify(value)
    }
    localStorage.setItem(name, value)
  }
}

function _turn(obj: Record<string, any>, list: string[], value: any): void {
  let name: string
  if (list.length > 1) {
    const shiftedName = list.shift()
    // 确保 name 不为 undefined
    if (shiftedName !== undefined) {
      name = shiftedName
      obj[name] = isObject(obj[name]) ? obj[name] : {}
      _turn(obj[name], list, value)
    }
  } else {
    name = list[0]
    obj[name] = value
  }
}

export function getLocalStorage(name: string): any {
  if (!isSupportStorage()) return null
  const value = localStorage.getItem(name)
  if (value === null) return null
  try {
    if (/^[[{].*[\]}]$/.test(value)) {
      return JSON.parse(value)
    }
    return value
  } catch (e) {
    return value
  }
}

// ... sessionStorage相关函数的实现类似
export function getSessionStorage(name: string): any {
  if (!isSupportStorage()) return null
  const value = sessionStorage.getItem(name)

  if (!value) return null

  try {
    return JSON.parse(value)
  } catch (e) {
    // 如果解析失败，返回原始值
    return value
  }
}

export function setSessionStorage(name: string, value: any): void {
  if (!isSupportStorage()) {
    return
  }

  let list: string[] = []
  let obj: Record<string, any> = {}
  let objName = ''

  if (name.includes('.')) {
    list = name.split('.')
    const shiftedName = list.shift()
    if (shiftedName !== undefined) {
      objName = shiftedName
      obj = getSessionStorage(objName)
      obj = isObject(obj) ? obj : {}
      _turn(obj, list, value)
      value = JSON.stringify(obj)
      sessionStorage.setItem(objName, value)
    }
  } else {
    if (isObject(value)) {
      value = JSON.stringify(value)
    }
    sessionStorage.setItem(name, value)
  }

  function _turn(obj: Record<string, any>, list: string[], value: any): void {
    let name: string
    if (list.length > 1) {
      const shiftedName = list.shift()
      // 确保 name 不为 undefined
      if (shiftedName !== undefined) {
        name = shiftedName
        obj[name] = isObject(obj[name]) ? obj[name] : {}
        _turn(obj[name], list, value)
      }
    } else {
      name = list[0]
      obj[name] = value
    }
  }
}
