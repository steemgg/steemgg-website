import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import GameEditForm from '@/components/views/GameEditForm'
import HomePage from '@/components/views/HomePage'
import GameAudit from '../components/views/GameAudit.vue'
import GameBrowser from '../components/views/GameBrowser.vue'
import GameDetail from '../components/views/GameDetail.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/hello',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/game/new',
      name: 'newGame',
      component: GameEditForm
    },
    {
      path: '/game/edit/:id',
      name: 'editGame',
      component: GameEditForm,
      props: true
    },
    {
      path: '/game',
      name: 'browseGame',
      component: GameBrowser
    },
    {
      path: '/game/:id',
      name: 'viewGame',
      component: GameDetail,
      props: true
    },
    {
      path: '/game/audit',
      name: 'auditGame',
      component: GameAudit
    }
  ]
})
