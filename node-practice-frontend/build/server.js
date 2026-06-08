export default {
  port: 8080,
  host: '0.0.0.0',
  transpileDependencies: true,
  proxy: {
    '/local': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
