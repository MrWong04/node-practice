## 一、项目结构介绍
> 对ts的重点文件进行简要说明！

```javascript
	-build/
   ├── plugins.d.ts          // 用于 declare 声明 plugins.js 的 ts 模块 
   └── plugins.js            // 打包编译的插件模块
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
    │  	└── request.ts       // 统一请求工具
  	│
		├── main.ts              // 主文件入口
    │
    └── shims-vue.d.ts       // 提供一个声明文件，告诉它如何处理一些setup之类，ts无法识别的vue文件
	-env.d.ts                  // 定义对某个DefinitelyTyped声明文件的依赖
  -vite.config.ts            // 打包工具配置文件
```
## 二、TypeScript 配置管理
### 2.1 配置文件介绍
#### （1）编辑器环境要求

- node 14+
- typescript 4+ 
- vue3
- vite 4+
- vscode插件：Vue Language Features (Volar)、TypeScript Vue Plugin (Volar)
#### （2）严格类型检查
--strict：编译选项是所有严格类型检查编译选项的“总开关”，如下：
```json
 {
     "compilerOptions": {
         "strict": true
     }
 }
```
等同于：
```json
01 {
02     "compilerOptions": {
03         "noImplicitAny": true,
04         "strictNullChecks": true,
05         "strictFunctionTypes": true,
06         "strictBindCallApply": true,
07         "strictPropertyInitialization": true,
08         "noImplicitThis": true,
09         "alwaysStrict": true
10     }
11 }
```

严格类型配置简述：
--noImplicitAny：编译器不会对any类型进行类型检查，因此可能存在潜在的错误。
--strictNullChecks： 若没有启用“--strictNullChecks”编译选项，编译器在类型检查时将忽略undefined值和null值。
--strictFunctionTypes：函数参数类型与函数类型之间是逆变关系
--strictBindCallApply：编译器不会对以上三个内置（BindCallApply）方法进行类型检查
--strictPropertyInitialization：该编译选项用于配置编译器对类属性的初始化检查。
--noImplicitThis：程序中的this值隐式地获得了any类型，那么将产生编译错误
--alwaysStrict：在全局JavaScript代码或函数代码的开始处添加“"use strict"”指令就能够启用JavaScript严格模式
### 2.2 工程引用
> 若一个目录中包含“tsconfig.json”配置文件，那么该目录将被视为TypeScript工程的根目录。在使用工程引用时，需要在“tsconfig.json”配置文件中进行以下配置

`tsconfig.node.json` 和 `tsconfig.app.json`配置省略。
```json
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.node.json"
    },
    {
      "path": "./tsconfig.app.json"
    }
  ]
}

```
### 2.3 JS 类型检查
#### // @ts-nocheck
“// @ts-nocheck”是一个注释指令，如果为JavaScript文件添加该注释，那么相当于告诉编译器不对该JavaScript文件进行类型检查
#### // @ts-check
如果一个JavaScript文件中添加了“// @ts-check”注释指令，那么编译器将对该Java-Script文件进行类型检查，不论是否启用了“--checkJs”编译选项。
#### // @ts-ignore
“// @ts-ignore”注释指令的作用是忽略对某一行代码进行类型检查。
### 2.4 三斜线指令
> 三斜线指令是一系列指令的统称，它是从TypeScript早期版本就开始支持的编译指令

#### /// <reference path="" />
该指令用于声明TypeScript源文件之间的依赖关系。在编译一个文件时，编译器会同时将该文件中使用“/// <reference path="" />”三斜线指令引用的文件添加到编译文件列表。
#### /// <reference types="" />
该三斜线指令用来定义对某个DefinitelyTyped声明文件的依赖，或者说是对安装在“node_modules/@types”目录下的某个声明文件的依赖。
#### /// <reference lib="" />
该三斜线指令用于定义对语言内置的某个声明文件的依赖。在前文介绍过，当我们在计算机中安装TypeScript语言时，也会同时安装一些内置的声明文件。
## 三、TypeScript 项目开发实践
### 3.1 TypeScript 与 Eslint\Prettier\Visual Studio Code

- vite-plugin-eslint 用于vite编译时的语法校验
- @vue/eslint-config-typescript 用于eslint 的校验参考
- @vue/eslint-config-prettier 用于eslint 的校验后的修复参考

项目集成的eslint是使用 plugin:prettier/recommended 的推荐规范，具体配置：
```javascript
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
    process: 'readonly'
  }
}

```
## 四、TypeScript 错误处理
> 理解TypeScript的错误，以及关于TypeScript错误的一些解决方案。

