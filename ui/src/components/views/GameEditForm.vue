<template>
  <el-container>
    <el-header>this is the header</el-header>
    <el-main>
      <div class="createGame">
        <h1>Create a new game</h1>
        <form>
          <el-input
            placeholder="Please input the game title"
            v-model="title"
            >
          </el-input>
          <el-input
            placeholder="Please input the game description"
            v-model="description"
            :disabled="false">
          </el-input>
        </form>
      </div>
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
