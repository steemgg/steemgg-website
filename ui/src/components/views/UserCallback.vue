<template>
  <div class="redirect">
    login successfully, will redirect to home page soon. if not, click <a >here</a>
  </div>
</template>
<script>
  import axios from 'axios'
  export default {
    components: {
    },
    name: 'HomePage',
    data () {
      return {
      }
    },
    mounted () {
      axios.get('v1/me').then(use => {
          this.$store.
      })
    }
  }
</script>
<style>

</style>
