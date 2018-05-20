<template>
  <div class="game-browser-container">
    <common-header></common-header>
      <div class="filters">
        <span class="filter">
          <span class="filterLabel">Catetory: </span>
          <el-select v-model="queryParameter.category" clearable filterable placeholder="Please select a category" @change="updateQueryParameter">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </span>
        <span class="filter">
          <span class="filterLabel">Sort by: </span>
          <el-select v-model="queryParameter.sort" filterable placeholder="Sort by" @change="updateQueryParameter">
            <el-option
              v-for="item in sortBy"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </span>
      </div>
      <div class="common-content" infinite-scroll-immediate-check="false" v-infinite-scroll="loadMore" infinite-scroll-disabled="infiniteScrollDisabled" infinite-scroll-distance="10">
        <div class="game-list-container">
          <game-grid v-for="game in items" :game="game" :key="game.id"></game-grid>
        </div>
      </div>
    <common-footer></common-footer>
  </div>
</template>

<script>
  import GameService from '../../service/game.service'
  import { GAME_CATEGORY } from '../../service/const'
  import CommonFooter from '../common/CommonFooter'
  import CommonHeader from '../common/CommonHeader'
  import GameGrid from '../shared/GameGrid.vue'

  import { Select } from 'element-ui'
  const gameService = new GameService()

  export default {
    components: {
      CommonFooter,
      CommonHeader,
      Select,
      GameGrid
    },
    name: 'GameBrowser',
    props: {
      'type': {
        default: 'index',
        type: String
      },
      'category': {
        default: null,
        type: String
      },
      'sort': {
        default: 'created_desc',
        type: String
      }
    },
    data () {
      return {
        categories: GAME_CATEGORY,
        sortBy: [
          {
            label: 'Latest',
            value: 'created_desc'
          },
          {
            label: 'Top Voted',
            value: 'voted_desc'
          },
          {
            label: 'Top Payout',
            value: 'payout_desc'
          }
        ],
        items: [],
        queryParameter: {
          category: this.category,
          sort: this.sort,
          type: this.type,
          offset: 0,
          limit: 20
        },
        loadingMore: false,
        hasMore: true,
        totalCount: 0
      }
    },
    computed: {
      infiniteScrollDisabled () {
        return this.loadingMore || !this.hasMore
      }
    },
    methods: {
      updateQueryParameter () {
        this.items = []
        this.hasMore = true
        this.queryParameter.offset = 0
        this.loadData()
      },
      loadMore () {
        console.log('load more data')
        if (this.hasMore && this.totalCount > this.queryParameter.offset) {
          this.queryParameter.offset += 20
          this.loadData()
        }
      },
      loadData () {
        console.log('load data with queryParameter', this.queryParameter)
        gameService.query(this.queryParameter).then(result => {
          this.items = this.items.concat(result.items)
          this.totalCount = result.totalCount
          if (result.next == null || result.next === '') {
            this.hasMore = false
          } else {
            this.hasMore = true
          }
        }).catch(error => {
          console.log(error.response)
          this.$message.error('Fail to load game data, please try again later')
        })
      }
    },
    mounted () {
      this.loadData()
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .game-list-container {
    display: flex;
    flex-wrap: wrap;
  }
  .filters {
    display: flex;
    border-bottom: 5px solid darkseagreen;
    padding-bottom: 10px;
    padding-top: 10px;
    /*flex-direction:row-reverse;*/
    padding-right: 20px;
    .filter {
      margin: 0 10px;
      .filterLabel {
        font-size: 16px;
      }
    }
  }

</style>
