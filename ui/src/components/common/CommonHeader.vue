<template>
  <div>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
      <a class="navbar-brand" href="#">SteemitGame</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <router-link class="nav-link" :to="{name: 'home'}" tag="a">Home </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'newGame'}" tag="a">Upload Game</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'auditGame'}" tag="a">Audit Games</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="https://v2.steemconnect.com/oauth2/authorize?client_id=steemitgame.app&redirect_uri=http%3A%2F%2Fdev.steemitgame.com%2Fcallback&scope=login,offline,vote,comment,comment_delete,comment_options,custom_json,claim_reward_balance">Log In</a>
          </li>
        </ul>
        <form class="form-inline mt-2 mt-md-0">
          <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
    </nav>
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
