<template>
  <div class="avatar" :style="'background-image: url(https://steemitimages.com/u/' + this.accountName + '/avatar'"></div>
</template>
<script>
  export default {
    components: {
    },
    props: ['accountName'],
    name: 'Avatar',
    data () {
      return {
      }
    },
    computed: {
    },
    mounted () {
    }
  }
</script>
<style>
  .avatar {
    vertical-align: top;
    display: inline-block;
    margin-right: 25px;
    height: 36px;
    width: 36px;
    cursor: pointer;
    background-size: cover;
    backgroud-repeat: no-repeat;
    backgroud-position: 50% 50%;
    border-radius: 50%;
  }
</style>
