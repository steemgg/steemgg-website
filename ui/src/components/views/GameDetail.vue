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
                <iframe msallowfullscreen="true" allowfullscreen="true" id="game_drop" height="400px" style="height:400px; width: 100%" frameborder="0" scrolling="no" allowtransparency="true" webkitallowfullscreen="true" mozallowfullscreen="true" :src="gameUrl" ></iframe>
              </div>
              <div class="gameInfo">
                <div class="gameTitle">
                  {{game.title}}
                </div>
                <div class="gameMetadata">
                  <span class="modifiedTime">Added on {{postedTime}}</span>
                  <span class="totalPayout">${{metadata.totalPayout}}</span>
                  <span class="activeVotes">
                    <el-tooltip class="item" effect="dark" content="Vote" placement="top">
                      <i class="fa fa-thumbs-o-up" aria-hidden="true" @click="voteUp"></i>
                    </el-tooltip>
                     {{votes}}
                  </span>
                  <span class="report" @click="openDialog">
                    <el-tooltip class="item" effect="dark" content="Report" placement="top">
                      <i class="fa fa-flag-checkered" aria-hidden="true"></i>
                    </el-tooltip>
                  </span>
                  <span class="type">
                    Type: {{game.category}}
                  </span>
                </div>
                <div class="gameTags">
                  <span v-for="tag in metadata.tags" class="gameTag">{{tag}}</span>
                </div>
                <div class="authorInfo">
                  <avatar :account="game.account"></avatar>
                  <div class="accountName"><a :href="'https://steemit.com/@' + game.account" target="_blank">{{game.account}}</a></div>
                </div>
                <div class="description" v-html="compiledDescription">
                </div>
                <div class="comments" v-loading="loadingComment">
                  <div class="commentAction">
                    <div class="commentActionTitle">Comments</div>
                    <div class="commentActionText">
                      <el-input placeholder="Leave a comment" v-model="gameComment" :disabled="posting"></el-input>
                    </div>
                    <div class="commentActionButton">
                      <el-button round @click="postComment" :loading="posting">Comment</el-button>
                    </div>
                  </div>
                  <div v-for="comment in this.comments">
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
          <el-dialog title="Report comment" :visible.sync="dialogFormVisible">
            <el-form :model="form">
              <el-form-item label="Report comment">
                <el-input :rows="3" v-model="form.comment" auto-complete="off" type="textarea"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="report" :disabled="commentIsEmpty">Confirm</el-button>
            </div>
          </el-dialog>
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
  import moment from 'moment'
  import marked from 'marked'
  import GameService from '../../service/game.service'
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
        similarGames: [],
        game: {},
        gameUrl: '',
        gameComment: '',
        comments: [],
        metadata: {},
        userInfo: {},
        latestPost: null,
        posting: false,
        loadingComment: false,
        dialogFormVisible: false,
        form: {
          comment: ''
        }
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
        return moment(this.game.lastModified).fromNow()
      },
      votes () {
        return this.metadata && this.metadata.activeVotes ? this.metadata.activeVotes.length : 0
      },
      commentIsEmpty () {
        return this.form.comment == null || this.form.comment.trim().length === 0
      }
    },
    methods: {
      openDialog () {
        this.dialogFormVisible = true
      },
      report () {
        gameService.report(this.game.id, this.form.comment).then(response => {
          this.dialogFormVisible = false
          this.$message('report successfully')
        }).catch(error => {
          this.dialogFormVisible = false
          console.log('Fail to report', error.response)
          this.$alert('Fail to report!.')
        })
      },
      canVote () {
        let canVote = true
        if (this.latestPost != null && this.metadata.activeVotes != null && this.$store.state.loggedIn) {
          for (let i = 0; i < this.metadata.activeVotes.length; i++) {
            if (this.metadata.activeVotes[i].voter === this.$store.user.account) {
              canVote = false
              break
            }
          }
        } else {
          canVote = false
        }
        return canVote
      },
      voteUp () {
        if (this.canVote()) {
          gameService.vote(this.latestPost.account, this.latestPost.permlink, 5000).then(response => {
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
      postComment () {
        if (this.gameComment.length > 0 && this.gameComment.length <= 5) {
          this.$message.warning('comment is too short')
        } else if (this.gameComment.length > 5 && this.latestPost) {
          this.posting = true
          gameService.postComment(this.latestPost.account, this.latestPost.permlink, this.gameComment).then(response => {
            console.log('post comment successfully', response)
            this.comments.unshift({
              author: response.author,
              total_payout_value: '0.000 SBD',
              pending_payout_value: '0.000 SBD',
              replies: [],
              permlink: response.permlink,
              body: this.gameComment,
              last_update: moment().toISOString()
            })
          }).catch(error => {
            if (error.response.data.resultCode === 402) {
              this.$message.error('You just added comment, please wait for a while.')
            } else {
              this.$message.error('Add comment Failed.')
            }
            console.log('error posting comment', error.response)
          }).finally(() => {
            this.posting = false
          })
        }
      },
      refreshSteemitMetaData () {
//        debugger
        if (this.game) {
          this.latestPost = null
          if (this.game && this.game.activities && this.game.activities.length > 0) {
            this.latestPost = this.game.activities[this.game.activities.length - 1]
          }
          gameService.fetchSteemitMetadata(this.game).then(response => {
            console.log('get steem data', response)
            this.metadata = response
          }).catch(error => {
            console.log('fail to get steem data', error.response)
          })
        }
      },
      refreshSteemitComments () {
        if (this.game && this.game.activities && this.game.activities.length > 0) {
          let activity = this.game.activities[this.game.activities.length - 1]
          this.loadingComment = true
          gameService.getComments('', activity.account, activity.permlink).then(response => {
            this.comments = response.reverse()
          }).catch(error => {
            console.log('loading comment fail', error.reponse)
            this.$message.error('Fail to load comment')
          }).finally(() => {
            this.loadingComment = false
          })
        }
      },
      fetchGame () {
        if (this.id) {
          gameService.getById(this.id).then(response => {
            this.game = response
            if (this.game.status === 1) {
              this.gameUrl = 'https://ipfs.io/ipfs/' + this.game.gameUrl.hash
              console.log('mounted successfully', this.game)
              this.refreshSteemitMetaData()
              this.refreshSteemitComments()
              this.fetchSimilarGame(this.game.category)
            } else {
              this.$message.error('This game cannot be played!')
            }
          })
        }
      },
      fetchSimilarGame (category) {
        gameService.query({category: category, status: 0, limit: 10, sort: 'payout_desc'}).then(response => {
          if (response.items.length > 0) {
            this.similarGames = response.items
          } else {
            // get random top vote game
            gameService.query({status: 0, limit: 10, sort: 'payout_desc'}).then(response => {
              this.similarGames = response.items
            }).catch(error => {
              console.log('fetch top payout game error', error.response)
            })
          }
        }).catch(error => {
          console.log('fetch similar game error', error.response)
        })
      }
    },
    watch: {
      'id': function (val, oldVal) {
        this.fetchGame()
      }
    },
    mounted () {
      this.fetchGame()
    }
  }
</script>
<style lang='scss' scoped>
  .similarGameTitle {
    font-size: 20px;
    font-weight: bold;
  }

  .description {
    display: flex;
    margin: 20px;
  }
  .gamePlayer {
    background-color: #00B6FF;
    height: 400px;
  }

  .gameInfo {
    padding: 10px;
    font-size: 1.5em;

    .gameTitle {
      display: flex;
      font-weight: bold;
    }
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
    flex-wrap:wrap;
    .gameTag {
      display: inline;
      margin-right: 12px;
      margin-top:12px;
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
    span{
      padding-left: 20px;
    }

    span:first-child {
      padding-left: 0px;
    }

    .activeVotes, .report {
      float: right;
      i {
        cursor: pointer;
      }
    }

    .modifiedTime {
      float: left;
      font-weight:bold;
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
      margin-left: 20px;
      line-height: 36px;
    }
  }



</style>
