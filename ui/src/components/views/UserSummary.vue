<template>

  <div class="userProfileContainer">
    <common-header></common-header>
    <div class="userInfo">
      <div class="avatarIcon">
        <avatar :account="$store.getters.user.account"></avatar>
        {{$store.getters.user.account}}
      </div>
      <div class="info">
        <span>{{pendingGames.length + approvedGames.length}} Games</span>
        <span>|</span>
        <span>{{userData.follower_count}} Followers</span>
        <span>|</span>
        <span>{{userData.following_count}} Following</span>
      </div>
    </div>
    <div class="userSummary">
      <el-tabs v-model="activeName">
        <el-tab-pane label="Live Games" name="liveGames">
          <div class="headerTitle">All Live Games</div>
          <div class="gameContainer">
            <span v-if="approvedGames.length == 0" class="emptyMessage">No live game right now.</span>
            <div v-if="approvedGames.length > 0">
              <game-grid v-if="approvedGames.length > 0" v-for="game in approvedGames" :game="game" :key="game.id"></game-grid>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Pending Games" name="pendingGames">
          <div class="headerTitle">All Pending Games</div>
          <div class="gameContainer">
            <span v-if="pendingGames.length == 0" class="emptyMessage">No pending game right now.</span>
            <div v-if="pendingGames.length > 0">
              <game-grid  v-for="game in pendingGames" :game="game" :key="game.id" :mode="edit"></game-grid>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Reported Games" name="reportedGames">
          <div class="headerTitle">All Reported Games</div>
          <div class="gameContainer">
            <span v-if="reportedGames.length == 0" class="emptyMessage">No reported game right now.</span>
            <div v-if="reportedGames.length > 0">
              <game-grid  v-for="game in pendingGames" :game="game" :key="game.id" :mode="edit"></game-grid>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Rewards" name="awards">Total rewards: {{totalPayout}}</el-tab-pane>
      </el-tabs>
    </div>
    <common-footer></common-footer>
  </div>
</template>
<script>
  import CommonHeader from '../common/CommonHeader'
  import CommonFooter from '../common/CommonFooter.vue'
  import GameList from '../shared/GameList'
  import GameGrid from '../shared/GameGrid.vue'
  import Avatar from '../shared/Avatar'
//  import moment from 'moment'
  import GameService from '../../service/game.service'
  import axios from 'axios'
  const gameService = new GameService()

  export default {
    components: {
      GameList,
      CommonHeader,
      CommonFooter,
      GameGrid,
      Avatar
    },
    data () {
      return {
        approvedGames: [],
        pendingGames: [],
        reportedGames: [],
        totalPayout: 0,
        activeName: 'liveGames',
        userData: {
          follower_count: 0,
          following_count: 0
        }
      }
    },
    props: [],
    methods: {
      initData () {
        this.fetchUserGames()
        this.fetchUserSteemInfo()
      },
      fetchUserSteemInfo () {
        if (this.$store.state.user.account) {
          axios.get('https://api.steemjs.com/get_follow_count?account=' + this.$store.state.user.account).then(response => {
            console.log(response)
            this.userData = response.data
          })
        }
      },
      fetchUserGames () {
        console.log(1)
        gameService.query({status: 1, creator: this.$store.getters.user.account}).then(response => {
          this.approvedGames = response.items
          this.calculateTotalPayout(this.approvedGames)
        })
        gameService.query({status: 0, creator: this.$store.getters.user.account}).then(response => {
          this.pendingGames = response.items
          this.calculateTotalPayout(this.pendingGames)
        })
        gameService.query({report: 1, creator: this.$store.getters.user.account}).then(response => {
          this.reportedGames = response.items
          this.calculateTotalPayout(this.reportedGames)
        })
      },
      calculateTotalPayout (gameList) {
        gameList.forEach(game => {
          this.totalPayout += game.payout
        })
      }
    },
    beforeRouteEnter (to, from, next) {
      console.log('beforeRouteEnter')
      next()
    },
    beforeRouteUpdate (to, from, next) {
      console.log('beforeRouteUpdate')
//      if (this.$store.getters.loggedIn) {
//        this.initData()
//        next()
//      } else {
//        this.$router.push({
//          name: 'home'
//        })
//      }
    },
    mounted () {
      axios.get('v1/me').then(response => {
        console.log('user logged in')
        this.$store.commit('setUser', response.data)
        this.initData()
        this.loggedIn = true
      }).catch(error => {
        console.log(error)
        this.loggedIn = false
        this.$router.push('home')
        this.$store.commit('deleteUser')
      }).finally(() => {
      })
    }
  }
</script>
<style scoped lang="scss">
  .userProfileContainer {
    padding: 0 20px;
    .userSummary {
      padding: 10px 20px 60px 10px;
    }
  }
  .userInfo {
    background-color: #171F24;
    text-shadow: 1px 1px 4px black;
    min-height: 100px;
    color: white;
    padding: 20px;
    .avatarIcon {
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 10px;
    }
    .info {
      span {
        margin-right: 5px;
        font-size: 15px;
      }
    }
  }
</style>
