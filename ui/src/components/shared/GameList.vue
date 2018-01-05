<template>
  <div>
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
    props: [],
    name: 'GameList',
    data () {
      return {
        items: null
      }
    },
    computed: {
    },
    mounted () {
      gameService.list().then(result => {
        console.log(result)
        this.items = result.items
        console.log('get the game item list', this.items)
      })
    }
  }
</script>
