<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-container>
      <el-aside style="width: auto; background-color: rgb(238, 241, 246)">
        <site-navigation></site-navigation>
      </el-aside>
      <el-main>
        <game-slider></game-slider>
        <div class="game-list">
          <div class="list-title-wrapper" ><span class="list-name">Popular Games</span><span class="view-more"><router-link :to="{ name: 'browseGame', params: {}}" tag="span" >Show More...</router-link></span></div>
          <game-list :queryParameter="popularParam"></game-list>
        </div>
        <div class="game-list">
          <div class="list-title-wrapper" ><span class="list-name">Recommended Games</span><span class="view-more"><router-link :to="{ name: 'browseGame', params: {}}" tag="span" >Show More...</router-link></span></div>
          <game-list :queryParameter="recommendParam"></game-list>
        </div>
        <div class="game-list">
          <div class="list-title-wrapper" ><span class="list-name">New Games</span><span class="view-more"><router-link :to="{ name: 'browseGame', params: {}}" tag="span">Show More...</router-link></span></div>
          <game-list :queryParameter="newGameParam"></game-list>
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
        popularParam: {
          // status: 1,
          sort: 'vote_desc',
          limit: 10,
          type: 'index'
        },
        recommendParam: {
          // status: 1,
          recommend: 1,
          limit: 10
        },
        newGameParam: {
          // status: 1,
          sort: 'created_desc',
          limit: 10
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
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
      font-weight: bold;
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
</style>
