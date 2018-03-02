<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-container>
      <el-aside style="width: auto; background-color: rgb(238, 241, 246)">
        <site-navigation></site-navigation>
      </el-aside>
      <el-main>
        <div>
          <span class="filter">
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
        <div class="allGames">
          <game-list :queryParameter="gameListQuery"></game-list>
        </div>
        <hr/>
      </el-main>
    </el-container>
    <el-footer> <common-footer></common-footer></el-footer>
  </el-container>
</template>

<script>
//  import ElHeader from '../../../node_modules/element-ui/packages/header/src/main'
//  import ElFooter from '../../../node_modules/element-ui/packages/footer/src/main'
//  import ElContainer from '../../../node_modules/element-ui/packages/container/src/main'
//  import ElMain from '../../../node_modules/element-ui/packages/main'
//  import ElOption from '../../../node_modules/element-ui/packages/select/src/option'
  import GameSlider from '../common/GameSlider'
  import CommonFooter from '../common/CommonFooter'
  import CommonHeader from '../common/CommonHeader'
  import GameList from '../shared/GameList'
  import SiteNavigation from '../common/SideNavigation'
  import { GAME_CATEGORY } from '../../service/const'

  import { Select } from 'element-ui'
  export default {
    components: {
//      ElOption,
//      ElContainer,
//      ElFooter,
//      ElHeader,
//      ElMain,
      Select,
      GameList,
      GameSlider,
      CommonFooter,
      CommonHeader,
      SiteNavigation
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
        queryParameter: {
          category: this.category,
          sort: this.sort,
          type: this.type
        }
      }
    },
    computed: {
      gameListQuery () {
        let query = Object.assign({}, this.queryParameter)
        if (query.category == null) {
          delete query.category
        }
        return query
      }
    },
    methods: {
      updateQueryParameter () {
        this.queryParameter = Object.assign({}, this.queryParameter)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
