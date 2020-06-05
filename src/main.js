import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

//配置请求的跟路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
axios.interceptors.request.use(config => {
  console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
