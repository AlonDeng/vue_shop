import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入tree-table
import treeTable from 'vue-table-with-tree-grid'
// 导入全局样式
import './assets/css/global.css'
// 引入字体css文件
import './assets/fonts/iconfont.css'
// 引入axios模块
import axios from 'axios'
// axios请求默认根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 挂载请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.component('tree-table', treeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
