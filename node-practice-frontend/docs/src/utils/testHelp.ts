import VConsole from 'vconsole'

// 开启调试
export function openTest(): void {
  const logDom = document.getElementById('__vconsole')
  if (logDom) {
    logDom.style.display = 'block'
  } else {
    const vConsole = new VConsole()
    console.log('VConsole 开启', vConsole)
  }
}

// 关闭调试
export function closeTest(): void {
  const logDom = document.getElementById('__vconsole')
  if (logDom) {
    logDom.style.display = 'none'
  }
}
