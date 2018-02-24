<template>
  <div>
    <el-table :data="items" style="width: 100%" :stripe=true>
      <el-table-column prop="id" label="ID" width="50">
      </el-table-column>
      <el-table-column prop="title" label="Name" width="150">
      </el-table-column>
      <el-table-column prop="category" label="Category" width="120">
      </el-table-column>
      <el-table-column label="Create Time" width="150">
        <template slot-scope="scope">
          {{transformTime(scope.row.created)}}
        </template>
      </el-table-column>
      <el-table-column label="Last Modified" width="150">
        <template slot-scope="scope">
          {{transformTime(scope.row.lastModified)}}
        </template>
      </el-table-column>
      <!--<el-table-column fixed="right" label="Operations" width="180">-->
      <el-table-column label="Operations" width="180">
        <template slot-scope="scope">
          <el-button @click="viewDetails(scope.$index)" type="text" size="small">Detail</el-button>
          <el-button @click="openDialog(scope.$index, 'approve')" type="text" size="small">Approve</el-button>
          <el-button @click="openDialog(scope.$index, 'deny')" type="text" size="small">Deny</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="actionTitle" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="Comment" :label-width="labelWidth">
          <el-input :rows="2" v-model="form.comment" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="approve()">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { Table, TableColumn } from 'element-ui'
  import moment from 'moment'
  import GameService from '../../service/game.service'
  const gameService = new GameService()

  export default {

    components: {
      appTable: Table,
      appTableColumn: TableColumn
    },
    props: ['items'],
    name: 'GamesTable',
    data () {
      return {
        dialogFormVisible: false,
        activeIndex: null,
        actionTitle: '',
        form: {
          comment: ''
        },
        labelWidth: '80px'
      }
    },
    methods: {
      viewDetails (index) {
        console.log(`check details of ${index}`)
        this.$router.push({
          name: 'viewGame',
          params: {
            id: this.items[index].id
          }
        })
      },
      openDialog (index, type) {
        this.dialogFormVisible = true
        this.activeIndex = index
        this.actionTitle = (type === 'approve' ? 'Approve' : 'Deny')
      },
      approve () {
        this.dialogFormVisible = false
        this.form.comment = ''
        console.log(`approve details of ${this.activeIndex} with comment`)
        gameService.approve(this.items[this.activeIndex].id, this.form.comment).then(() => {
          this.$message.success('Game is approved.')
          this.items.splice(this.activeIndex, 1)
        }).catch(error => {
          console.log(error)
          this.$message.error('Approve action failed.')
        })
      },
      deny () {
        this.dialogFormVisible = false
        this.form.comment = ''
        console.log(`approve details of ${this.activeIndex}`)
        gameService.deny(this.items[this.activeIndex].id, this.form.comment).then(() => {
          this.$message.success('Game is denied.')
        }).catch(error => {
          console.log(error)
          this.$message.error('Deny action failed.')
        })
      },
      transformTime (time) {
        let result = moment(time, 'x').calendar()
//        let result = moment(time, 'x').format('MMMM Do YYYY, h:mm:ss a')
        console.log(result)
        return result
      }
    },
    computed: {
    },
    mounted () {
    }
  }
</script>
