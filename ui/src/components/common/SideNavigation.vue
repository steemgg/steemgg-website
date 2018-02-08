<template>
  <div class="sig-side-menu">
    <el-menu default-active="1-1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="false">
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span slot="title">All Games</span>
        </template>
        <el-menu-item index="1-1">
          <i ></i>
          <span slot="title">Action</span>
        </el-menu-item>
        <el-menu-item index="1-2">
          <i ></i>
          <span slot="title">Pixel</span>
        </el-menu-item>
        <el-menu-item index="1-3">
          <i ></i>
          <span slot="title">Music</span>
        </el-menu-item>
        <el-menu-item index="1-4">
          <i></i>
          <span slot="title">Shooting</span>
        </el-menu-item>
        <!--<el-menu-item-group title="Group Two">-->
          <!--<el-menu-item index="1-3">item three</el-menu-item>-->
        <!--</el-menu-item-group>-->
      </el-submenu>
      <el-menu-item index="2">
        <i class="el-icon-location"></i>
        <span slot="title">Navigator Two</span>
      </el-menu-item>
      <el-submenu index="3">
        <template slot="title">
          <i class="el-icon-setting"></i>
          <span slot="title">My Account</span>
        </template>
        <el-menu-item index="3-1">
          <i class=""></i>
          <span slot="title">My Profiles</span>
        </el-menu-item>
        <el-menu-item index="3-2">
          <i class=""></i>
          <span slot="title">My Games</span>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>
<script>
  import ElSubmenu from '../../../node_modules/element-ui/packages/menu/src/submenu'
  export default {
    components: {ElSubmenu},
    name: 'GameGrid',
    data () {
      return {
        isCollapse: true
      }
    },
    computed: {
    },
    mounted () {
      console.log('this is current swiper instance object', this.swiper)
    },
    methods: {
      handleOpen (key, keyPath) {
        console.log(key, keyPath)
      },
      handleClose (key, keyPath) {
        console.log(key, keyPath)
      }
    }
  }
</script>
<style scoped>
  .sig-side-menu {
    margin-top:10px;
  }
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }

  .el-menu--collapse .el-submenu .el-menu {
    z-index: 10000;
  }
</style>
