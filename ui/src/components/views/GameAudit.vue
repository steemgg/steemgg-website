<template>
  <div>
    <common-header></common-header>
    <div class="listContainer">
      <el-tabs v-model="activeTab" type="border-card" @tab-click="handleClick">
        <el-tab-pane label="Audit" name="audit"><app-game-table :items="auditItems" class="audit-table"></app-game-table></el-tab-pane>
        <el-tab-pane label="Report" name="report"><app-game-table :items="reportItems" class="audit-table"></app-game-table></el-tab-pane>
        <el-tab-pane label="Find" name="find">Find perticular game</el-tab-pane>
      </el-tabs>
    </div>
    <common-footer></common-footer>
  </div>
</template>

<script>
  import GameService from '../../service/game.service'
  import GamesTable from '../shared/GamesTable.vue'
  import CommonHeader from '../common/CommonHeader'
  import CommonFooter from '../common/CommonFooter'

  const gameService = new GameService()
  export default {
    components: {
      CommonFooter,
      CommonHeader,
      AppGameTable: GamesTable
    },
    props: [],
    name: 'GameAudit',
    data () {
      return {
        auditItems: null,
        reportItems: null,
        activeTab: 'audit'
      }
    },
    computed: {
    },
    mounted () {
      gameService.query({type: 'audit', status: 0, limit: 1000}).then(result => {
        console.log(result)
        this.auditItems = result.items
        console.log('get the game item list', this.auditItems)
      })

      gameService.query({report: 1, limit: 1000}).then(result => {
        console.log(result)
        this.reportItems = result.items
        console.log('get the game item list', this.reportItems)
      })
    }
  }
</script>
<style scoped>
  .listContainer {
    margin: 20px;
    height: 800px;
    width: 90%;
    overflow: scroll;
  }
  .audit-table {
    box-shadow: 2px 2px 2px #999999;
    border-top: 1px #999999;
    border-left: 1px #999999;
  }
</style>
