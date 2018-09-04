<template>
  <div class="game-list-container">
    <app-game-grid v-for="game in items" :game="game" :key="game.id"></app-game-grid>
  </div>
</template>

<script>
  import GameService from '../../service/game.service'
  import GameGrid from './GameGrid.vue'

  const gameService = new GameService()
  export default {
    components: {
      appGameGrid: GameGrid
    },
    props: ['queryParameter', 'limit'],
    name: 'GameList',
    data () {
      return {
        items: null
      }
    },
    computed: {
    },
    methods: {
      updateList () {
        if (this.queryParameter != null) {
          gameService.query(this.queryParameter).then(result => {
            console.log(result)
            this.items = result.items.slice(this.limit)
            console.log('get the game item query result with', this.items, this.queryParameter)
          })
        } else {
          gameService.query({status: 1}).then(result => {
            console.log(result)
            this.items = result.items.slice(this.limit)
            console.log('get the game item list', this.items)
          })
        }
      }
    },
    watch: {
      'queryParameter': function (val, oldVal) {
        this.updateList()
      }
    },
    mounted () {
      if (this.items == null) {
        this.updateList()
      }
    }
  }
</script>
<style>
  .game-list-container {
    display: flex;
    flex-wrap: wrap;
  }
</style>
