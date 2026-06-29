import { pinyin } from 'pinyin-pro'

/**
 * 将名称转换为 URL 友好的 slug
 * 中文转拼音，英文/数字保留，空格与特殊字符转为连字符
 * 例如："技术文章" -> "ji-shu-wen-zhang"，"JavaScript 教程" -> "javascript-jiao-cheng"
 */
export function generateSlug(text: string): string {
  const normalized = text
    .trim()
    .split(/([\u4e00-\u9fa5]+)/)
    .filter(Boolean)
    .map((segment) => {
      if (/^[\u4e00-\u9fa5]+$/.test(segment)) {
        return pinyin(segment, { toneType: 'none', type: 'array' }).join('')
      }
      return segment
    })
    .join('')

  return normalized
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
