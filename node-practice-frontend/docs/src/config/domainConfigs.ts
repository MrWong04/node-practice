/**
 * 配置不同域名对应的 appId 和主题名称
 * @params {String} name 主题域名
 * @params {String} themeName 主题名
 * @params {number} appId 一键登录appId
 * @params {Boolean} isOneKeyLogin 是否开启一键登录
 * @params {Array} privacyList 隐私政策列表
 */
export const domainConfigs = [
  {
    name: 'qxt.liuliangjia.cn',
    themeName: 'gxzhsp',
    appId: 300012473469,
    isOneKeyLogin: true,
    privacyList: [
      {
        name: '《隐私政策》',
        url: 'https://bstore.gxcmcc.com/auth/privacy.html'
      },
      {
        name: '《服务协议》',
        url: 'https://bstore.gxcmcc.com/auth/protocol.html'
      }
    ]
  },
  {
    name: 'newqxt.liuliangjia.cn',
    themeName: 'gdqxt',
    appId: null,
    isOneKeyLogin: false,
    privacyList: [
      {
        name: '《隐私政策》',
        url: 'https://qxt.liuliangjia.cn:8606/zy/grmplatform-qg/static/h5.html'
      },
      {
        name: '《服务协议》',
        url: 'https://qxt.liuliangjia.cn:8606/zy/grmplatform-qg/static/web.html'
      }
    ]
  },
  {
    name: 'bstore.gxcmcc.com',
    themeName: 'gxzhsp',
    appId: 300012473469,
    isOneKeyLogin: true,
    privacyList: [
      {
        name: '《隐私政策》',
        url: 'https://bstore.gxcmcc.com/auth/privacy.html'
      },
      {
        name: '《服务协议》',
        url: 'https://bstore.gxcmcc.com/auth/protocol.html'
      }
    ]
  }
]
