<template>
  <el-container>
    <el-header>this is the header</el-header>
    <el-main>
      <h1>Get Paid by playing games</h1>
    </el-main>
    <el-footer> this is a footer</el-footer>
  </el-container>
</template>

<script>
  import ElHeader from '../../../node_modules/element-ui/packages/header/src/main'
  import ElFooter from '../../../node_modules/element-ui/packages/footer/src/main'
  import ElContainer from '../../../node_modules/element-ui/packages/container/src/main'
  export default {
    components: {
      ElContainer,
      ElFooter,
      ElHeader},
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
<style scoped>
</style>
