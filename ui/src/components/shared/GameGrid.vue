<template>
  <div class="game-grid-container">
    <div class="game-grid-image" >
      <div class="game-info-view view-ninth" @click="gotoGame">
        <img :src="thumbnail" class="game-cover-image"/>
        <div class="mask mask-1"></div>
        <div class="mask mask-2"></div>
        <div class="content">
          <h2>{{game.title}}</h2>
          <!--hide the description for now-->
          <!--<div class="description">{{game.description}}</div>-->
          <p class="author"> Author : {{game.account}}</p>
        </div>

        <span class="gameMetadata">
          <span class="vote">
            <i class="fa fa-thumbs-o-up" aria-hidden="true" ></i>
            <span class="vote-number">{{game.vote}}</span>
          </span>

          <span class="payout">
            <i class="fa fa-usd" aria-hidden="true"></i>
            <span class="payout-amount">{{game.payout.toFixed(3)}}</span>
          </span>
        </span>


        <router-link v-if="mode != 'edit'" :to="{ name: 'viewGame', params: { id: game.id }}" tag="a" class="play">→</router-link>
        <router-link v-if="mode == 'edit'" :to="{ name: 'editGame', params: { id: game.id }}" tag="a" class="play">→</router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  const PUBLIC_IPFS_SERVER_URL = 'https://ipfs.io/ipfs/'
  export default {
    components: {
    },
    props: ['game', 'mode'],
    name: 'GameGrid',
    data () {
      return {
      }
    },
    methods: {
      gotoGame () {
        this.$router.push({name: 'viewGame', params: { id: this.game.id }})
      }
    },
    computed: {
      thumbnail () {
        // if the game is modified in the last 12 hours, use our own ipfs server
        // else, use the public IPFS server
        let gap = moment().diff(moment(this.game.lastModified), 'hours')
        if (gap > 12) {
          return PUBLIC_IPFS_SERVER_URL + this.game.coverImage.hash
        } else {
          return process.env.IPFS_SERVER_URL + this.game.coverImage.hash
        }
      }
    },
    mounted () {
    }
  }
</script>

