export const urlConfig = {
  // 渠道端
  corp: [{ pathname: '/cth5/' }, { pathname: '/cth5/' }],
  // 商客端
  customer: [
    { pathname: '/h5/' },
    { pathname: '/h5/' },
    {
      pathname: '/shaanxi/h5/',
      locationName: '陕西省',
      provinceId: '27',
      aloneProvince: true // 是否单独展示省份
    },
    {
      pathname: '/shaanxi/h5/',
      locationName: '陕西省',
      provinceId: '27',
      aloneProvince: true // 是否单独展示省份
    }
  ],
  testHostName: ['test.yk.liuliangjia.cn', 'dev.yk.liuliangjia.cn', 'hlqtest.liuliangjia.cn'] // 集合内域名，登录跳转无需添加/saas-yk前缀
}
