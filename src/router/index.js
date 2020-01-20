import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/Login.vue'
import home from '../components/Home.vue'
import welcome from '../components/Welcome.vue'
import users from '../components/user/Users.vue'
import rights from '../components/power/Rights'
import roles from '../components/power/Roles'
import cate from '../components/goods/Cate.vue'
import params from '../components/goods/Params.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: login
  },
  {
    path: '/home',
    component: home,
    redirect: '/welcome',
    children: [{
      path: '/welcome',
      component: welcome
    }, {
      path: '/users',
      component: users
    }, {
      path: '/rights',
      component: rights
    }, {
      path: '/roles',
      component: roles
    }, {
      path: '/categories',
      component: cate
    }, {
      path: '/params',
      component: params
    }]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // ${//to and from are Route Object,next() must be called to resolve the hook}
  if (to.path === '/login') return next()
  let tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
