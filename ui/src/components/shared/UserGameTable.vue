<template>
  <div>
    <el-table :data="items" style="width: 100%" :stripe=true v-loading="loading" :empty-text="'None'">
      <el-table-column prop="id" label="ID" width="100">
      </el-table-column>
      <el-table-column label="Name" width="150">
        <template slot-scope="scope">
          <el-button @click="playGame(scope.row.id)" type="text" size="small">{{scope.row.title}}</el-button>
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
          <comment-popover :comments="scope.row.auditComments"></comment-popover>
        </template>
      </el-table-column>
      <el-table-column label="Operations" fixed="right">
        <template slot-scope="scope">
          <el-button @click="editGame(scope.row.id)" type="success" size="mini" >Edit</el-button>
          <!--<el-button v-if="scope.row.status == 1" @click="playGame(scope.row.id)" type="success" size="mini">Play</el-button>-->
          <!--<el-button v-if="scope.row.status == 0" @click="playGame(scope.row.id)" type="success" size="mini">Preview</el-button>-->
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  //  import { Table, TableColumn } from 'element-ui'
  import moment from 'moment'
  import CommentPopover from './CommentPopover.vue'

  export default {

    components: {
      CommentPopover
    },
    props: ['items'],
    name: 'UserGameTable',
    data () {
      return {
        dialogFormVisible: false,
        loading: false
      }
    },
    methods: {
      playGame (id) {
        console.log(`check details of ${id}`)
        this.$router.push({
          name: 'viewGame',
          params: {
            id: id
          }
        })
      },
      editGame (id) {
        console.log(`edit of ${id}`)
        this.$router.push({
          name: 'editGame',
          params: {
            id: id
          }
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