<style lang="scss" scoped>

  .game-info-view {
    width: 300px;
    height: 200px;
    margin: 5px;
    float: left;
    border: 5px solid #fff;
    overflow: hidden;
    position: relative;
    text-align: center;
    -webkit-box-shadow: 2px 2px 4px #e6e6e6;
    -moz-box-shadow: 2px 2px 4px #e6e6e6;
    box-shadow: 2px 2px 4px #e6e6e6;
    cursor: default;
    word-break: break-all;

    .mask, .content {
      width: 300px;
      height: 200px;
      position: absolute;
      overflow: hidden;
      top: 0;
      left: 0;
    }
    .content {
      .description {
        -ms-text-overflow: ellipsis;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    img {
      display: block;
      position: relative;
      width: 300px;
      height: 200px;
    }

    .gameMetadata {
      position: absolute;
      bottom: 10px;
      left: 20px;
      font-size: 1.4em;
      color: orange;
      font-weight: bold;
      i {
        color: white;
      }
    }
    h2 {
      text-transform: uppercase;
      color: #fff;
      text-align: center;
      position: relative;
      font-size: 17px;
      padding: 10px 25px 10px 10px;
      background: rgba(0, 0, 0, 0.8);
      margin: 20px 0 0 0;
    }
    .author, .description {
      font-family: Georgia, serif;
      font-style: italic;
      font-size: 12px;
      position: relative;
      color: #fff;
      padding: 10px 20px 20px;
      text-align: center;
    }
    a.info {
      display: inline-block;
      text-decoration: none;
      padding: 7px 14px;
      background: #000;
      color: #fff;
      text-transform: uppercase;
      -webkit-box-shadow: 0 0 1px #000;
      -moz-box-shadow: 0 0 1px #000;
      box-shadow: 0 0 1px #000;
    }
    a.info:hover {
      -webkit-box-shadow: 0 0 5px #000;
      -moz-box-shadow: 0 0 5px #000;
      box-shadow: 0 0 5px #000;
    }
  }

  .play {
    display: block;
    font-size: 18px;
    color: rgba(255,255,255,0.8);
    position: absolute;
    right: 5px;
    bottom: 5px;
    border: 2px solid rgba(255,255,255,0.8);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    line-height: 26px;
    text-align: center;
    font-weight: 700;
    z-index: 10000;
  }

  .view-ninth .mask-1, .view-ninth .mask-2 {
    background-color: rgba(0, 0, 0, 0.5);
    height: 361px;
    width: 361px;
    background: rgba(119, 0, 36, 0.5);
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)";
    filter: alpha(opacity=100);
    opacity: 1;
    -webkit-transition: all 0.3s ease-in-out 0.6s;
    -moz-transition: all 0.3s ease-in-out 0.6s;
    -o-transition: all 0.3s ease-in-out 0.6s;
    transition: all 0.3s ease-in-out 0.6s;
  }
  .view-ninth .mask-1 {
    left: auto;
    right: 0;
    -webkit-transform: rotate(56.5deg) translateX(-180px);
    -moz-transform: rotate(56.5deg) translateX(-180px);
    -o-transform: rotate(56.5deg) translateX(-180px);
    -ms-transform: rotate(56.5deg) translateX(-180px);
    transform: rotate(56.5deg) translateX(-180px);
    -webkit-transform-origin: 100% 0%;
    -moz-transform-origin: 100% 0%;
    -o-transform-origin: 100% 0%;
    -ms-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
  }
  .view-ninth .mask-2 {
    top: auto;
    bottom: 0;
    -webkit-transform: rotate(56.5deg) translateX(180px);
    -moz-transform: rotate(56.5deg) translateX(180px);
    -o-transform: rotate(56.5deg) translateX(180px);
    -ms-transform: rotate(56.5deg) translateX(180px);
    transform: rotate(56.5deg) translateX(180px);
    -webkit-transform-origin: 0% 100%;
    -moz-transform-origin: 0% 100%;
    -o-transform-origin: 0% 100%;
    -ms-transform-origin: 0% 100%;
    transform-origin: 0% 100%;
  }
  .view-ninth .content {
    background: rgba(0, 0, 0, 0.9);
    height: 0;
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";
    filter: alpha(opacity=50);
    opacity: 0.5;
    width: 361px;
    overflow: hidden;
    -webkit-transform: rotate(-33.5deg) translate(-112px, 166px);
    -moz-transform: rotate(-33.5deg) translate(-112px, 166px);
    -o-transform: rotate(-33.5deg) translate(-112px, 166px);
    -ms-transform: rotate(-33.5deg) translate(-112px, 166px);
    transform: rotate(-33.5deg) translate(-112px, 166px);
    -webkit-transform-origin: 0% 100%;
    -moz-transform-origin: 0% 100%;
    -o-transform-origin: 0% 100%;
    -ms-transform-origin: 0% 100%;
    transform-origin: 0% 100%;
    -webkit-transition: all 0.4s ease-in-out 0.3s;
    -moz-transition: all 0.4s ease-in-out 0.3s;
    -o-transition: all 0.4s ease-in-out 0.3s;
    transition: all 0.4s ease-in-out 0.3s;
  }
  .view-ninth h2 {
    background: transparent;
    margin-top: 5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  .view-ninth a.info {
    display: none;

  }
  .view-ninth:hover .content {
    height: 120px;
    width: 300px;
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=90)";
    filter: alpha(opacity=90);
    opacity: 0.9;
    top: 20px;
    -webkit-transform: rotate(0deg) translate(0, 0);
    -moz-transform: rotate(0deg) translate(0, 0);
    -o-transform: rotate(0deg) translate(0, 0);
    -ms-transform: rotate(0deg) translate(0, 0);
    transform: rotate(0deg) translate(0, 0);
  }
  .view-ninth:hover .mask-1, .view-ninth:hover .mask-2 {
    -webkit-transition-delay: 0s;
    -moz-transition-delay: 0s;
    -o-transition-delay: 0s;
    transition-delay: 0s;
  }
  .view-ninth:hover .mask-1 {
    -webkit-transform: rotate(56.5deg) translateX(1px);
    -moz-transform: rotate(56.5deg) translateX(1px);
    -o-transform: rotate(56.5deg) translateX(1px);
    -ms-transform: rotate(56.5deg) translateX(1px);
    transform: rotate(56.5deg) translateX(1px);
  }
  .view-ninth:hover .mask-2 {
    -webkit-transform: rotate(56.5deg) translateX(-1px);
    -moz-transform: rotate(56.5deg) translateX(-1px);
    -o-transform: rotate(56.5deg) translateX(-1px);
    -ms-transform: rotate(56.5deg) translateX(-1px);
    transform: rotate(56.5deg) translateX(-1px);
  }

</style>
