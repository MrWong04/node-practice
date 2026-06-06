const homeRoutes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '',
      showTitle: false
    }
  },
  {
    path: '/answer',
    name: 'Answer',
    component: () => import('@/views/home/answer.vue'),
    meta: {
      title: '',
      showTitle: false
    }
  }
]

export default homeRoutes
