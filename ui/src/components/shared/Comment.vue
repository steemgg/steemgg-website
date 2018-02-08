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
              <i class="fa fa-thumbs-o-up" aria-hidden="true" :disabled="!canVote()" @click="voteUp()"></i> {{votesCount}}
            </span>
            <span class="award">${{payout}}</span>
            <span class="reply">
                <el-button type="text" @click="leaveReply = !leaveReply">Reply</el-button>
            </span>
          </div>
          <div class="replyArea" v-if="leaveReply">
            <el-input placeholder="say something..." v-model="replyContent"></el-input>
            <div class="replyButtons">
              <el-button round @click="leaveReply = false;">Cancel</el-button>
              <el-button round @click="postReply">Reply</el-button>
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
    props: ['comment', 'author'],
    name: 'Comment',
    data () {
      return {
        votesCount: 0,
        alreadyVotes: false,
        leaveReply: false,
        replyContent: ''
      }
    },
    methods: {
      voteUp () {
        if (this.canVote()) {
//          gameService.vote(this.author, this.comment.permlink)/**/
          // assume it vote successfully
          this.votesCount++
          this.$message('vote!')
        }
      },

      canVote () {
        return true
      },
      postReply () {
        if (this.replyContent == null || this.replyContent.trim().length === 0) {
        } else {
          alert(this.replyContent)
          gameService.postComment(this.comment.author, this.comment.permlink, this.replyContent)
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
        return moment(this.comment.last_update).fromNow()
      }
    },
    mounted () {
      this.votesCount = this.comment.active_votes ? this.comment.active_votes.length : 0
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
