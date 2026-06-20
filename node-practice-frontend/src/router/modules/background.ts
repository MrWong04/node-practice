import type { RouteRecordRaw } from 'vue-router'

const backgroundRoutes: RouteRecordRaw[] = [
  {
    path: '/background',
    component: () => import('@/layout/background/index.vue'),
    children: [
      {
        path: '',
        name: 'BackgroundDashboard',
        component: () => import('@/views/background/dashboard/index.vue'),
        meta: {
          title: '数据概览'
        }
      },
      {
        path: 'dashboard/analytics',
        name: 'BackgroundAnalytics',
        component: () => import('@/views/background/analytics/index.vue'),
        meta: {
          title: '访问分析'
        }
      },
      {
        path: 'content/articles',
        name: 'BackgroundArticles',
        component: () => import('@/views/background/articles/index.vue'),
        meta: {
          title: '文章列表'
        }
      },
      {
        path: 'content/articles/create',
        name: 'BackgroundArticleCreate',
        component: () => import('@/views/background/articles/edit.vue'),
        meta: {
          title: '新增文章'
        }
      },
      {
        path: 'content/articles/edit/:id',
        name: 'BackgroundArticleEdit',
        component: () => import('@/views/background/articles/edit.vue'),
        meta: {
          title: '编辑文章'
        }
      },
      {
        path: 'content/categories',
        name: 'BackgroundCategories',
        component: () => import('@/views/background/categories/index.vue'),
        meta: {
          title: '分类管理'
        }
      },
      {
        path: 'content/tags',
        name: 'BackgroundTags',
        component: () => import('@/views/background/tags/index.vue'),
        meta: {
          title: '标签管理'
        }
      },
      {
        path: 'system/users',
        name: 'BackgroundUsers',
        component: () => import('@/views/background/users/index.vue'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'system/roles',
        name: 'BackgroundRoles',
        component: () => import('@/views/background/roles/index.vue'),
        meta: {
          title: '角色权限'
        }
      }
    ]
  }
]

export default backgroundRoutes
