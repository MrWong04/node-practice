# Vue3+Vite+ts项目配置

## 一、环境要求

- Node 16+
- npm 8+
- 安装时 npm install --legacy-peer-deps
## 二、配置说明

### 1、css相关配置

`amfe-flexible` 官方文档说明：https://github.com/amfe/lib-flexible

> 由于`viewport`单位得到众多浏览器的兼容，`lib-flexible`这个过渡方案已经可以放弃使用，不管是现在的版本还是以前的版本，都存有一定的问题。建议大家开始使用`viewport`来替代此方。

因此选用：`postcss-px-to-viewport`

相关配置：

```js
// build\css.js
import postcsspxtoviewport from 'postcss-px-to-viewport'

postcss: {
    plugins: [
      postcsspxtoviewport({
        unitToConvert: 'px', // 要转化的单位
        viewportWidth: 750, // UI设计稿的宽度
        unitPrecision: 6, // 转换后的精度，即小数点位数
        propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
        viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
        fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
        selectorBlackList: ['ignore-'], // 指定不转换为视窗单位的类名，
        minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
        mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
        replace: true, // 是否转换后直接更换属性值
        exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
        landscape: false // 是否处理横屏情况
      })
    ]
  }

```



### 2、插件相关配置

#### `（1）unplugin-vue-components`自动导入插件

1. 按需获取vantUI组件
2. 全局引入src/components组件

```js
// build\plugins.js
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

export default [
  Components({
    // 指定组件位置，默认是src/components
    dirs: ['src/components'],
    // ui库解析器
    resolvers: [VantResolver()],
    extensions: ['vue'],
    // 配置文件生成位置
    dts: 'src/components.d.ts'
  })
]
```



#### `（2）unplugin-auto-import` 自动引入库api（暂不配置）

> 自动引入库api，如'vue', 'vue-router', 'pinia'

```js
// build\plugins.js
import AutoImport from 'unplugin-auto-import/vite'

export default [
 AutoImport({
    imports: ['vue', 'vue-router', 'pinia'], // 自动导入vue和vue-router相关函数
    eslintrc: {
      enabled: true, // Default `false`
      filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
      globalsPropValue: true // Default `true`, 
    }
  }),
]
```



### 3、代码规范配置

### （1）eslint规范配置

**build\plugins.js**

```js
// build\plugins.js
import viteEslint from 'vite-plugin-eslint'

export default [
   viteEslint()
]
```

**.eslintrc.cjs**

```js
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    //关闭组件命名规则
    'vue/multi-word-component-names': 'off'
  },
  globals: {
    error: true,
    process: 'readonly',
    wx: 'readonly',
    window: 'readonly'
  }
}

```

#### （2）prettierrc规范配置

```js
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "tabWidth": 2,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "none"
}
```

####　（3）stylelintrc　css书写规范配置（暂不配置）

相关插件package

```js
"stylelint": "^14.8.2",
"stylelint-config-prettier": "^9.0.3",
"stylelint-config-recess-order": "^3.0.0",
"stylelint-config-standard": "^25.0.0",
"stylelint-config-standard-scss": "^3.0.0",
"stylelint-prettier": "^2.0.0",
```

**.stylelintrc.js**

```js
module.exports = {
    // 注册 stylelint 的 prettier 插件
    plugins: ['stylelint-prettier'],
    // 继承一系列规则集合
    extends: [
        // standard 规则集合
        'stylelint-config-standard',
        // standard 规则集合的 scss 版本
        'stylelint-config-standard-scss',
        // 样式属性顺序规则
        'stylelint-config-recess-order',
        // 接入 Prettier 规则
        'stylelint-config-prettier',
        'stylelint-prettier/recommended'
    ],
    // 配置 rules
    rules: {
        // 开启 Prettier 自动格式化功能
        'prettier/prettier': true,
        'selector-class-pattern': null,
        // "color-function-notation":"legacy",
        "color-function-notation": null, // 屏蔽background-color: rgba(0, 0, 0, 0.5);这种写法引起的警告
        "alpha-value-notation": null, // 屏蔽background-color: rgba(0, 0, 0, 0.5);中0.5引起的警告
    }
};

```

#### （4）commitlint  git提交规范配置（暂不配置）

相关插件package

```js
"@commitlint/cli": "^17.0.0",
"@commitlint/config-conventional": "^17.0.0",
"commitlint": "^17.0.0",
```

**.commitlintrc.js**

```js
// .commitlintrc.js
module.exports = {
    extends: ['@commitlint/config-conventional']
};
```

常用的 type 值包括如下:

- feat: 添加新功能。
- fix: 修复 Bug。
- chore: 一些不影响功能的更改。
- docs: 专指文档的修改。
- perf: 性能方面的优化。
- refactor: 代码重构。
- test: 添加一些测试代码等等。

## 三、文件结构说明

> 对ts的重点文件进行简要说明！

```javascript
	-build/
   ├── plugins.js            // 打包编译的插件模块
	-src/
    ├── apis/
    │   └── login/
    │         ├── login.ts   // 登录API管理
    │   			└── types.ts   // 登录API类型接口约束
  	│
    ├── router/
    │   └── types.ts        // 登录API类型接口约束
  	│
    ├── stores/
    │   └── types.ts        // 登录API类型接口约束
  	│
		├── types/
    │   ├── http.ts         // http request 的相应请求等类型接口约束
    │  	└── storesType.ts   // stores 类型接口约束
		│
		├── utils/
    │  	└── service.ts       // 统一请求工具
  	│
		├── main.ts              // 主文件入口
    │
    └── shims-vue.d.ts       // 提供一个声明文件，告诉它如何处理一些setup之类，ts无法识别的vue文件
	-env.d.ts                  // 定义对某个DefinitelyTyped声明文件的依赖
  	-vite.config.ts            // 打包工具配置文件
```



