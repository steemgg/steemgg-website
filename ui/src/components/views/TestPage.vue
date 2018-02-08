<template>
  <div>
    <div>Game Id: <input v-model="gameid"/></div>
    <div>Perm Link: <input v-model="permLink"/></div>
  </div>
</template>

<script>
  import { GameService, getContentAsyn }  from '../../service/game.service'
  const gameService = new GameService()

  import getContentAsyn from '../'
  export default {
    components: {
    },
    props: ['id', 'mode'],
    name: 'GameEditForm',
    data () {
      return {
        gameid: null,
        permLink: null,
      }
    },
    methods: {
      getContent () {
        getContentAsyn()
      }
    },
    mounted () {
      console.log('mounted')
    }
  }
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
  .game-resource-upload {
  }
  .editFormContainer {
    display: flex;
    justify-content: center;
    .gameEditForm {
      display: flex;
      justify-content: center;
      width: 600px;
      border: 1px solid gray;
      box-shadow: 2px 2px 2px #999999;
      border-radius: 3px;
      padding: 20px;
    }
  }
  .dropzone {
    padding: 0;
    .dz-preview {
      margin: 0;
    }
    .dz-error-message {
      display: none;
    }
  }

  .dropzone .dz-preview.dz-error .dz-error-message {
    display: none;
  }
</style>
