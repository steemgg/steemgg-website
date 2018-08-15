<template>
  <div>
    <el-row>
      <!--<el-col :xs="8" :sm="8" :md="2" :lg="2" :xl="2">-->
        <!--<avatar :accountName="comment.author"></avatar>-->
      <!--</el-col>-->
      <!--<el-col :xs="16" :sm="16" :md="22" :lg="22" :xl="22">-->
      <el-col :xs="3" :sm="3" :md="2" :lg="1" :xl="1" class="avatar-placeholder">
        <avatar :account="comment.author"></avatar>
      </el-col >
      <el-col :xs="21" :sm="21" :md="22" :lg="22" :xl="22">
        <div class="commentWrapper">
          <div class="commentAuthor">
            <span class="author">{{comment.author}}</span>
            <span class="time">{{lateUpdate}}</span>
          </div>
          <div class="body">
            {{comment.body}}
          </div>
          <div class="metadata">
            <span class="votes">
              <el-tooltip class="item" effect="dark" content="Vote" placement="top">
                <i v-if="alreadyVoted" class="fa fa-thumbs-up" aria-hidden="true" @click="alreadyVotedMessage"></i>
              </el-tooltip>
              <el-popover
                placement="top"
                width="200"
                trigger="click"
                v-model="votingWeightVisible">
                <div class="block" >
                  <vue-slider v-model="defaultVotingWeight" :show="votingWeightVisible" :min="1" :max="100"></vue-slider>
                  <div>
                    <el-button @click="voteUp" type="success" size="mini">Confirm</el-button>
                    <el-button @click="votingWeightVisible = false" size="mini">Cancel</el-button>
                  </div>
                </div>
                <i v-if="!alreadyVoted" class="fa fa-thumbs-o-up" aria-hidden="true" slot="reference" v-loading="voting"></i>
              </el-popover>
              {{votesCount}}
            </span>
            <span class="award">${{payout}}</span>
            <span class="reply">
                <el-button type="text" @click="leaveReply = !leaveReply">Reply</el-button>
            </span>
          </div>
          <div class="replyArea" v-if="leaveReply">
            <el-input ref="replyInput" autofocus autosize type="textarea" placeholder="say something..." v-model="replyContent" :disabled="replying"></el-input>
            <div class="replyButtons">
              <el-button round @click="leaveReply = false;" :disabled="replying">Cancel</el-button>
              <el-button round @click="postReply" :loading="replying">Reply</el-button>
            </div>
          </div>
          <div class="commentReplies">
            <div class="commentReply" v-for="reply in comment.replies">
              <comment :comment="reply"></comment>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  import Avatar from './Avatar'
  import GameService from '../../service/game.service'
  import moment from 'moment'
  import vueSlider from 'vue-slider-component'

  const gameService = new GameService()
  export default {
    components: {
      Avatar,
      vueSlider
    },
    props: ['comment'],
    name: 'Comment',
    data () {
      return {
        votesCount: 0,
        leaveReply: false,
        replyContent: '',
        replying: false,
        voting: false,
        alreadyVoted: false,
        votingWeightVisible: false,
        defaultVotingWeight: 100
      }
    },
    methods: {
      voteUp () {
        this.votingWeightVisible = false
        if (this.$store.state.loggedIn) {
          if (this.alreadyVoted === false) {
            if (this.voting === false) {
              this.voting = true
              gameService.vote(this.comment.author, this.comment.permlink, this.defaultVotingWeight * 100).then(response => {
                this.votesCount++
                this.alreadyVoted = true
                this.$message.success('Vote Successfully.')
              }).catch(error => {
                if (error.response.data.resultCode === 402) {
                  this.$message.error('You just voted, please wait for a while.')
                } else {
                  this.$message.error('Vote Failed. Please try again later.')
                }
                console.log('Vote comment failed', error.response)
              }).finally(() => {
                this.voting = false
              })
            }
          } else {
            this.alreadyVotedMessage()
          }
        } else {
          this.$message.warning('Please log in first to vote.')
        }
      },
      alreadyVotedMessage () {
        this.$message({
          message: 'You have already voted this game.',
          type: 'warning'
        })
      },
      canVote () {
        // user has login
        return this.$store.state.loggedIn && this.voting === false
      },
      postReply () {
        if (this.replyContent == null || this.replyContent.trim().length === 0) {
        } else {
          this.replying = true
          gameService.postComment(this.comment.author, this.comment.permlink, this.replyContent).then(response => {
            console.log('comment response', response)
            this.comment.replies.unshift({
              author: response.author,
              total_payout_value: '0.000 SBD',
              pending_payout_value: '0.000 SBD',
              replies: [],
              permlink: response.permlink,
              body: this.replyContent,
              last_update: moment().toISOString()
            })
            this.leaveReply = false
            this.$message.success('Post reply successfully.')
          }).catch(error => {
            console.log('post comment error', error)
            this.$message.error('Fail to post comment')
          }).finally(() => {
            this.replying = false
          })
        }
      },
      checkAlreadyVoted () {
        let voted = false
        if (this.comment != null && this.comment.active_votes != null) {
          for (let i = 0; i < this.comment.active_votes.length; i++) {
            if (this.comment.active_votes[i].voter === this.$store.state.user.account) {
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
    computed: {
      thumbnail () {
        return process.env.IPFS_SERVER_URL + this.game.coverImage.hash
      },

      votes () {
        return this.comment.active_votes.map(votes => {
          return votes.author
        })
      },

      payout () {
        if (this.comment.total_payout_value === '0.000 SBD') {
          return this.comment.pending_payout_value
        } else {
          return this.comment.total_payout_value
        }
      },

      lateUpdate () {
        return moment(this.comment.last_update.endsWith('Z') ? this.comment.last_update : this.comment.last_update + 'Z').fromNow()
      }
    },
    mounted () {
      console.log('Render comment:', this.comment)
      this.votesCount = this.comment.active_votes ? this.comment.active_votes.length : 0
      if (this.comment) {
        this.comment.replies.reverse()
        this.alreadyVoted = this.checkAlreadyVoted()
      }
    }
  }
</script>
<style lang="scss">
  .avatar-placeholder {
    width: 50px;
  }
  .commentWrapper {
    min-width: 600px;
    & > div {
      display: flex;
    }


    .commentAuthor {
      .author {
        font-weight: bold;
        font-size: 15px;
      }
      .time {
        margin-left: 15px;
      }
    }
    .body {
      margin-top: 10px;
      font-size: 14px;
      text-align: left;
    }

    .metadata {
      margin-top: 5px;
      line-height: 40px;
      .award {
        margin-left: 10px;
      }
      .reply {
        margin-left: 10px;
      }
      .votes:hover {
        cursor: pointer;
      }
    }

    .replyArea {
      margin-top:10px;
      display:block;
      .replyButtons {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-top: 10px;

      }
    }
    .commentReplies {
      display:block;
    }

  }
</style>
