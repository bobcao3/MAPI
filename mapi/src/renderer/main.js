import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'

import UIkit from 'uikit'
import Icons from 'uikit/dist/js/uikit-icons'

import 'typeface-roboto/index.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

UIkit.use(Icons)

Vue.prototype.$imagePool = {}

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
