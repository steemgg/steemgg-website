<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-container>
      <!--<el-aside style="width: auto; background-color: rgb(238, 241, 246)">-->
        <!--<site-navigation></site-navigation>-->
      <!--</el-aside>-->
      <el-main>
        <!--<game-slider></game-slider>-->
        <div class="game-list">
          <div class="list-title-wrapper" ><span class="list-name">The Recommended Games</span><span class="view-more"><router-link :to="{ name: 'browseGame', params: {}}" tag="span" >Show More...</router-link></span></div>
          <game-list :queryParameter="recommendParam"></game-list>
        </div>
        <div class="game-list">
          <div class="list-title-wrapper" ><span class="list-name">The Latest Games</span><span class="view-more"><router-link :to="{ name: 'browseGame', params: {}}" tag="span">Show More...</router-link></span></div>
          <game-list :queryParameter="newGameParam"></game-list>
        </div>
        <div class="game-list">
          <div class="list-title-wrapper" ><span class="list-name">Most Popular Games</span><span class="view-more"><router-link :to="{ name: 'browseGame', params: {}}" tag="span" >Show More...</router-link></span></div>
          <game-list :queryParameter="popularParam"></game-list>
        </div>
        <div class="game-list">
          <div class="list-title-wrapper" ><span class="list-name">Top Payout Games</span><span class="view-more"><router-link :to="{ name: 'browseGame', params: {}}" tag="span" >Show More...</router-link></span></div>
          <game-list :queryParameter="topPayoutParam"></game-list>
        </div>
        <div v-if="$store.getters.showCookieAlert" class="cookieAlert componentDynamicWidth">
          <span>This website uses cookies to ensure you get the best experience on our website. <router-link class="cookieLink" :to="{name: 'cookiePolicy'}" tag="a">Learn more</router-link></span><span class="cookieDismiss" @click="dismissCookieAlert">Got it</span>
        </div>
      </el-main>

    </el-container>
    <el-footer> <common-footer></common-footer></el-footer>
  </el-container>
</template>

<script>
  import GameSlider from '../common/GameSlider'
  import CommonFooter from '../common/CommonFooter'
  import CommonHeader from '../common/CommonHeader'
  import GameList from '../shared/GameList'
  import SiteNavigation from '../common/SideNavigation'

  export default {
    components: {
      GameList,
      GameSlider,
      CommonFooter,
      CommonHeader,
      SiteNavigation
    },
    name: 'HomePage',
    data () {
      return {
        title: '',
        description: '',
        hideCookieAlert: false,
        popularParam: {
          // status: 1,
          sort: 'vote_desc',
          limit: 12,
          type: 'index'
        },
        recommendParam: {
          // status: 1,
          recommend: 1,
          limit: 12
        },
        newGameParam: {
          // status: 1,
          sort: 'created_desc',
          limit: 12
        },
        topPayoutParam: {
          sort: 'payout_desc',
          limit: 12
        }
      }
    },
    methods: {
      dismissCookieAlert () {
        console.log('hide cookie alert')
        this.$store.commit('hideCookieAlert')
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import '../../assets/style/variables.scss';
  .game-list {
    margin-top: 20px;
    /*box-shadow: 3px 3px 0px #aaa;*/
    /*-moz-box-shadow: 3px 3px 0px #aaa;*/
    /*-webkit-box-shadow: 3px 3px 0px #aaa;*/
    /*border: 1px solid #ccc;*/
    .list-title-wrapper {
      border-bottom: 5px solid darkseagreen;
      display: flex;
      font-size: 20px;
      font-family: 'Kaushan Script', cursive;
      .list-name {
        width: 66%;
        display: flex;
      }
      .view-more {
        font-size: 14px;
        width: 34%;
        display: flex;
        flex-direction: row-reverse;
        span:hover {
          cursor: pointer;
        }
        span {
          margin-right: 10px;
        }
      }
    }
  }
  .cookieAlert {
    position: fixed;
    bottom: 10px;
    /*width: 1160px;*/
    /*margin-left: 30px;*/
    height: 50px;
    z-index:10000;
    font-size: 14px;
    font-weight: bold;
    line-height: 50px;
    padding: 0 20px;
    background-color: $sgg-blue;
    color: white;
    .cookieLink {
      color: #dddddd;
      margin-left: 10px;
      text-decoration: underline;
    }
    .cookieDismiss {
      float: right;
      border: 2px solid white;
      height: 30px;
      line-height: 30px;
      padding: 0 30px;
      margin-top: 10px;
      font-size: 14px;
      font-weight: bold;
      &:hover {
        cursor: pointer;
      }
    }
  }
</style>
