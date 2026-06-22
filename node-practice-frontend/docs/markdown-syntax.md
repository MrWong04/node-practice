# Markdown 语法完全指南

> 本文涵盖了所有标准 Markdown 语法及常用扩展，可直接复制到编辑器中测试渲染效果。

---

## 1. 标题（Headings）

```markdown
# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题
```

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

---

## 2. 段落与换行

这是普通段落。段落之间用空行分隔。

这是另一个段落。行末加两个空格可以强制换行，  
这就是换行后的效果。

---

## 3. 文字样式（Emphasis）

| 样式     | 语法                     | 效果         |
| -------- | ------------------------ | ------------ |
| 斜体     | `*斜体*` 或 `_斜体_`     | _斜体_       |
| 粗体     | `**粗体**` 或 `__粗体__` | **粗体**     |
| 粗斜体   | `***粗斜体***`           | **_粗斜体_** |
| 删除线   | `~~删除线~~`             | ~~删除线~~   |
| 行内代码 | `` `code` ``             | `code`       |

---

## 4. 引用块（Blockquotes）

> 这是单行引用。

> 多行引用也可以。
> 只要每行都以 `>` 开头。
>
> 空行也要加 `>` 才能保持引用状态。

> 嵌套引用：
>
> > 这是第二层引用。
> >
> > > 这是第三层引用。

> 引用中也可以包含其他元素：
>
> - 列表项
> - **粗体文字**
> - `行内代码`

---

## 5. 列表（Lists）

### 无序列表

- 项目 1
- 项目 2
  - 子项目 2a
  - 子项目 2b
    - 子子项目 2b1
- 项目 3

也可以用 `*` 或 `+`：

- 星号列表

* 加号列表

- 减号列表

### 有序列表

1. 第一步
2. 第二步
   1. 子步骤 2.1
   2. 子步骤 2.2
3. 第三步

### 任务列表（GFM）

- [x] 已完成任务
- [ ] 未完成任务
- [x] 选中状态
- [ ] 未选中状态

### 混合列表

1. 有序项目 1
   - 无序子项
   - 无序子项
2. 有序项目 2
   > 引用块在列表中

---

## 6. 代码（Code）

### 行内代码

使用 `console.log()` 输出调试信息。`npm run dev` 启动开发服务器。

### 代码块（Fenced Code Blocks）

```javascript
// 带语言标识的代码块
function hello(name) {
  return `Hello, ${name}!`
}

console.log(hello('Markdown'))
```

```python
# Python 代码
class Person:
    def __init__(self, name):
        self.name = name

    def greet(self):
        print(f"Hello, {self.name}!")
```

```html
<!-- HTML 代码 -->
<div class="container">
  <h1>Hello World</h1>
  <p>This is a paragraph.</p>
</div>
```

```css
/* CSS 代码 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}
```

### 缩进代码块

    这是缩进代码块。
    每行至少4个空格或1个Tab。
    不太常用，但支持。

---

## 7. 分隔线（Horizontal Rules）

三种写法都可以：

---

---

---

---

## 8. 链接（Links）

### 行内链接