### 4.1 常见的错误
#### TS2304
`Cannot find module jquery`
你可能正在使用第三方库（如Google Analytics），但是你并没有声明它，这时，TypeScript会试图避免拼写错误和使用变量。因此在使用一些额外的库时，你需要明确地声明所使用的任何内容。
#### TS2307
`Cannot find module runderscore`
你可能把第三方库作为模块来使用了，并且缺少与之对应的环境声明文件。
#### 捕获不能有类型注解的简短变量
```typescript
try{
	something();
}catch（e） {}//捕获不能有类型注解的简短变量
```
TypeScript会保护你免受JavaScript代码错误的影响，因此，请使用类型保护
```typescript
try{
	something();
}catch（e instanceof Error） {}//捕获不能有类型注解的简短变量
```
#### 接口ElementClass不能同时扩展两个Component类型
当在编译上下文中同时含有两个vue.d.ts（@types/vue/index.d.ts）时，会发生这种错误。
修复方法：

- 删除node_modules和任何package-lock（或yarn lock），然后再一次执行npm install。
-  如果这不起作用，就去查找无效的模块，并将其报告给相关项目。
### 4.2 TypeScript 实践错误记录
#### （一）vite.config.ts 配置报错
**报错 ：** import plugins from './build/plugins.ts'
**解决：**该错误提示表示在导入模块时，不能以 '.ts' 结尾的方式引入。相反，建议使用 '.js' 结尾的文件路径进行导入。
#### （二）vite.config.ts 引入js文件报错
 **报错 ：**Could not find a declaration file for module './build/plugins.js'. 'c:/Users/yuanwenlai_a/Desktop/code-place/vue3学习/vue3-vite-ts/build/plugins.js' implicitly has an 'any' type.ts
**解决：**在根目录，新建type文件夹，声明js的类型ts，创建一个名为 'plugins.d.ts' 的空白文件。该文件将用于编写该模块的类型声明。
```typescript
declare module './plugins.js' {
  const plugin: any; // 或根据实际情况指定更具体的类型
  export default plugin;
}
```
#### （三）main.ts 引入报错
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 。。。。。。。。
```
**报错：**cannot find module 'vue'. Did you mean to set the 'moduleResolution' option to 'node', or to add aliases to the 'paths' option?ts
**解决：**一个示例的 TypeScript 配置文件内容如下：

- 确保 `compilerOptions.moduleResolution` 选项设置为 `'node'`，以告诉 TypeScript 使用 Node.js 的模块解析策略。
- 如果你使用了路径别名（alias），确保 `compilerOptions.paths` 选项包含了对 Vue.js 模块的正确别名配置。
```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
#### （四）模块引入报错
在src\utils\http.ts 引入 import cancelRequest from '../stores/cancelRequest.ts' 
**报错：**An import path cannot end with a '.ts' extension. Consider importing '../stores/cancelRequest.js' instead.ts
**解决：**确认你要导入的模块文件实际上是一个 TypeScript 文件（.ts 扩展名）。如果是 JavaScript 文件（.js 扩展名），则应该直接使用文件的路径进行导入，而不需要指定扩展名。例如，将导入路径改为 **'../stores/cancelRequest'。**
#### （五）pinia里面，ts提示报错
**报错：**Property 'name' does not exist on type '
Pinia 在 TypeScript 中的类型推断可能会引发错误。这是因为 defineStore 函数返回的存储实例类型未正确识别。
**解决：**引入类型约束
```typescript
import { defineStore } from 'pinia'

interface MainState {
  name: string;
  token: string;
  userInfo: {
    account: string;
    avatar: string;
    nickname: string;
  };
}

export const useMainStore = defineStore('main', {
  // ...
  state: (): MainState => ({
    name: '超级管理员',
    token: '',
    userInfo: {
      account: '',
      avatar: '',
      nickname: ''
    }
  }),
  // ...
})
```

#### （六）vue3打包报错
(1)tagOffsetsMap[tag] ??= [];
SyntaxError: Unexpected token '??='

解决方案：需要node版本16+

(2)is a JavaScript file. Did you mean to enable the 'allowJs' option?   The file is in the program because:     Root file specified for compilation

解决：script标签加ts声明
<script lang="ts">



## 五、参考资料
| **来源标题** | **作者** | **链接** |
| --- | --- | --- |
| 《TypeScript入门与实战》 | 钟胜平 | [TypeScript入门与实战](https://weread.qq.com/web/reader/a2c321c0721cac5ea2c585fkc81322c012c81e728d9d180) |
| 《深入理解TypeScript》 | Basarat Ali Syed | [深入理解TypeScript](https://weread.qq.com/web/reader/6393276071bc6e966392234?) |
| typescript 中文教程 | / | [typescript 中文教程](http://example.com/reference3) |
| vue3 中文教程 | / | [vue3 中文教程](https://cn.vuejs.org/guide/quick-start.html) |

## 
