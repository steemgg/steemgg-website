import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import GameEditForm from '@/components/views/GameEditForm'
import HomePage from '@/components/views/HomePage'

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
    }
  ]
})
