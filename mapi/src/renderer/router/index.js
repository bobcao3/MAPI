import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MAPI',
      component: require('@/App.vue').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
