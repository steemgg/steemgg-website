<template>
  <div>
    <el-header>
      <common-header></common-header>
    </el-header>
    <div class="listContainer">
      <div class="auditor-input">
        <el-input placeholder="Input Auditor ID" v-model="newAuditorId" class="input-with-select">
          <el-button slot="append" icon="el-icon-search" @click="previewRecommendGame"></el-button>
        </el-input>
      </div>
      <app-auditor-table :items="auditors"  @auditorRemoved="auditorRemoved" class="audit-table"></app-auditor-table>
    </div>
    <el-footer>
      <common-footer></common-footer>
    </el-footer>
  </div>
</template>

<script>
  import GameService from '../../service/game.service'
  import CommonHeader from '../common/CommonHeader'
  import AuditorTable from '../shared/AuditorTable.vue'
  import CommonFooter from '../common/CommonFooter'

  const gameService = new GameService()
  export default {
    components: {
      CommonFooter,
      CommonHeader,
      AppGameTable: AuditorTable
    },
    props: [],
    name: 'AssignAuditor',
    data () {
      return {
        auditors: null,
        loading: false,
        newAuditorId: null
      }
    },
    computed: {
    },
    methods: {
      updateAuditors () {
        gameService.query({status: 1, limit: 1000, includeComment: true}).then(result => {
          console.log(result)
          this.liveItems = result.items
          console.log('get the game item list', this.reportItems)
        })
      },
      auditorRemoved () {

      }
    },
    mounted () {
      this.updateAuditors()
    }
  }
</script>
<style scoped>
  .listContainer {
    margin: 20px;
    overflow: scroll;
  }
  .audit-table {
    box-shadow: 2px 2px 2px #999999;
    border-top: 1px #999999;
    border-left: 1px #999999;
  }
</style>