[访问 Vue.js 官网](https://vuejs.org)

[带标题的链接](https://vuejs.org 'Vue.js 官方网站')

### 引用式链接

[Vue.js][1] 是一个渐进式 JavaScript 框架。

[React][2] 和 [Angular][3] 也很流行。

[1]: https://vuejs.org
[2]: https://react.dev
[3]: https://angular.io

### 自动链接

<https://github.com>

<mailto:example@email.com>

---

## 9. 图片（Images）

### 行内图片

![这是一张示例图片](https://picsum.photos/400/300)

### 带标题的图片

![风景图片](https://picsum.photos/400/300 '随机风景图片')

### 引用式图片

![Logo][logo]

[logo]: https://picsum.photos/200/100 '示例 Logo'

---

## 10. 表格（Tables）

### 基础表格

| 姓名 | 年龄 | 职业     |
| ---- | ---- | -------- |
| 张三 | 28   | 工程师   |
| 李四 | 32   | 设计师   |
| 王五 | 25   | 产品经理 |

### 对齐方式

| 左对齐 | 居中对齐 | 右对齐 |
| :----- | :------: | -----: |
| 内容 1 |  内容 2  | 内容 3 |
| 左     |    中    |     右 |
| A      |    B     |      C |

### 表格内使用其他元素

| 语法          | 效果                        | 说明     |
| ------------- | --------------------------- | -------- |
| `**粗体**`    | **粗体**                    | 强调文字 |
| `[链接](url)` | [链接](https://example.com) | 超链接   |
| `` `code` ``  | `code`                      | 行内代码 |
| `~~删除~~`    | ~~删除~~                    | 删除线   |

---

## 11. HTML 内嵌（HTML）

可以直接使用 HTML 标签：

<details>
  <summary>点击查看折叠内容</summary>
  这是被折叠的内容，使用了 HTML 的 details 标签。
</details>

<span style="color: #409eff">蓝色文字</span>

<mark>高亮文字</mark>

---

## 12. 脚注（Footnotes）

这是一个带脚注的句子[^1]。

另一个脚注[^2]可以包含更多内容。

[^1]: 这是第一个脚注的内容。
[^2]: 这是第二个脚注，可以写很长很长的说明文字。

---

## 13. 定义列表（Definition Lists）

术语 1
: 定义 1

术语 2
: 定义 2

---

## 14. 数学公式（Math - KaTeX/MathJax）

行内公式：$E = mc^2$

块级公式：

$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

$$
\int_{a}^{b} f(x) \, dx = F(b) - F(a)
$$

---

## 15. 目录（Table of Contents）

- [Markdown 语法完全指南](#markdown-语法完全指南)
  - [1. 标题（Headings）](#1-标题headings)
- [一级标题](#一级标题)
  - [二级标题](#二级标题)
    - [三级标题](#三级标题)
      - [四级标题](#四级标题)
        - [五级标题](#五级标题)
          - [六级标题](#六级标题)
  - [2. 段落与换行](#2-段落与换行)
  - [3. 文字样式（Emphasis）](#3-文字样式emphasis)
  - [4. 引用块（Blockquotes）](#4-引用块blockquotes)
  - [5. 列表（Lists）](#5-列表lists)
    - [无序列表](#无序列表)
    - [有序列表](#有序列表)
    - [任务列表（GFM）](#任务列表gfm)
    - [混合列表](#混合列表)
  - [6. 代码（Code）](#6-代码code)
    - [行内代码](#行内代码)
    - [代码块（Fenced Code Blocks）](#代码块fenced-code-blocks)
    - [缩进代码块](#缩进代码块)
  - [7. 分隔线（Horizontal Rules）](#7-分隔线horizontal-rules)
  - [8. 链接（Links）](#8-链接links)
    - [行内链接](#行内链接)
    - [引用式链接](#引用式链接)
    - [自动链接](#自动链接)
  - [9. 图片（Images）](#9-图片images)
    - [行内图片](#行内图片)
    - [带标题的图片](#带标题的图片)
    - [引用式图片](#引用式图片)
  - [10. 表格（Tables）](#10-表格tables)
    - [基础表格](#基础表格)
    - [对齐方式](#对齐方式)
    - [表格内使用其他元素](#表格内使用其他元素)
  - [11. HTML 内嵌（HTML）](#11-html-内嵌html)
  - [12. 脚注（Footnotes）](#12-脚注footnotes)
  - [13. 定义列表（Definition Lists）](#13-定义列表definition-lists)
  - [14. 数学公式（Math - KaTeX/MathJax）](#14-数学公式math---katexmathjax)
  - [15. 目录（Table of Contents）](#15-目录table-of-contents)
  - [16. 注释](#16-注释)
  - [17. 特殊字符转义](#17-特殊字符转义)
  - [18. 表情符号（Emoji）](#18-表情符号emoji)
  - [19. 高亮（Highlight）](#19-高亮highlight)
  - [20. 上标与下标](#20-上标与下标)

---

## 16. 注释

<!-- 这是 HTML 注释，在渲染后的页面中不可见 -->

[comment]: <> (这是另一种注释方式)

---

## 17. 特殊字符转义

如果你需要显示原生的 Markdown 符号，可以使用反斜杠转义：

\* 这不是斜体 \*

\# 这不是标题

\[这不是链接\](url)

\` 这不是代码 \`

---

## 18. 表情符号（Emoji）

:smile: :heart: :thumbsup: :rocket: :star: :fire: :sparkles:

---

## 19. 高亮（Highlight）

==高亮文字==（部分解析器支持）

---

## 20. 上标与下标

上标：x^2^ + y^2^ = z^2^

下标：H~2~O、CO~2~

---

> **总结**：Markdown 的设计哲学是「易读易写」，用简单的符号标记文本结构，让作者专注于内容而非排版。本文涵盖了从基础到扩展的完整语法，可作为日常参考或测试 Markdown 渲染器的标准文档。
