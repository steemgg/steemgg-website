<template>
  <div>
    <el-table :data="items" style="width: 100%" :stripe=true v-loading="loading" :empty-text="'None'">
      <el-table-column prop="id" label="ID" width="100">
      </el-table-column>
      <el-table-column label="Name" width="150">
        <template slot-scope="scope">
          <el-button @click="viewDetails(scope.$index)" type="text" size="small">{{scope.row.title}}</el-button>
        </template>
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
      <el-table-column prop="payout" label="Reward" width="80">
      </el-table-column>
      <el-table-column label="Audit History" width="150">
        <template slot-scope="scope">
          <comment-popover :comments="scope.row.commentHistory"></comment-popover>
        </template>
      </el-table-column>
      <el-table-column label="Operations" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status == 0 && type == 'audit'" @click="openDialog(scope.$index, 'approve', 'Approve the game')" type="success"  size="mini">Approve</el-button>
          <el-button v-if="scope.row.status == 0 && type == 'stale'" @click="openDialog(scope.$index, 'delete', 'Delete the game')" type="danger"  size="mini">Delete</el-button>
          <div class="gameActionButton" v-if="scope.row.status == 1"><el-button  @click="openDialog(scope.$index, 'deny', 'Deny Game')" type="danger"  size="mini" v-if="type == 'report' || type == 'live'">Deny Game</el-button></div>
          <div class="gameActionButton" v-if="scope.row.report == 1"><el-button @click="openDialog(scope.$index, 'dismiss', 'Dismiss Report')" type="primary"  size="mini" v-if="type == 'report'">Dismiss Report</el-button></div>
          <div class="gameActionButton" v-if="scope.row.status == 0 && type == 'stale' "><el-button @click="openDialog(scope.$index, 'Dismiss Report')" type="primary"  size="mini" v-if="type == 'report'">Dismiss Report</el-button></div>
          <div class="gameActionButton" v-if=""><el-button @click="openDialog(scope.$index, 'removeFromRecommended', 'Remove from recommended')" type="danger"  size="mini" v-if="type == 'recommended'">Remove</el-button></div>
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
        <el-button @click="confirmDialogCancel">Cancel</el-button>
        <el-button type="primary" @click="confirmDialogAction" :disabled="commentIsEmpty">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import moment from 'moment'
  import GameService from '../../service/game.service'
  import CommentPopover from './CommentPopover.vue'
  const gameService = new GameService()

  export default {

    components: {
      CommentPopover
    },
    props: ['items', 'type'],
    name: 'GamesTable',
    data () {
      return {
        dialogFormVisible: false,
        activeIndex: null,
        actionTitle: '',
        actionType: '',
        form: {
          comment: ''
        },
        labelWidth: '80px',
        loading: false
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
      openDialog (index, type, title) {
        this.dialogFormVisible = true
        this.activeIndex = index
        this.actionType = type
        this.actionTitle = title
      },
      confirmDialogCancel () {
        this.dialogFormVisible = false
        this.form.comment = ''
      },
      confirmDialogAction () {
        if (this.form.comment.trim().length === 0) {
          this.$alert('Comment cannot be empty!')
        } else {
          if (this.actionType === 'approve') {
            this.approve()
          } else if (this.actionType === 'delete') {
            this.delete()
          } else if (this.actionType === 'deny') {
            this.deny()
          } else if (this.actionType === 'dismiss') {
            this.clear()
          } else if (this.actionType === 'removeFromRecommended') {
            this.removeGameFromRecomended()
          }
          this.form.comment = ''
        }
      },
      approve () {
        this.dialogFormVisible = false
        console.log(`approve details of ${this.activeIndex} with comment`)
        this.loading = true
        gameService.approve(this.items[this.activeIndex].id, this.form.comment).then(() => {
          this.$message.success('Game is approved.')
          this.items.splice(this.activeIndex, 1)
          this.$emit('gameApproved')
        }).catch(error => {
          console.log(error)
          this.$message.error('Approve action failed.')
        }).finally(() => {
          this.form.comment = ''
          this.loading = false
        })
      },
      delete () {
        this.dialogFormVisible = false
        console.log(`delete game of ${this.activeIndex} with comment`)
        this.loading = true
        gameService.delete(this.items[this.activeIndex].id, this.form.comment).then(() => {
          this.$message.success('Game is deleted.')
          this.items.splice(this.activeIndex, 1)
          this.$emit('gameDeleted')
        }).catch(error => {
          console.log(error)
          this.$message.error('Approve action failed.')
        }).finally(() => {
          this.form.comment = ''
          this.loading = false
        })
      },
      deny () {
        this.dialogFormVisible = false
        console.log(`deny details of ${this.activeIndex}`)
        this.loading = true
        gameService.deny(this.items[this.activeIndex].id, this.form.comment).then(() => {
          this.$message.success('Game is denied.')
          this.items.splice(this.activeIndex, 1)
          this.$emit('gameDenied')
        }).catch(error => {
          console.log(error)
          this.$message.error('Deny action failed.')
        }).finally(() => {
          this.form.comment = ''
          this.loading = false
        })
      },
      clear () {
        this.dialogFormVisible = false
        console.log(`clearn report  of ${this.activeIndex}`)
        this.loading = true
        gameService.undoReport(this.items[this.activeIndex].id, this.form.comment).then(() => {
          this.$message.success('Game report status is cleared.')
          this.items.splice(this.activeIndex, 1)
          this.$emit('gameReportCleared')
        }).catch(error => {
          console.log(error)
          this.$message.error('undo report action failed.')
        }).finally(() => {
          this.form.comment = ''
          this.loading = false
        })
      },
      removeGameFromRecomended () {
        this.dialogFormVisible = false
        this.loading = true
        gameService.undoRecommend(this.items[this.activeIndex].id).then(() => {
          this.$message.success('Game is removed from recommended list.')
          this.items.splice(this.activeIndex, 1)
          this.$emit('gameUndoRecommended')
        }).catch(error => {
          console.log(error)
          this.$message.error('Failed to remove game from recommended list.')
        }).finally(() => {
          this.loading = false
        })
      },
      transformTime (time) {
        let result = moment(time).format('DD/MM/YYYY, h:mm')
        return result
      }
    },
    computed: {
      commentIsEmpty () {
        return this.form.comment == null || this.form.comment.trim().length === 0
      }
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
