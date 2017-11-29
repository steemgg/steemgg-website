<template>
  <el-container>
    <el-header>this is the header</el-header>
    <el-main>
      <div class="editTitle">
        <h1>Create a new game</h1>
      </div>
      <div class="editFormContainer">
        <div class='gameEditForm'>
          <el-form ref='game' :model='game' label-width='120px'>
            <el-form-item label='Game name'>
              <el-input v-model='game.name'></el-input>
            </el-form-item>
            <el-form-item label='Game description'>
              <el-input v-model='game.description' type="textarea" :rows="2" placeholder="Please input description of your game"></el-input>
            </el-form-item>
            <el-form-item label='Thumbnail'>
              <el-upload
                class="game-resource-upload"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="game.image"
                :limit="1"
                list-type="picture">
                <el-button size="small" type="primary">Click to upload</el-button>
                <div slot="tip" class="el-upload__tip">jpg/png files with a size less than 500kb</div>
              </el-upload>
            </el-form-item>
            <el-form-item label='Play in browser?'>
              <el-switch v-model='game.inbrowser'></el-switch>
            </el-form-item>
            <el-form-item label='Tag'>
              <input-tag :on-change='onTagChange' :tags='game.tags'></input-tag>
            </el-form-item>
            <el-form-item label='Game type'>
              <el-checkbox-group v-model='game.type'>
                <el-checkbox label='Pixel Art' name='type'></el-checkbox>
                <el-checkbox label='Action' name='type'></el-checkbox>
                <el-checkbox label='Music' name='type'></el-checkbox>
                <el-checkbox label='Shooter' name='type'></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label='Access'>
              <el-radio-group v-model='game.access'>
                <el-radio label='Private'></el-radio>
                <el-radio label='Public'></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Game File">
              <el-upload
                class="game-resource-upload"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="game.fileList"
                :limit="1"
                list-type="text">
                <el-button size="small" type="primary">Click to upload</el-button>
                <div slot="tip" class="el-upload__tip">game files with a size less than 500kb</div>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type='primary' @click='onSubmit'>Create</el-button>
              <el-button>Cancel</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-main>
    <el-footer> <common-footer></common-footer></el-footer>
  </el-container>
</template>

<script>
  import InputTag from 'vue-input-tag'
  import CommonFooter from '../common/CommonFooter'
  import { FormItem, Checkbox,
    CheckboxGroup,
    Form,
    Col,
    Switch,
    Button,
    Radio,
    Input,
    Container,
    Footer,
    Header,
    Main,
    Select,
    Upload,
    RadioGroup
  } from 'element-ui'
  import ElForm from '../../../node_modules/element-ui/packages/form/src/form'

  export default {
    components: {
      ElForm,
      FormItem,
      Checkbox,
      CheckboxGroup,
      Form,
      Col,
      Switch,
      Button,
      Radio,
      Input,
      Container,
      Footer,
      Header,
      InputTag,
      Select,
      CommonFooter,
      Main,
      Upload,
      RadioGroup
    },
    name: 'GameEditForm',
    data () {
      return {
        game: {
          name: '',
          description: '',
          image: [],
          inbrowser: '',
          tags: ['abc', 'eef'],
          delivery: false,
          type: [],
          access: '',
          fileList: []
        }
      }
    },
    methods: {
      onSubmit () {
        console.log('submit!')
        console.log()
      },
      onTagChange () {
        console.log('tag changed')
      },
      handleRemove (file, fileList) {
        console.log(file, fileList)
      },
      handlePreview (file) {
        console.log(file)
      }
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
</style>
