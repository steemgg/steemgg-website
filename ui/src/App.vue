<template>
  <div id="app" class="pageDynamicWidth">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  data: {},
  metaInfo: {
    title: 'steemGG STEEM blockchain HTML5 game publishing distribution platform',
    titleTemplate: '%s ← steemGG STEEM blockchain HTML5 game',
    meta: [
      {
        'http-equiv': 'Content-Type',
        content: 'text/html; charset=utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        name: 'description',
        content: 'SteemGG is STEEM blockchain based HTML5 Game distribution platform, allowing Game Developers to gain monetary rewards directly from Gamers\' upvotes and likes. In return Gamers will receive rewards for actively upvoting games and posting game related contents.'
      }
    ]
  }
}
</script>

<style>


#app {
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  /*width: 350px;*/
  margin-left: auto;
  margin-right: auto;
}

</style>
