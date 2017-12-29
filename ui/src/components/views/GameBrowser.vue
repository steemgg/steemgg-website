<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-container>
      <el-aside style="width: auto; background-color: rgb(238, 241, 246)">
        <site-navigation></site-navigation>
      </el-aside>
      <el-main>
        <game-list></game-list>
      </el-main>
    </el-container>
    <el-footer> <common-footer></common-footer></el-footer>
  </el-container>
</template>

<script>
  import ElHeader from '../../../node_modules/element-ui/packages/header/src/main'
  import ElFooter from '../../../node_modules/element-ui/packages/footer/src/main'
  import ElContainer from '../../../node_modules/element-ui/packages/container/src/main'
  import ElMain from '../../../node_modules/element-ui/packages/main'
  import GameSlider from '../common/GameSlider'
  import CommonFooter from '../common/CommonFooter'
  import CommonHeader from '../common/CommonHeader'
  import GameList from '../shared/GameList'
  import SiteNavigation from '../common/SideNavigation'

  export default {
    components: {
      GameList,
      GameSlider,
      ElContainer,
      ElFooter,
      ElHeader,
      ElMain,
      CommonFooter,
      CommonHeader,
      SiteNavigation
    },
    name: 'GameEditForm',
    data () {
      return {
        title: '',
        description: ''

      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
