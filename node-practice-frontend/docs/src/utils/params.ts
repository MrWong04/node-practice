// 配置
const aspConfig = (window as any).aspConfig
// 环境
const type = import.meta.env.VUE_APP_BUILD_TYPE || 'dev'

const config = aspConfig[type]
const defaultConfig = {
  ...config,
  ...aspConfig
}

delete defaultConfig.dev
delete defaultConfig.test
delete defaultConfig.pre
delete defaultConfig.prod

// HOST
const HOST = defaultConfig.HOST // 默认prod
const HOST_AUTH = defaultConfig.HOST_AUTH // 默认prod

export { HOST, HOST_AUTH }
console.log('获取的配置内容', defaultConfig)

export default defaultConfig
