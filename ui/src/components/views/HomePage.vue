<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-container>
      <!--<el-aside style="width: auto; background-color: rgb(238, 241, 246)">-->
        <!--<site-navigation></site-navigation>-->
      <!--</el-aside>-->
      <el-main>
        <div class="official-blog scroll-left">
          <a class="retroshadow" :href="'https://steemit.com' + latestOfficalBlog.url" target="_blank"><span class="newsText">News</span><img class="news" src="../../assets/images/news.png"/>{{latestOfficalBlog.title}}</a>
        </div>
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
  import GameService from '../../service/game.service'
  import GameSlider from '../common/GameSlider'
  import CommonFooter from '../common/CommonFooter'
  import CommonHeader from '../common/CommonHeader'
  import GameList from '../shared/GameList'
  import SiteNavigation from '../common/SideNavigation'
  const gameService = new GameService()

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
        latestOfficalBlog: {},
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
      },
      fetchLatestOfficialBlog () {
        gameService.getDiscussionByAuthor('steemgg', 1).then(response => {
          this.latestOfficalBlog = response[0]
        })
      }
    },
    mounted () {
      this.fetchLatestOfficialBlog()
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

  .newsText {
    font-family: 'Kaushan Script', cursive;
    color: orangered;
    font-weight: bold;
    margin-left: 5px;
  }
  .news {
    width: 40px;
    height: 30px;
    margin: 0 15px 0 5px;
  }

  .scroll-left {
   height: 30px;
   overflow: hidden;
   position: relative;
  }
  .scroll-left a {
    position: absolute;
    width: 100%;
    height: 100%;
    margin: 0;
    font-size: 1.7em;
    line-height: 30px;
    text-align: center;
    /* Starting position */
    -moz-transform:translateX(100%);
    -webkit-transform:translateX(100%);
    transform:translateX(100%);
    /* Apply animation to this element */
    -moz-animation: scroll-left 10s linear;
    -webkit-animation: scroll-left 10s linear;
    animation: scroll-left 10s linear;
    text-align: left;
    animation-fill-mode:forwards;
    -webkit-animation-fill-mode: forwards;

    &.retroshadow {
      color: #2c2c2c;
      background-color: #d5d5d5;
      letter-spacing: .05em;
      text-shadow:
        4px 4px 0px #d5d5d5,
        7px 7px 0px rgba(0, 0, 0, 0.2);
      &:hover {
        color: dodgerblue;
        font-weigth: bold;
      }
    }

    &.elegantshadow {
      color: #131313;
      background-color: #e7e5e4;
      letter-spacing: .15em;
      text-shadow:
        1px -1px 0 #767676,
        -1px 2px 1px #737272,
        -2px 4px 1px #767474,
        -3px 6px 1px #787777,
        -4px 8px 1px #7b7a7a,
        -5px 10px 1px #7f7d7d,
        -6px 12px 1px #828181,
        -7px 14px 1px #868585,
        -8px 16px 1px #8b8a89,
        -9px 18px 1px #8f8e8d,
        -10px 20px 1px #949392,
        -11px 22px 1px #999897,
        -12px 24px 1px #9e9c9c,
        -13px 26px 1px #a3a1a1,
        -14px 28px 1px #a8a6a6,
        -15px 30px 1px #adabab,
        -16px 32px 1px #b2b1b0,
        -17px 34px 1px #b7b6b5,
        -18px 36px 1px #bcbbba,
        -19px 38px 1px #c1bfbf,
        -20px 40px 1px #c6c4c4,
        -21px 42px 1px #cbc9c8,
        -22px 44px 1px #cfcdcd,
        -23px 46px 1px #d4d2d1,
        -24px 48px 1px #d8d6d5,
        -25px 50px 1px #dbdad9,
        -26px 52px 1px #dfdddc,
        -27px 54px 1px #e2e0df,
        -28px 56px 1px #e4e3e2;
    }
  }
  /* Move it (define the animation) */
  @-moz-keyframes scroll-left {
    0%   { -moz-transform: translateX(100%); }
    100% { -moz-transform: translateX(-100%); }
  }
  @-webkit-keyframes scroll-left {
    0%   { -webkit-transform: translateX(100%); }
    100% { -webkit-transform: translateX(-100%); }
  }
  @keyframes scroll-left {
    0%   {
      -moz-transform: translateX(100%); /* Browser bug fix */
      -webkit-transform: translateX(100%); /* Browser bug fix */
      transform: translateX(100%);
    }
    100% {
      -moz-transform: translateX(0%); /* Browser bug fix */
      -webkit-transform: translateX(0%); /* Browser bug fix */
      transform: translateX(0%);
    }
  }
</style>
