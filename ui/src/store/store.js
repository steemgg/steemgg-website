import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    user: {
      'id': 15,
      'account': 'steemitgame.test',
      'userid': 477514,
      'role': 2,
      'status': 1,
      'created': '2018-02-02T14:50:56Z'
    }
  },
  getters: {
    user: state => {
      return state.user
    }
  },
  mutations: {
    setUser (state, user) {
      state.user = user
    }
  }
})
