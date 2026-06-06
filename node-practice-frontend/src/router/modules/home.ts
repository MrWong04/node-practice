const homeRoutes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '数据概览'
    }
  }
]

export default homeRoutes
