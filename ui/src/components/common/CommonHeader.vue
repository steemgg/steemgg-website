<template>
  <div class="commentHeader">
    <nav class="navbar navbar-expand-md navbar-dark bg-dark header-links">
      <!--<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">-->
        <!--<span class="navbar-toggler-icon"></span>-->
      <!--</button>-->
      <div class="navbar-collapse " id="navbarCollapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <router-link class="nav-link" :to="{name: 'home'}" tag="a"><img src="../../assets/images/steemgg-logo-128x32.png" /> </router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="uploadGame"><i class="fa fa-cloud-upload fa-2x" ></i><span class="actionText">Upload Game</span></a>
          </li>
          <li class="nav-item" v-if="$store.getters.user.role >= 1">
            <router-link class="nav-link" :to="{name: 'auditGame'}" tag="a"><i class="fa fa-eye fa-2x" title="Audit Game"></i><span class="actionText">Audit Game</span></router-link>
          </li>
        </ul>
        <!--<form class="form-inline mt-2 mt-md-0">-->
          <!--<input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search">-->
          <!--<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>-->
        <!--</form>-->
        <user-info></user-info>
      </div>
    </nav>
  </div>
</template>

<script>
  import UserInfo from './UserInfo'
  export default {
    components: {UserInfo},
    name: 'CommonHeader',
    methods: {
      uploadGame () {
        if (!this.$store.state.loggedIn) {
          this.$message.warning('Please log in first to create game.')
        } else {
          this.$router.push({
            name: 'newGame'
          })
        }
      }
    },
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
  .commentHeader {
    .log-out-link {
      color: white;
    }
    .nav-link {
      font-size: 16px;
      cursor: pointer;
      li {
        a {
          padding-bottom: 0px;
        }
      }
      .actionText {
        padding-left: 5px;
        font-size: 14px;
      }
    }
    .navbar {
      height: 50px;
      margin-bottom: 0px;
    }
    .header-links {
      height: 60px;
    }
  }
</style>
