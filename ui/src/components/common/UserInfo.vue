<template>
  <div class="userInfoContainer">
    <avatar :accountName="accountName"></avatar> <span>{{accountName}}</span>
  </div>
</template>
<script>
  import axios from 'axios'
  import Avatar from '../shared/Avatar'
  export default {
    components: {
      Avatar
    },
    name: 'UserInfo',
    data () {
      return {
      }
    },
    mounted () {
      axios.get('v1/me').then(user => {
        console.log('user logged in')
        this.$store.user = user
      }).catch(error => {
        console.log(error)
        this.$store.user = {
          'id': '',
          'account': '',
          'userid': '',
          'role': 0,
          'status': 1,
          'created': null
        }
      })
    },
    computed: {
      accountName () {
        return this.$store.getters.user.account
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
  }

</style>
