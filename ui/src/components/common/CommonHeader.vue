<template>
  <div>
    <a href="https://v2.steemconnect.com/oauth2/authorize?client_id=steemitgame.app&redirect_uri=http%3A%2F%2Fdev.steemitgame.com%2Fcallback&scope=login,offline,vote,comment,comment_delete,comment_options,custom_json,claim_reward_balance">Log In</a>
  </div>
</template>

<script>
  export default {
    name: 'CommonHeader',
    data () {
      return {
      }
    },
    mounted () {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
