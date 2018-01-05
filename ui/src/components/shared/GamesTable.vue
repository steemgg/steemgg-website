<template>
  <div>
    <el-table :data="items" style="width: 100%" max-height="550" :stripe=true>
      <el-table-column prop="title" label="Name" width="150">
      </el-table-column>
      <el-table-column prop="category" label="Category" width="120">
      </el-table-column>
      <el-table-column prop="activity" label="activity" width="120">
      </el-table-column>
      <el-table-column prop="desc" label="description" width="300">
      </el-table-column>
      <el-table-column prop="createtime" label="Create Time" width="150">
      </el-table-column>
      <el-table-column prop="updatetime" label="Last Modified" width="150"></el-table-column>
      <!--<el-table-column fixed="right" label="Operations" width="180">-->
      <el-table-column label="Operations" width="180">

        <template slot-scope="scope">
          <el-button @click="viewDetails(scope.$index)" type="text" size="small">Detail</el-button>
          <el-button @click="approve(scope.$index)"type="text" size="small">Approve</el-button>
          <el-button @click="deny(scope.$index)" type="text" size="small">Deny</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import { Table, TableColumn
  } from 'element-ui'
  export default {

    components: {
      appTable: Table,
      appTableColumn: TableColumn
    },
    props: ['items'],
    name: 'GamesTable',
    data () {
      return {
      }
    },
    methods: {
      viewDetails (index) {
        console.log(`check details of ${index}`)
      },
      approve (index) {
        console.log(`approve details of ${index}`)
      },
      deny (index) {
        confirm('Are you sure to close this dialog?')
          .then(_ => {
            console.log(`deny details of ${index}`)
          })
      }
    },
    computed: {
    },
    mounted () {
    }
  }
</script>
