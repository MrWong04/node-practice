export default {
  port: 8080,
  host: '0.0.0.0',
  transpileDependencies: true,
  proxy: {
    '/yk': {
      // target: 'http://test.dlpm.liuliangjia.cn', // 点亮屏幕开发调试
      // target: 'http://dev.cmcc.yk.liuliangjia.cn/',
      target: 'http://test.yingke.com',
      // target: 'http://test.yk.liuliangjia.cn', // 现网
      changeOrigin: true
    },
    '/sms': {
      //图片代理
      // target: 'http://test.dlpm.liuliangjia.cn', // 点亮屏幕开发调试
      target: 'http://test.yk.liuliangjia.cn', // 现网
      changeOrigin: true
    },
    '/dlpm-auth': {
      //登录代理
      // target: 'http://test.dlpm.liuliangjia.cn', // 点亮屏幕开发调试
      target: 'http://10.9.201.153:8080', // 现网
      changeOrigin: true
    }
  }
}
