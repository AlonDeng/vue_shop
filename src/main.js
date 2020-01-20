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
// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

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

// 全局注册富文本编辑器组件
Vue.use(VueQuillEditor)

Vue.component('tree-table', treeTable)
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
