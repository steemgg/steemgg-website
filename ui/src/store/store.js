import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    user: {
      'id': '',
      'account': '',
      'userid': '',
      'role': 0,
      'status': 1,
      'created': null
    },
    loggedIn: false
  },
  getters: {
    user: state => {
      return state.user
    }
  },
  mutations: {
    setUser (state, user) {
      state.user = user
      state.loggedIn = true
    },
    deleteUser (state) {
      state.user = {
        'id': '',
        'account': '',
        'userid': '',
        'role': 0,
        'status': 1,
        'created': null
      }
      state.loggedIn = false
    }
  }
})
