<template>
  <div>
    <el-row>
      <!--<el-col :xs="8" :sm="8" :md="2" :lg="2" :xl="2">-->
        <!--<avatar :accountName="comment.author"></avatar>-->
      <!--</el-col>-->
      <!--<el-col :xs="16" :sm="16" :md="22" :lg="22" :xl="22">-->
      <el-col :span="2">
        <avatar :accountName="comment.author"></avatar>
      </el-col>
      <el-col :span="22">
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
                <i v-if="!alreadyVoted" class="fa fa-thumbs-o-up" aria-hidden="true" @click="voteUp" v-loading="voting"></i>
                <i v-if="alreadyVoted" class="fa fa-thumbs-up" aria-hidden="true" @click="voteUp"></i>
              </el-tooltip>
              {{votesCount}}
            </span>
            <span class="award">${{payout}}</span>
            <span class="reply">
                <el-button type="text" @click="leaveReply = !leaveReply">Reply</el-button>
            </span>
          </div>
          <div class="replyArea" v-if="leaveReply">
            <el-input ref="replyInput" autofocus placeholder="say something..." v-model="replyContent" :disabled="replying"></el-input>
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

  const gameService = new GameService()
  export default {
    components: {
      Avatar
    },
    props: ['comment'],
    name: 'Comment',
    data () {
      return {
        votesCount: 0,
        alreadyVotes: false,
        leaveReply: false,
        replyContent: '',
        replying: false,
        voting: false
      }
    },
    methods: {
      voteUp () {
        if (this.$store.state.loggedIn) {
          if (this.alreadyVoted === false) {
            if (this.voting === false) {
              this.voting = true
              gameService.vote(this.comment.author, this.comment.permlink, 5000).then(response => {
                this.votesCount++
                this.$message.success('Vote Successfully.')
              }).catch(error => {
                if (error.response.data.resultCode === 402) {
                  this.$message.error('You just voted, please wait for a while.')
                } else {
                  this.$message.error('Vote Failed.')
                }
                console.log('Vote comment failed', error.response)
              })
            }
          } else {
            this.$message({
              message: 'You have already voted this game.',
              type: 'warning'
            })
          }
        } else {
          this.$message.warning('Please log in first to vote.')
        }
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
      }
    },
    computed: {
      thumbnail () {
        return 'http://ipfs.io/ipfs/' + this.game.coverImage.hash
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
      },

      alreadyVoted () {
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
    mounted () {
      console.log('comment', this.comment)
      this.votesCount = this.comment.active_votes ? this.comment.active_votes.length : 0
      if (this.comment) {
        this.comment.replies.reverse()
      }
    }
  }
</script>
<style lang="scss">
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
