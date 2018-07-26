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
          <div class="gameContainer">
            <span v-if="approvedGames.length == 0" class="emptyMessage">No live game right now.</span>
            <user-game-table v-if="approvedGames.length > 0" :items="approvedGames"></user-game-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Pending Games" name="pendingGames">
          <div class="gameContainer">
            <span v-if="pendingGames.length == 0" class="emptyMessage">No pending game right now.</span>
            <user-game-table v-if="pendingGames.length > 0" :items="pendingGames"></user-game-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Reported Games" name="reportedGames">
          <user-game-table :items="reportedGames" v-if="reportedGames.length > 0"></user-game-table>
          <span v-if="reportedGames.length == 0"  class="emptyMessage">No reported game right now.</span>
        </el-tab-pane>
        <el-tab-pane label="Rewards" name="awards">
          <div class="rewardDetail">
            Total rewards: {{totalPayout}}
          </div>
          <div class="blocktradeLabel">
            <h2>Trade your reward Now</h2>
          </div>
          <div class="blocktrade">
            <iframe class="blocktrades" src="https://widget.blocktrades.us?affiliate_id=9c246782-6e0f-44f7-977d-e0f8c365b8d5&show_powered_by_blocktrades=false" height="600" width="90%" style="border: none;">Can't load Exchange widget.</iframe>
          </div>
        </el-tab-pane>
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
  import CommentPopover from '../shared/CommentPopover.vue'
  import UserGameTable from '../shared/UserGameTable.vue'
  import Avatar from '../shared/Avatar'
  import moment from 'moment'
  import GameService from '../../service/game.service'
  import axios from 'axios'
  const gameService = new GameService()

  export default {
    components: {
      GameList,
      CommonHeader,
      CommonFooter,
      GameGrid,
      Avatar,
      CommentPopover,
      UserGameTable
    },
    data () {
      return {
        loading: false,
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
      playGame (index) {
        console.log(`check details of ${index}`)
        this.$router.push({
          name: 'viewGame',
          params: {
            id: this.items[index].id
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
        gameService.query({status: 1, creator: this.$store.getters.user.account, includeComment: true}).then(response => {
          this.approvedGames = response.items
          this.calculateTotalPayout(this.approvedGames)
        })
        gameService.query({status: 0, creator: this.$store.getters.user.account, includeComment: true}).then(response => {
          this.pendingGames = response.items
          this.calculateTotalPayout(this.pendingGames)
        })
        gameService.query({report: 1, creator: this.$store.getters.user.account, includeComment: true}).then(response => {
          this.reportedGames = response.items
          this.calculateTotalPayout(this.reportedGames)
        })
      },
      calculateTotalPayout (gameList) {
        gameList.forEach(game => {
          this.totalPayout += game.payout
        })
      },
      transformTime (time) {
        let result = moment(time).format('DD/MM/YYYY, h:mm')
        return result
      }
    },
    mounted () {
      this.initData()
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
    text-align: center;
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

  .rewardDetail {
    font-size: 20px;
  }
  .emptyMessage {
    font-weight: bold;
    font-size: 20px;
  }
  .blocktrade {
    padding-top: 20px;
    border: 1px solid black;
  }
</style>
