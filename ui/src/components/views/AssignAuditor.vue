<template>
  <div>
    <el-header>
      <common-header></common-header>
    </el-header>
    <div class="listContainer">
      <div class="auditor-input">
        <el-input placeholder="Input Auditor ID" v-model="newAuditorId" class="input-with-add">
          <el-button slot="append" icon="el-icon-circle-plus" @click="addAuditor"></el-button>
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
      AppAuditorTable: AuditorTable
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
        gameService.getAuditors().then(result => {
          console.log(result)
          this.auditors = result.auditors
          console.log('get the auditor list', this.auditors)
        })
      },
      auditorRemoved () {

      },
      addAuditor () {
        if (this.newAuditorId != null && this.newAuditorId.trim() !== '') {
          this.loading = true
          gameService.addAuditor(this.newAuditorId).then(() => {
            this.$message.success('New auditor added successfully.')
            this.updateAuditors()
          }).catch(exception => {
            this.$message.error('Fail to add the user as auditor.')
          }).finally(() => {
            this.loading = false
          })
        }
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
  .auditor-input {
    width: 300px;
    border-bottom: 1px solid black;
    margin-bottom: 5px;
  }
</style>
