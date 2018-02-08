<template>
  <div>
    <el-container>
      <el-header>
        <common-header></common-header>
      </el-header>
      <el-container>
        <el-main>
          <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <div class="gamePlayer">
                <!--<img :src="game.coverImg" class="game-cover-image"/>-->
                <!--<iframe msallowfullscreen="true" allowfullscreen="true" id="game_drop" frameborder="0" :src="game.gameIndex" scrolling="no" allowtransparency="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>    </div>-->
                game area
              </div>
              <div class="gameInfo">
                <div class="gameTitle">
                  {{game.title}}
                </div>
                <div class="gameMetadata">
                  <span class="modifiedTime">{{postedTime}}</span>
                  <span class="totalPayout">${{metadata.totalPayout}}</span>
                  <span class="activeVotes">
                    <i class="fa fa-thumbs-o-up" aria-hidden="true" @click="vote"></i> {{votes}}
                  </span>
                  <span class="report">
                    <i class="fa fa-flag-checkered" aria-hidden="true"></i>
                  </span>
                  <span class="type">
                    Type: {{game.category}}
                  </span>
                </div>
                <div class="gameTags">
                  <span v-for="tag in metadata.tags" class="gameTag">{{tag}}</span>
                </div>
                <div class="authorInfo">
                  <avatar :accountName="game.account"></avatar>
                  <div class="accountName"><a :href="'https://steemit.com/@' + game.account" target="_blank">{{game.account}}</a></div>
                </div>
                <div class="description" v-html="compiledDescription">
                </div>
                <div class="comments">
                  <div class="commentAction">
                    <div class="commentActionTitle">Comments</div>
                    <div class="commentActionText">
                      <el-input placeholder="Leave a comment" v-model="gameComment"></el-input>
                    </div>
                    <div class="commentActionButton">
                      <el-button round>Comment</el-button>
                    </div>
                  </div>
                  <div v-for="comment in metadata.comments">
                    <comment :comment="comment"></comment>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :lg="4" :xl="4" class="hidden-md-and-down">
              <div class="similarGame">
                <div v-if="similarGames.length > 0">
                  <div class="similarGameTitle">
                    You may also like
                  </div>
                  <game-list :items="similarGames"></game-list>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
      <el-footer>
        <common-footer></common-footer>
      </el-footer>
    </el-container>
  </div>
</template>
<script>
  import CommonHeader from '../common/CommonHeader'
  import CommonFooter from '../common/CommonFooter.vue'
  import GameList from '../shared/GameList'
  import Avatar from '../shared/Avatar'
  import Comment from '../shared/Comment'
  import GameService from '../../service/game.service'
  import mockData from '../../mocks/gameListMock'
  import moment from 'moment'
  import marked from 'marked'
  const gameService = new GameService()

  export default {
    components: {
      GameList,
      CommonHeader,
      CommonFooter,
      Avatar,
      Comment
    },
    data () {
      return {
        isAuditMode: false,
        similarGames: mockData.items,
        game: {},
        gameComment: '',
        comments: [],
        metadata: {},
        userInfo: {},
        latestPost: null
      }
    },
    props: ['id'],
    computed: {
      compiledDescription () {
        if (this.game.description) {
          return marked(this.game.description, {sanitize: true})
        } else {
          return ''
        }
      },
      postedTime () {
        return moment(this.game.lastModified, 'x').fromNow()
      },
      votes () {
        return this.metadata && this.metadata.activeVotes ? this.metadata.activeVotes.length : 0
      }

    },
    methods: {

      canVote () {
        let canVote = true
        if (this.latestPost != null && this.metadata.activeVotes != null) {
          for (let i = 0; i < this.metadata.activeVotes.length; i++) {
            if (this.metadata.activeVotes[i].voter === 'steemitgame.test') {
              canVote = false
              break
            }
          }
        } else {
          canVote = false
        }
        return canVote
      },
      vote (weight) {
        if (weight == null) {
          weight = 5000
        }
        if (this.canVote()) {
          gameService.vote(this.latestPost.author, this.latestPost.permlink, weight).then(response => {
            this.$message('vote successfully')
            this.refreshSteemitMetaData()
          }).catch(error => {
            console.log('Fail to vote ', this.latestPost, error)
            this.$alert('Fail to vote, please try it later.')
          })
        } else {
          this.$message({
            message: 'You have already vote this game.',
            type: 'warning'
          })
        }
      },
      refreshSteemitMetaData () {
        if (this.game) {
          this.latestPost = null
          if (this.game & this.game.activities && this.game.activities.length > 0) {
            this.latestPost = this.game.activities[this.game.activities.length - 1]
          }
          gameService.fetchSteemitMetadata(this.game).then(response => {
            console.log('get steem data', response)
            this.metadata = response
          })
        }
      },
      refreshSteemitComments () {
        if (this.game & this.game.activities && this.game.activities.length > 0) {
          let activity = this.game.activities[this.game.activities.length - 1]
          gameService.getComments('', activity.author, activity.permlink).then(response => {
            this.comments = response
          })
        }
      }
    },
    mounted () {
      if (this.id) {
        gameService.getById(this.id).then(response => {
          this.game = response
          console.log('mounted successfully', this.game)
          this.refreshSteemitMetaData()
          this.refreshSteemitComments()
        })
      }
    }
  }
</script>
<style lang='scss' scoped>
  .similarGameTitle {
    font-size: 20px;
    font-weight: bold;
  }

  .gamePlayer {
    background-color: #00B6FF;
    height: 400px;
    padding: 20px;

  }

  .gameInfo {
    padding: 10px;

    .comments {
      margin-top: 20px;
      .commentAction {
        margin-top: 20px;
        margin-bottom: 20px;
        .commentActionTitle {
          display:flex;
        }
        .commentActionText {
          display:flex;
          margin-top: 10px;
        }
        .commentActionButton {
          display:flex;
          flex-direction: row-reverse;
          margin-top: 10px;
        }
      }
    }
  }
  .gameTags {
    margin: 20px 0;
    display: flex;
    .gameTag {
      display: inline;
      margin-right: 12px;
      /*line-height: 32px;*/
      padding: 4px 6px;
      background: rgba(94,109,130,.1);
      border: 1px solid rgba(94,109,130,.2);
      border-radius: 4px;
      color: #5e6d82;
      float: left;
    }
  }

  .gameMetadata {
    height: 30px;
    line-height: 30px;
    span {
      padding-left: 20px;
    }

    .activeVotes {
      float: right;
      i {
        cursor: pointer;
      }
    }

    .modifiedTime {
      float: left;
    }

    .totalPayout {
      float: right;
    }

    .type {
      float: left;
    }
  }

  .authorInfo {
    display: flex;
    .accountName {
      line-height: 36px;
    }
  }



</style>
