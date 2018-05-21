import Vue from 'vue'
import Router from 'vue-router'
import GameEditForm from '@/components/views/GameEditForm'
import HomePage from '@/components/views/HomePage'
import GameAudit from '../components/views/GameAudit.vue'
import GameBrowser from '../components/views/GameBrowser.vue'
import GameDetail from '../components/views/GameDetail.vue'
import UserSummary from '../components/views/UserSummary.vue'
import Privacy from '../components/views/Privacy.vue'
import CookiePolicy from '../components/views/CookiePolicy.vue'
import TermOfService from '../components/views/TermOfService.vue'
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
      component: GameEditForm,
      beforeEnter: (to, from, next) => {
        if (store.state.loggedIn) {
          next()
        } else {
          next(false)
        }
      }
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
      path: '/userProfile',
      name: 'userProfile',
      component: UserSummary,
      beforeEnter: (to, from, next) => {
        if (store.state.loggedIn === false) {
          next(false)
        } else {
          next()
        }
      }
    },
    {
      path: '/game/audit',
      name: 'auditGame',
      component: GameAudit,
      beforeEnter: (to, from, next) => {
        if (store.state.user.role < 1) {
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
    },
    {
      path: '/cookiePolicy',
      name: 'cookiePolicy',
      component: CookiePolicy
    },
    {
      path: '/termsofservice',
      name: 'termsOfService',
      component: TermOfService
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: Privacy
    }
  ]
})
