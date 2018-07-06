<template>
  <div id="app" class="pageDynamicWidth">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>


#app {
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  /*width: 350px;*/
  margin-left: auto;
  margin-right: auto;
}

</style>
