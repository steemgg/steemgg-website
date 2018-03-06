import Vue from 'vue'
import Router from 'vue-router'
import GameEditForm from '@/components/views/GameEditForm'
import HomePage from '@/components/views/HomePage'
import GameAudit from '../components/views/GameAudit.vue'
import GameBrowser from '../components/views/GameBrowser.vue'
import GameDetail from '../components/views/GameDetail.vue'
import { store } from '../store/store'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
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
      props: true,
      beforeEnter: (to, from, next) => {
        if (store.state.loggedIn) {
          next()
        } else {
          next(false)
        }
      }
    },
    {
      path: '/game/play/:id',
      name: 'viewGame',
      component: GameDetail,
      props: true
    },
    {
      path: '/game/audit',
      name: 'auditGame',
      component: GameAudit,
      beforeEnter: (to, from, next) => {
        if (store.state.user.role < 2) {
          next(false)
        } else {
          next()
        }
      }
    },
    {
      path: '/game/browse',
      name: 'browseGame',
      component: GameBrowser
    }
  ]
})
