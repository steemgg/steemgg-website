<template>
  <div>
    <el-header>
    <common-header></common-header>
    </el-header>
    <div class="listContainer">
      <el-tabs v-model="activeTab" type="border-card" @tab-click="handleClick" v-loading="loading">
        <el-tab-pane label="Pending Game" name="audit"><app-game-table :items="auditItems" type="audit" @gameApproved="updateLiveGames"  class="audit-table"></app-game-table></el-tab-pane>
        <el-tab-pane label="Reported Game" name="report"><app-game-table :items="reportItems" type="report" @gameDenied="updatePendingGames" class="audit-table"></app-game-table></el-tab-pane>
        <el-tab-pane label="Live Game" name="live"><app-game-table :items="liveItems" type="live" @gameDenied="updatePendingGames" class="audit-table"></app-game-table></el-tab-pane>
        <el-tab-pane v-if="$store.getters.isAdmin" label="Recommended Game" type="recommend">
          <div class="addRecommended">
            <el-input placeholder="Input game id" v-model="recommendGameId" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="previewRecommendGame"></el-button>
            </el-input>
          </div>
          <app-game-table :items="recommendedGames" type="recommended" @gameUndoRecommended="updateRecommendedGames" class="audit-table"></app-game-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-footer>
      <common-footer></common-footer>
    </el-footer>
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
        liveItems: null,
        recommendedItems: null,
        activeTab: 'audit',
        loading: false,
        recommendGameId: null
      }
    },
    computed: {
    },
    methods: {
      updateLiveGames () {
        gameService.query({status: 1, limit: 1000, includeComment: true}).then(result => {
          console.log(result)
          this.liveItems = result.items
          console.log('get the game item list', this.reportItems)
        })
      },

      updateReportGames () {
        gameService.query({report: 1, limit: 1000, includeComment: true}).then(result => {
          console.log(result)
          this.reportItems = result.items
          console.log('get the game item list', this.reportItems)
        })
      },

      updatePendingGames () {
        this.loading = true
        gameService.query({status: 0, limit: 1000, includeComment: true}).then(result => {
          console.log(result)
          this.auditItems = result.items
          console.log('get the pending game list', this.auditItems)
        }).catch(error => {
          this.$message.error('Fail to load pending game data')
          console.log(error.response)
        }).finally(() => {
          this.loading = false
        })
      },

      updateRecommendedGames () {
        this.loading = true
        gameService.query({status: 1, limit: 1000, includeComment: true}).then(result => {
          console.log(result)
          this.recommendedItems = result.items
          console.log('get the recommended game item list', this.auditItems)
        }).catch(error => {
          this.$message.error('Fail to load auditItems game data')
          console.log(error.response)
        }).finally(() => {
          this.loading = false
        })
      },

      previewRecommendGame () {
        let reg = /^\d+$/
        if (this.recommendGameId != null) {
          if (reg.test(this.recommendGameId)) {
            gameService.recommend(this.recommendGameId).then(() => {
              this.$message.success('Game has been marked as recommended')
              this.updateRecommendedGames()
            }).catch(err => {
              console.log('Fail to mark game as recommended', err)
              this.$message.success('Fail to mark game as recommended, please double check the game Id is valid')
            })
          } else {
            this.$message.error('Invalid game id.')
          }
        }
      }
    },
    mounted () {
      this.updatePendingGames()
      this.updateLiveGames()
      this.updateReportGames()
      this.updateRecommendedGames()
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
