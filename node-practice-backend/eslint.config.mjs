// ===========================================================================
// eslint.config.mjs — ESLint 扁平化配置文件 (Flat Config)
// ===========================================================================
// 使用 .mjs 扩展名，采用 ES Module 语法 (import/export)
// 这是 ESLint v9+ 的推荐配置方式，替代传统的 .eslintrc.* 文件
// 参考文档: https://eslint.org/docs/latest/use/configure/configuration-files
// ===========================================================================

// ---------------------------------------------------------------------------
// 导入核心依赖
// ---------------------------------------------------------------------------

// @eslint/js — ESLint 官方推荐的 JavaScript 规则集
// 包含 eslint:recommended 的所有规则，以程序化方式导出
import js from '@eslint/js'

// globals — 提供 ESLint 环境全局变量定义（如 node, browser, commonjs）
// 用于声明项目运行环境，避免 no-undef 规则误报内置全局变量
import globals from 'globals'

// typescript-eslint — TypeScript 官方 ESLint 插件和解析器
// 包含 @typescript-eslint/recommended 规则集，用于类型感知检查
import ts from 'typescript-eslint'

// eslint-config-prettier — 关闭与 Prettier 冲突的 ESLint 规则
// 必须放在配置数组的最后，确保 ESLint 不会覆盖 Prettier 的格式决定
import prettierConfig from 'eslint-config-prettier'

// eslint-plugin-prettier — 将 Prettier 作为 ESLint 规则运行
// 好处: 统一报告入口，在 ESLint 报错中直接显示 Prettier 格式问题
import prettierPlugin from 'eslint-plugin-prettier'

// ---------------------------------------------------------------------------
// 导出配置数组
// ---------------------------------------------------------------------------
// ESLint Flat Config 采用数组形式，后面的配置会覆盖前面的同名规则
// 数组顺序: 基础 JS 规则 → TS 规则 → 自定义规则 → Prettier 兼容

export default [
  // -------------------------------------------------------------------------
  // 全局忽略: 不需要 Lint 的文件和目录
  // -------------------------------------------------------------------------
  // ESLint Flat Config 中，ignores 必须单独作为一个配置对象放在数组最前面
  // 这里忽略: 依赖目录、编译产物、编辑器配置、格式化配置文件本身
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.git/**',
      '.vscode/**',
      '.idea/**',
      // 忽略 Prettier/ESLint 配置文件本身（它们不是项目源码）
      '.prettierrc.cjs',
      'eslint.config.mjs',
    ],
  },
  // -------------------------------------------------------------------------
  // 第一层: ESLint 推荐的 JavaScript 规则
  // -------------------------------------------------------------------------
  // 包含 no-unused-vars, eqeqeq, no-console 等基础规则
  // 这是所有 JS/TS 项目的安全基线
  js.configs.recommended,

  // -------------------------------------------------------------------------
  // 第二层: TypeScript 推荐规则
  // -------------------------------------------------------------------------
  // typescript-eslint 导出的配置对象，包含:
  // - @typescript-eslint/no-unused-vars (替代 ESLint 原生版本)
  // - @typescript-eslint/explicit-function-return-type 等
  // 注意: 此配置会自动设置 parser 为 @typescript-eslint/parser
  ...ts.configs.recommended,

  // -------------------------------------------------------------------------
  // 第三层: 项目自定义规则
  // -------------------------------------------------------------------------
  {
    // name — 配置块的标识名称，方便调试时定位规则来源
    name: 'node-practice/custom-rules',

    // files — 指定本配置块适用的文件匹配模式
    // 这里限定为项目中的 TypeScript/JavaScript 源码和测试文件
    files: ['src/**/*.ts', 'src/**/*.js', 'tests/**/*.ts', 'tests/**/*.js'],

    // languageOptions — 语言解析相关选项
    languageOptions: {
      // Node.js 环境全局变量（require, module, console, process 等）
      // 避免 ESLint 报 'require' is not defined 和 'console' is not defined
      globals: globals.node,

      // parserOptions — 传递给解析器的额外选项
      parserOptions: {
        // project — 指向 tsconfig.json，启用"类型感知"规则
        // 类型感知规则能利用 TS 类型信息做出更精确的判断（如 promise 误用）
        project: './tsconfig.json',
      },
    },

    // plugins — 注册 ESLint 插件
    // 这里注册 prettier 插件，使其规则可以在 rules 中引用
    plugins: {
      prettier: prettierPlugin,
    },

    // rules — 具体规则配置
    // "error" / 2 = 报错并退出非零状态
    // "warn"  / 1 = 警告但不阻断
    // "off"   / 0 = 关闭规则
    rules: {
      // -----------------------------------------------------------------------
      // Prettier 集成规则
      // -----------------------------------------------------------------------
      // "prettier/prettier": "error" 表示将 Prettier 格式问题视为 ESLint 错误
      // 这样在运行 eslint --fix 时，Prettier 问题也会一并自动修复
      'prettier/prettier': 'error',

      // -----------------------------------------------------------------------
      // 代码质量规则
      // -----------------------------------------------------------------------
      // console.log 在生产代码中应尽量避免，但开发时可用
      // 设为 warn 级别，提醒但不强制阻断提交
      'no-console': 'warn',

      // -----------------------------------------------------------------------
      // TypeScript 专用规则覆盖
      // -----------------------------------------------------------------------
      // @typescript-eslint/no-unused-vars — 检查未使用的变量
      // argsIgnorePattern: '^_' 表示以下划线开头的参数名不算未使用
      // 这是 TypeScript 的惯用约定，用于占位参数
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 1,
    },
  },

  // -------------------------------------------------------------------------
  // 第四层: Prettier 兼容配置（必须放最后）
  // -------------------------------------------------------------------------
  // eslint-config-prettier 会关闭所有与 Prettier 格式决策冲突的 ESLint 规则
  // 例如: indent, max-len, semi, quotes 等格式类规则
  // 这样 Prettier 负责"格式"，ESLint 负责"代码质量"，职责分离
  prettierConfig,
]
