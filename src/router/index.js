import { createRouter, createWebHistory } from 'vue-router'
import message from '@/utils/Message'

const routes = [
  {
    name: '登录',
    path: '/login',
    component: () => import('@/views/Login.vue')
  },
  {
    name: '框页面',
    path: '/',
    redirect: '/blog/list',
    component: () => import('@/views/Framework.vue'),
    children: [
      {
        name: '博客管理',
        path: '/blog/list',
        component: () => import('@/views/blog/Blog.vue')
      },
      {
        name: '博客分类',
        path: '/blog/categories',
        component: () => import('@/views/blog/Category.vue')
      },
      {
        name: '专题管理',
        path: '/special/list',
        component: () => import('@/views/special/SpecialList.vue')
      },
      {
        name: '个人信息设置',
        path: '/setting/mine',
        component: () => import('@/views/settings/MineInfo.vue')
      },
      {
        name: '博客成员',
        path: '/setting/users',
        component: () => import('@/views/settings/Member.vue')
      },
      {
        name: '系统设置',
        path: '/setting/systemSetting',
        component: () => import('@/views/settings/SystemSetting.vue')
      },
      {
        name: '回收站',
        path: '/recovery/list',
        component: () => import('@/views/recyclebin/Recyclebin.vue')
      }
    ]
  }
]

const router = createRouter({
  routes,
  history: createWebHistory()
})

// 添加一个路由守卫，如果不存在 token 强制跳转到登录页面
router.beforeEach((to, _, next) => {
  // 业务逻辑
  // to：表示要跳转到的路径
  // next 是中间件调用函数，不调用不继续向下执行
  // next('/login') 表示强制跳转到登录路由
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) {
    message.warning('Token 过期或不存在，请重新登录!')
    return next('/login')
  }
  next()
})

export default router
