// 从common中拆分出来
import { isPCAndMac } from './env'
export function setCSSVar(name: string, value: string): void {
  const r = document.querySelector(':root') as HTMLElement
  r.style.setProperty(name, value)
}

export function resetMaxWidth(): void {
  let width = document.body.clientWidth || window.innerWidth
  if (window.innerWidth > width) {
    width = window.innerWidth
  }
  console.log('resetMaxWidth width=', width)
  if (!isPCAndMac() && width > 540) {
    setCSSVar('--pc-width', `${width}px`)
  }
}

export function addClass(elements: HTMLElement, cName: string): void {
  if (!hasClass(elements, cName)) {
    elements.className += ' ' + cName
  }
}

export function removeClass(elements: HTMLElement, cName: string): void {
  if (hasClass(elements, cName)) {
    elements.className = elements.className.replace(new RegExp('(\\s|^)' + cName + '(\\s|$)'), ' ')
  }
}

export function hasClass(elements: HTMLElement, cName: string): boolean {
  return !!elements.className.match(new RegExp('(\\s|^)' + cName + '(\\s|$)'))
}
