<template>
  <div>
    <common-header></common-header>
    <app-game-table :items="items" class="audit-table"></app-game-table>
    <common-footer></common-footer>
  </div>
</template>

<script>
  import GameService from '../../service/game.service'
  import GamesTable from '../shared/GamesTable.vue'
  import CommonHeader from '../common/CommonHeader'
  import CommonFooter from '../common/CommonFooter'

  const gameService = new GameService()
  export default {
    components: {
      CommonFooter,
      CommonHeader,
      AppGameTable: GamesTable
    },
    props: [],
    name: 'GameAudit',
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
<style scoped>
  .audit-table {
    margin: 20px;
    box-shadow: 2px 2px 2px #999999;
    border-top: 1px #999999;
    border-left: 1px #999999;
  }
</style>
