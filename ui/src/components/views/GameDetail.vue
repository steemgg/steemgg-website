<template>
  <div>
    <el-container>
      <el-header>
        <common-header></common-header>
      </el-header>
      <el-container>
        <el-main>
          <el-row>
            <div class="gamePlayer">
              <fullscreen ref="fullscreen" @change="fullscreenChange" class="full-screen-container" >
                <div class="frameWrapper" :style="{ width: this.fullscreen ? '100%' : (game.width + 'px'),  height: this.fullscreen ? '100%' : (game.height + 'px')}">
                  <!--<img :src="game.coverImg" class="game-cover-image"/>-->
                  <iframe msallowfullscreen="true" allowfullscreen="true" id="game_container" :width="this.fullscreen ? '100%' : game.width" :height="this.fullscreen ? '100%' : game.height" frameborder="0" scrolling="no" allowtransparency="true" webkitallowfullscreen="true" mozallowfullscreen="true" :src="gameUrl" ></iframe>
                </div>
                <!--<button type="button" @click="toggle" >Full Screen</button>-->
                <button type="button" @click="toggle" class="btn btn-default btn-game-fullscreen">
                  <i v-if="this.fullscreen === false" class="material-icons">fullscreen</i>
                  <i v-if="this.fullscreen === true" class="material-icons">fullscreen_exit</i></button>
              </fullscreen>
            </div>
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <div class="gameInfo">
                <div class="gameTitle">
                  {{game.title}}
                </div>
                <div class="gameMetadata">
                  <span class="modifiedTime">Added on {{postedTime}}</span>
                  <span class="totalPayout">${{totalPayout}}</span>
                  <span class="activeVotes">
                    <el-tooltip class="item" effect="dark" content="Vote" placement="top">
                      <i v-if="alreadyVoted" class="fa fa-thumbs-up" aria-hidden="true" @click="alreadyVotedMessage"></i>
                    </el-tooltip>

                    <el-popover
                      placement="top"
                      width="200"
                      trigger="click"
                      v-model="votingWeightVisible">
                      <!--@show="onVotingPopoverDisplay"-->
                      <div class="block" >
                        <!--<el-slider v-model="defaultVotingWeight" :min="1"></el-slider>-->
                        <vue-slider ref="votingSlider" v-model="defaultVotingWeight" :show="votingWeightVisible" :min="1" :max="100"></vue-slider>
                        <div>
                          <el-button @click="voteUp" type="success" size="mini">Confirm</el-button>
                          <el-button @click="votingWeightVisible = false" size="mini">Cancel</el-button>
                        </div>
                      </div>
                      <i v-if="!alreadyVoted" class="fa fa-thumbs-o-up" aria-hidden="true" slot="reference" v-loading="voting"></i>
                    </el-popover>
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
                  <div v-if="showApprove" class="approve">
                    <el-button @click="approveDialogFormVisible = true" :disabled="this.latestPost == null" type="primary">Approve this game</el-button>
                    <el-tooltip class="item" effect="dark" content="Cannot be approved because it does not have any post." placement="top">
                      <i v-if="this.latestPost == null" class="el-icon-warning" style="color: red"></i>
                    </el-tooltip>
                  </div>
                <div class="gameTags">
                  <span v-for="tag in metadata.tags" class="gameTag">{{tag}}</span>
                </div>
                <div class="authorInfo">
                  <avatar :account="game.account"></avatar>
                  <div class="accountName"><a :href="'https://steemit.com/@' + game.account" target="_blank">{{game.account}}</a></div>
                </div>
                <div class="description markdown-body" v-html="compiledDescription">
                </div>
                <div class="comments" v-loading="loadingComment">
                  <div class="commentAction">
                    <div class="commentActionTitle">Comments</div>
                    <div class="commentActionText">
                      <el-input autosize type="textarea" placeholder="Leave a comment" v-model="gameComment" :disabled="posting"></el-input>
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
          <el-dialog title="Report Game" :visible.sync="dialogFormVisible">
            <el-form :model="form">
              <el-form-item label="Report comment">
                <el-input :rows="3" v-model="form.comment" auto-complete="off" type="textarea"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="dialogFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="report" :disabled="commentIsEmpty" :loading="reporting">Confirm</el-button>
            </div>
          </el-dialog>

          <el-dialog title="Approve Game" :visible.sync="approveDialogFormVisible">
            <el-form :model="form">
              <el-form-item label="Approve comment">
                <el-input :rows="3" v-model="form.approveComment" auto-complete="off" type="textarea"></el-input>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="approveDialogFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="approve" :disabled="approveCommentIsEmpty" :loading="approving">Confirm</el-button>
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
  import vueSlider from 'vue-slider-component'
  import GameService from '../../service/game.service'
  import * as postRobot from 'post-robot'
  const gameService = new GameService()

  export default {
    components: {
      GameList,
      CommonHeader,
      CommonFooter,
      Avatar,
      Comment,
      vueSlider
    },
    data () {
      return {
        isAuditMode: false,
        similarGames: [],
        game: {},
        gameRecord: null,
        gameUrl: '',
        gameComment: '',
        comments: [],
        metadata: {},
        userInfo: {},
        latestPost: null,
        posting: false,
        showApprove: false,
        loadingComment: false,
        reporting: false,
        approving: false,
        voting: false,
        dialogFormVisible: false,
        approveDialogFormVisible: false,
        fullscreen: false,
        gameSDKListener: null,
        gameIFrame: null,
        defaultVotingWeight: 100,
        votingWeightVisible: false,
        totalPayout: 0.000,

        form: {
          comment: '',
          approveComment: ''
        }
      }
    },
    props: ['id'],
    computed: {
      compiledDescription () {
        if (this.game.description) {
          let markup = marked(this.game.description, {sanitize: true})
          return markup.replace(/\n/g, '<br />')
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
      },
      approveCommentIsEmpty () {
        return this.form.approveComment == null || this.form.approveComment.trim().length === 0
      },
      alreadyVoted () {
        let voted = false
        if (this.latestPost != null && this.metadata.latestVotes != null) {
          for (let i = 0; i < this.metadata.latestVotes.length; i++) {
            if (this.metadata.latestVotes[i].voter === this.$store.state.user.account) {
              voted = true
              break
            }
          }
        } else {
          voted = false
        }
        return voted
      }
    },
    methods: {
      openDialog () {
        this.dialogFormVisible = true
      },
      report () {
        this.reporting = true
        gameService.report(this.game.id, this.form.comment).then(response => {
          this.dialogFormVisible = false
          this.$message('report successfully')
        }).catch(error => {
          this.dialogFormVisible = false
          console.log('Fail to report', error.response)
          this.$alert('Sorry, error happens during report this game. Please try it later.', 'Fail to report', {
            confirmButtonText: 'Close'
          })
        }).finally(() => {
          this.form.comment = ''
          this.reporting = false
        })
      },
      approve () {
        this.approving = true
        gameService.approve(this.game.id, this.form.approveComment).then(response => {
          this.approveDialogFormVisible = false
          this.showApprove = false
          this.$message('Approve successfully')
          this.comments.unshift({
            author: response.author,
            total_payout_value: '0.000 SBD',
            pending_payout_value: '0.000 SBD',
            replies: [],
            permlink: response.permlink,
            body: this.form.approveComment,
            last_update: moment().toISOString()
          })
        }).catch(error => {
          this.approveDialogFormVisible = false
          console.log('Fail to approve', error.response)
          this.$alert('Sorry, error happens during approve this game. Please try it later.', 'Fail to approve', {
            confirmButtonText: 'Close'
          })
        }).finally(() => {
          this.form.approveComment = ''
          this.approving = false
        })
      },
      voteUp () {
        this.votingWeightVisible = false
        if (this.$store.state.loggedIn) {
          if (this.alreadyVoted === false) {
            this.voting = true
            gameService.vote(this.latestPost.account, this.latestPost.permlink, this.defaultVotingWeight * 100).then(response => {
              this.$message('vote successfully')
              this.refreshSteemitMetaData()
            }).catch(error => {
              console.log('Fail to vote ', this.latestPost, error)
              this.$alert('Fail to vote, please try it later.')
            }).finally(() => {
              this.voting = false
            })
          } else {
            this.alreadyVotedMessage()
          }
        } else {
          this.$message({
            message: 'Please log in first to vote this game.',
            type: 'warning'
          })
        }
      },
      alreadyVotedMessage () {
        this.$message({
          message: 'You have already voted this game.',
          type: 'warning'
        })
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
            this.gameComment = ''
            this.$message.success('Comment added successfully.')
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
        if (this.game) {
          this.latestPost = null
          if (this.game && this.game.activities && this.game.activities.length > 0) {
            this.latestPost = this.game.activities[0]
          }
          gameService.fetchSteemitMetadata(this.game).then(response => {
            console.log('get steem data', response)
            this.metadata = response
            this.totalPayout = this.metadata.totalPayout.toFixed(3)
          }).catch(error => {
            console.log('fail to get steem data', error.response)
          })
        }
      },
      refreshSteemitComments () {
        if (this.game && this.game.activities && this.game.activities.length > 0) {
          this.loadingComment = true
          gameService.fetchAllSteemitComments(this.game).then(response => {
            this.comments = response.reduce((acc, currentValue) => { return acc.concat(currentValue) }, []).sort((a, b) => {
              // sort the comments based on the reverse of id
              return b.id - a.id
            })
          }).catch(error => {
            console.log('loading comment fail', error.reponse)
            this.$message.error('Fail to load comment')
          }).finally(() => {
            this.loadingComment = false
          })
        }
      },
      fetchGame () {
        this.showApprove = false
        if (this.id) {
          gameService.getById(this.id).then(response => {
            this.game = response
            this.initSKDListener()
            if (this.game.status === 1 || this.$store.getters.isAuditor || (this.$store.state.loggedIn && this.$store.getters.user.account === this.game.account)) {
              this.gameUrl = process.env.IPFS_SERVER_URL + this.game.gameUrl.hash
              if (this.$store.state.loggedIn) {
                this.gameUrl = this.gameUrl + '?account=' + encodeURIComponent(this.$store.getters.user.account)
              }
              console.log('mounted successfully', this.game)
              this.showApprove = this.$store.getters.isAuditor && this.game && this.game.status === 0
              this.refreshSteemitMetaData()
              this.refreshSteemitComments()
              this.fetchSimilarGame(this.game.category)
            } else {
              this.$message.error('This game has not been approved so cannot be played!')
            }
          }).catch(error => {
            console.log('Fail to load the game with id: ' + this.id, error)
            this.$message.error('Fail to load the game. Please make sure the game exist.')
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
      },
      toggle () {
        this.$refs['fullscreen'].toggle() // recommended
      },
      fullscreenChange (fullscreen) {
        this.fullscreen = fullscreen
      },
      initSKDListener () {
        setTimeout(() => {
          if (document.getElementById('game_container')) {
            this.gameIFrame = document.getElementById('game_container')
            console.log('game iFrame exist now', this.gameIFrame)
            if (this.gameSDKListener) {
              this.gameSDKListener.cancel()
            }
            // let listener = postRobot.listener({ window: this.extensionIFrame})
            this.gameSDKListener = postRobot.listener({window: this.gameIFrame.contentWindow})
            this.gameSDKListener.on('getGameLeaderBoard', event => {
              console.log('Game SDK: receive getGameLeaderBoard: ', event.data.value)
              return this.fetchGameLeaderBoard(this.id, event.data.value)
            })
            this.gameSDKListener.on('updateGameRecord', event => {
              this.gameRecord = event.data.value
              console.log('Game SDK: receive updateGameRecord: ', event.data.value)
              return this.updateGameRecord(event.data.value)
            })

            this.gameSDKListener.on('getGameRecord', event => {
              return this.fetchGameRecord()
            })

            this.gameSDKListener.on('getGameMetadata', event => {
              console.log('Game SDK: receive getGameMetadata, return: ', this.game)
              return this.game
            })

            this.gameSDKListener.on('getCurrentLocale', event => {
              let locale = navigator.language
              console.log('Game SDK: receive getCurrentLocale return: ', locale)
              return locale
            })

            this.gameSDKListener.on('getCurrentUser', event => {
              if (this.$store.state.loggedIn) {
                console.log('Game SDK: receive getCurrentUser, return: ', this.$store.state.user.account)
                return this.$store.state.user.account
              } else {
                return null
              }
            })

            this.gameSDKListener.on('updateHeight', event => {
              if (event && event.data && event.data.height) {
                console.log('Game SDK: receive updateHeight: ', event.data.height)
                this.gameIFrame.setAttribute('height', event.data.height)
              } else {
                console.log('Game SDK: receive updateHeight with invalid data format: ', event)
              }
            })
          } else {
            console.log('Extension iFrame not exist yet, try again')
            this.initSKDListener()
          }
        }, 100)
      },
      updateGameRecord () {
        return gameService.updateGameRecord(this.id, this.gameRecord)
      },
      fetchGameRecord () {
        return gameService.fetchGameRecord(this.id).then((record) => {
          this.gameRecord = record
          return this.gameRecord
        })
      },
      fetchGameLeaderBoard () {
        return gameService.fetchGameLeaderBoard(this.id)
      }
    },
    watch: {
      'id': function (val, oldVal) {
        this.fetchGame()
      }
    },
    mounted () {
      this.fetchGame()
    },
    beforeDestroy () {
      if (this.gameSDKListener) {
        this.gameSDKListener.cancel()
      }
    }
  }
</script>
<style lang='scss' scoped>
  .similarGameTitle {
    font-size: 20px;
    font-weight: bold;
    margin-left: 20px;
  }

  .description {
    margin: 20px;
  }
  .gamePlayer {
    background-color: #5bc0de
    /*height: 400px*/
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
          display:flex
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
  .full-screen-container {
    /*height: 400px*/
    width: 100%;
    position: relative;
    margin-left: auto;
    margin-right: auto;

    .frameWrapper {
      margin-left: auto;
      margin-right: auto;
    }
    .btn-game-fullscreen {
      position:absolute;
      right:10px;
      bottom:10px;
      padding:0;
      font-size:36px;
      line-height:1px;
      text-align:center;
      outline:none;
    }

    &.fullscreen {
      .btn-game-fullscreen {
        left:10px;
        top:10px;
        right:auto;
        bottom:auto;
      }
    }

  }
  .gameTags {
    margin: 20px 0;
    display: flex;
    flex-wrap:wrap;
    .gameTag {
      text-transform: lowercase;
      display: inline;
      margin-right: 12px;
      margin-top:12px;
      /*line-height: 32px*/
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
        cursor: pointer
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
      margin-left: 10px;
      line-height: 36px;
    }
  }



</style>
