export default {
  port: 8080,
  host: '0.0.0.0',
  transpileDependencies: true,
  proxy: {
    '/local': {
      // target: 'http://localhost:3002',
      target: 'http://192.168.5.144:3002',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/local/, '')
    }
  }
}
