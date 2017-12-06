<template>
  <el-container>
    <el-header>this is the header</el-header>
    <el-main>
      <div class="editTitle">
        <h1>Create a new game</h1>
      </div>
      <div class="editFormContainer">
        <div class='gameEditForm'>
          <el-form ref='game' :model='game' label-width='150px'>
            <el-form-item label='Game Title'>
              <el-input v-model='game.title'></el-input>
            </el-form-item>
            <el-form-item label='Game Description'>
              <el-input v-model='game.description' type="textarea" :rows="2" placeholder="Please input description of your game"></el-input>
            </el-form-item>
            <el-form-item label='Cover Image'>
              <vue-dropzone ref="myVueDropzone" id="dropzone" :options="dropzoneOptions"></vue-dropzone>
              <div slot="tip" class="el-upload__tip">jpg/png files with a size less than 500kb</div>
            </el-form-item>
            <el-form-item label='Play in browser?'>
              <el-switch v-model='game.inbrowser'></el-switch>
            </el-form-item>
            <el-form-item label='Tags'>
              <input-tag :on-change='onTagChange' :tags='game.tags'></input-tag>
            </el-form-item>
            <el-form-item label='Game Type'>
              <el-checkbox-group v-model='game.type'>
                <el-checkbox label='Pixel Art' name='type'></el-checkbox>
                <el-checkbox label='Action' name='type'></el-checkbox>
                <el-checkbox label='Music' name='type'></el-checkbox>
                <el-checkbox label='Shooter' name='type'></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="File">
              <el-upload
                class="game-resource-upload"
                action="/api/upload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="game.fileList"
                :on-success="handleUploadSuccess"
                :limit="1"
                list-type="text">
                <el-button size="small" type="primary">Click to upload</el-button>
                <div slot="tip" class="el-upload__tip">game files with a size less than 500kb</div>
              </el-upload>
            </el-form-item>
            <el-form-item label='Activity Title'>
              <el-input v-model='game.activityTitle'></el-input>
            </el-form-item>
            <el-form-item label='Activity Description'>
              <el-input v-model='game.activityDesc' type="textarea" :rows="2" placeholder="This will be posted to steemit, game description will be used if empty"></el-input>
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
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.css'

  export default {
    components: {
      Checkbox,
      CheckboxGroup,
      Form,
      FormItem,
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
      RadioGroup,
      vueDropzone: vue2Dropzone
    },
    name: 'GameEditForm',
    data () {
      return {
        game: {
          title: '',
          description: '',
          activityTitle: '',
          activityDesc: '',
          image: [],
          inbrowser: '',
          tags: ['abc', 'eef'],
          delivery: false,
          type: [],
          fileList: []
        },
        dropzoneOptions: {
          url: '/api/upload',
          maxFilesize: 0.5,
          thumbnailWidth: 330,
          addRemoveLinks: true,
          dictDefaultMessage: "<i class='fa fa-cloud-upload'></i>UPLOAD Cover Image"
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
      },
      handleUploadSuccess (response, file, fileList) {
        console.log(response)
        console.log(file)
        console.log(fileList)
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
  .dropzone {
    padding: 0;
    .dz-preview {
      margin: 0;
    }
  }
</style>
