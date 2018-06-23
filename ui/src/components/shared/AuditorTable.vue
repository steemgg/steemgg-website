<template>
  <div>
    <el-table :data="auditors" style="width: 100%" :stripe=true v-loading="loading" :empty-text="'None'">
      <el-table-column prop="id" label="ID" width="100">
      </el-table-column>
      <el-table-column prop="account" label="Account" width="100">
      </el-table-column>
      <el-table-column label="Create Time" width="150">
        <template slot-scope="scope">
          {{transformTime(scope.row.created)}}
        </template>
      </el-table-column>
      <!--<el-table-column fixed="right" label="Operations" width="180">-->
      <el-table-column label="Operations" fixed="right">
        <template slot-scope="scope">
          <el-button @click="removeAuditor(scope.$index)" v-loading="loading" type="danger" size="mini" >Remove</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import GameService from '../../service/game.service'
  import moment from 'moment'
  const gameService = new GameService()

  export default {

    components: {
    },
    props: ['auditors'],
    name: 'AuditorTable',
    data () {
      return {
        loading: false
      }
    },
    methods: {
      removeAuditor (index) {
        this.loading = true
        gameService.deleteAuditor(this.auditors[index].account).then(() => {
          this.$message.success('Auditor has been removed.')
          this.auditors.splice(this.activeIndex, 1)
          this.$emit('auditorRemoved')
        }).catch(error => {
          console.log(error)
          this.$message.error('Cannot remove user from auditor list.')
        }).finally(() => {
//          this.form.comment = ''
          this.loading = false
        })
      },
      transformTime (time) {
        let result = moment(time).format('DD/MM/YYYY, h:mm')
        return result
      }
    },
    computed: {
//      commentIsEmpty () {
//        return this.form.comment == null || this.form.comment.trim().length === 0
//      }
    },
    mounted () {
    }
  }
</script>
<style scoped>
  .gameActionButton {
    margin-top: 5px;
  }
</style>
