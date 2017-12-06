<template>
  <el-container>
    <el-header>this is the header</el-header>
    <el-main>
      <game-slider></game-slider>
    </el-main>
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
  export default {
    components: {
      GameSlider,
      ElContainer,
      ElFooter,
      ElHeader,
      ElMain,
      CommonFooter},
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
