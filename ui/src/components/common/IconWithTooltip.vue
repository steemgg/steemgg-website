<template>
  <div>
    <el-tooltip class="item" effect="dark" :content="tooltip" placement="top-start">
      <i v-if="this.lastPost == null" :class="iconClass" style="color: red"></i>
    </el-tooltip>
  </div>
</template>
<script>
  export default {
    components: {
    },
    props: ['tooltip', 'placement', 'type'],
    name: 'Avatar',
    data () {
      return {
      }
    },
    computed: {
      iconClass () {
        return 'el-icon-' + this.type
      }
    },
    mounted () {
      if (this.placement == null) {
        this.placement = 'top'
      }
      if (this.type == null) {
        this.type = 'info'
      }
    }
  }
</script>
<style>
  .avatar {
    vertical-align: top;
    display: inline-block;
    height: 36px;
    width: 36px;
    cursor: pointer;
    background-size: cover;
    backgroud-repeat: no-repeat;
    backgroud-position: 50% 50%;
    border-radius: 50%;
  }
</style>
