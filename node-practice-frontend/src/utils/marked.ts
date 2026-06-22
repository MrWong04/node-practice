import { marked } from 'marked'

/**
 * 使 Markdown 渲染后的链接在新标签页打开
 * 在渲染完成后，通过 DOM 操作给所有 a 标签添加 target="_blank"
 */
export function addTargetBlank(html: string): string {
  // 使用正则替换所有 a 标签，添加 target="_blank" 和 rel="noopener noreferrer"
  return html.replace(/<a\s+([^>]+)>/gi, (match) => {
    // 检查是否已有 target 属性
    if (match.includes('target=')) {
      return match
    }
    // 在 href 后插入 target="_blank" 和 rel="noopener noreferrer"
    return match.replace(/href="([^"]+)"/, 'href="$1" target="_blank" rel="noopener noreferrer"')
  })
}

export { marked }
