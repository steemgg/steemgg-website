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
            <el-select v-model="queryParameter.category" placeholder="Please select a category" @change="updateQueryParameter">
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </span>
          <!--<span class="filter">-->
            <!--<el-select v-model="queryParameter.sortBy" placeholder="Sort by" @change="updateQueryParameter">-->
              <!--<el-option-->
                <!--v-for="item in sortBy"-->
                <!--:key="item.value"-->
                <!--:label="item.label"-->
                <!--:value="item.value">-->
              <!--</el-option>-->
            <!--</el-select>-->
          <!--</span>-->
        </div>
        <hr/>
        <game-list :queryParameter="queryParameter"></game-list>
      </el-main>
    </el-container>
    <el-footer> <common-footer></common-footer></el-footer>
  </el-container>
</template>

<script>
  import ElHeader from '../../../node_modules/element-ui/packages/header/src/main'
  import ElFooter from '../../../node_modules/element-ui/packages/footer/src/main'
  import ElContainer from '../../../node_modules/element-ui/packages/container/src/main'
  import ElMain from '../../../node_modules/element-ui/packages/main'
  import GameSlider from '../common/GameSlider'
  import CommonFooter from '../common/CommonFooter'
  import CommonHeader from '../common/CommonHeader'
  import GameList from '../shared/GameList'
  import SiteNavigation from '../common/SideNavigation'
  import ElOption from '../../../node_modules/element-ui/packages/select/src/option'

  import { Select } from 'element-ui'
  export default {
    components: {
      ElOption,
      Select,
      GameList,
      GameSlider,
      ElContainer,
      ElFooter,
      ElHeader,
      ElMain,
      CommonFooter,
      CommonHeader,
      SiteNavigation
    },
    name: 'GameBrowser',
    props: ['query'],
    data () {
      return {
        categories: [{
          value: 'Pixel Art',
          label: 'Pixel Art'
        }, {
          value: 'Action',
          label: 'Action'
        }, {
          value: 'Music',
          label: 'Music'
        }, {
          value: 'Shooting',
          label: 'Shooting'
        }],
        sortBy: [{
          value: 'rating',
          label: 'Rating'
        }, {
          value: 'lastModified',
          label: 'Last Modified'
        }],
        queryParameter: {
          category: null,
          sortBy: null
        }
      }
    },
    methods: {
      updateQueryParameter () {
        this.queryParameter = this.queryParameter.clone
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
