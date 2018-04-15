<template>
  <div class='userInfoContainer' v-loading='loading'>
    <span v-if='$store.state.loggedIn'>
      <avatar :accountName='accountName'></avatar> <span class='user-name'>{{accountName}}</span>
      <router-link class="fa fa-cog fa-2x fa-fw profile" :to="{name: 'userProfile'}" tag="i" title="Profile"></router-link>
      <el-button class='logout'  @click='logout'>Log out</el-button>
    </span>
    <a class='nav-link' v-if='!$store.state.loggedIn' :href="loginStateUrl">Log In</a>
  </div>
</template>
<script>
  import axios from 'axios'
  import Avatar from '../shared/Avatar'
  import ElButton from '../../../node_modules/element-ui/packages/button/src/button'
  export default {
    components: {
      ElButton,
      Avatar
    },
    name: 'UserInfo',
    data () {
      return {
        loggedIn: false,
        loading: false,
        testMode: false
      }
    },
    methods: {
      logout () {
        if (this.testMode) {
          this.$store.commit('deleteUser')
          this.loggedIn = false
        } else {
          this.loading = true
          axios.get('v1/logout').then(response => {
            this.$message.success('log out successfully')
            this.$store.commit('deleteUser')
          }).finally(() => {
            this.loading = false
          })
        }
      }
    },
    mounted () {
      if (this.testMode) {
        this.$store.commit('setUser', {
          'id': 15,
          'account': 'stg.admin',
          'userid': 729275,
          'role': 2,
          'status': 1,
          'created': '2018-0202T08:41:28Z'
        })
        this.loggedIn = true
      } else {
        this.loading = true
        axios.get('v1/me').then(response => {
          console.log('user logged in')
          this.$store.commit('setUser', response.data)
          this.loggedIn = true
          this.loading = false
        }).catch(error => {
          this.loggedIn = false
          console.log(error.response)
          this.$store.commit('deleteUser')
          this.loading = false
        })
      }
    },
    computed: {
      accountName () {
        return this.$store.getters.user.account
      },
      loginStateUrl () {
        return 'https://v2.steemconnect.com/oauth2/authorize?client_id=steemitgame.app&redirect_uri=http%3A%2F%2Fdev.steemitgame.com%2Fcallback&scope=login,offline,vote,comment,comment_delete,comment_options,custom_json,claim_reward_balance&state=' + window.location.href
      }
    }
  }
</script>
<style scoped lang='scss'>
  .userInfoContainer {
    margin-left: 20px;
    color: white;
    .avatar {
      margin-right: 15px;
    }
    .user-name {
      font-size: 16px;
      font-weight: bold;
    }
    .logout {
      margin-left: 20px;
    }

    .profile {
      cursor: pointer;
    }
  }

</style>
