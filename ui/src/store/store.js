import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    user: {
      'id': '',
      'account': '',
      'userid': '',
      'role': 0,
      'status': 1,
      'created': null,
      'gamePostingInterval': 500
    },
    loggedIn: false,
    showPostTip: true,
    cookieAlert: true
  },
  getters: {
    user: state => {
      return state.user
    },
    isAdmin: state => {
      return state.user.role === 2
    },
    isAuditor: state => {
      return state.user.role >= 1
    },
    showPostTip: state => {
      return state.showPostTip
    },
    showCookieAlert: state => {
      return state.cookieAlert
    }
  },
  mutations: {
    setUser (state, user) {
      state.user = user
      state.loggedIn = true
    },
    hidePostTip (state) {
      state.showPostTip = false
    },
    showPostTip (state) {
      state.showPostTip = true
    },
    hideCookieAlert (state) {
      state.cookieAlert = false
    },
    showCookieAlert (state) {
      state.cookieAlert = true
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
  },
  plugins: [createPersistedState()]
})
