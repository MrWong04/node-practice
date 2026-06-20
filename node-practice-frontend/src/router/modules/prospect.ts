import type { RouteRecordRaw } from 'vue-router'

const prospectRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/prospect/index.vue'),
    children: [
      {
        path: '',
        name: 'ProspectHome',
        component: () => import('@/views/prospect/home/index.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: 'category',
        name: 'ProspectCategory',
        component: () => import('@/views/prospect/category/index.vue'),
        meta: {
          title: '分类'
        }
      },
      {
        path: 'archive',
        name: 'ProspectArchive',
        component: () => import('@/views/prospect/archive/index.vue'),
        meta: {
          title: '归档'
        }
      },
      {
        path: 'article/:id',
        name: 'ProspectArticleDetail',
        component: () => import('@/views/prospect/article/index.vue'),
        meta: {
          title: '文章详情'
        }
      }
    ]
  }
]

export default prospectRoutes
