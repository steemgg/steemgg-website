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
    props: ['queryParameter', 'items'],
    name: 'GameList',
    data () {
      return {
      }
    },
    computed: {
    },
    methods: {
      updateList () {
        if (this.queryParameter != null && (this.queryParameter.category || this.queryParameter.sortBy)) {
          gameService.query(this.queryParameter).then(result => {
            console.log(result)
            this.items = result.items
            console.log('get the game item query result with', this.items, this.queryParameter)
          })
        } else {
          gameService.list().then(result => {
            console.log(result)
            this.items = result.items
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
