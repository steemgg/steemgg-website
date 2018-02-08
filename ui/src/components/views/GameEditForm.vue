<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-main>
      <div class="editFormContainer">
        <div class='gameEditForm'>
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Game Information" name="gameInfo">
              <div>
                <el-form ref='game' :rules='rules' :model='game' label-width='150px'>
                  <el-form-item label='Game Title' prop="title">
                    <el-input v-model='game.title'></el-input>
                  </el-form-item>
                  <el-form-item label='Game Description' prop="description">
                    <!--<el-input v-model='game.description' type="textarea" :rows="2" placeholder="Please input description of your game"></el-input>-->
                    <mavon-editor language="en" :subfield="false" v-model='game.description'></mavon-editor>
                  </el-form-item>
                  <el-form-item label='Cover Image' prop="coverImage">
                    <vue-dropzone ref="coverImageDropzone" @vdropzone-success="onImageUploaded" @vdropzone-removed-file="onImageRemoved" @vdropzone-error="onImageUploadFail" id="dropzone" :options="dropzoneOptions"></vue-dropzone>
                    <div slot="tip" class="el-upload__tip">jpg/png files with a size less than 500kb</div>
                  </el-form-item>
                  <el-form-item label='Game Type' prop="category">
                    <el-select v-model="game.category" filterable placeholder="Select">
                      <el-option v-for="item in gameTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="File" prop="gameUrl">
                    <div class="game-resource-upload-wrapper">
                      <el-upload
                        class="game-resource-upload"
                        action="/v1/upload"
                        :on-remove="onFileRemoved"
                        :file-list="fileList"
                        :limit="1"
                        accept="application/zip"
                        :on-success="onFileUploaded"
                        :before-upload="beforeFileUpload"
                        :on-exceed="onFileExceedMax"
                        :on-error="onFileUploadFail"
                        list-type="text">
                        <el-button size="small" type="primary">Click to upload</el-button>
                        <div slot="tip" class="el-upload__tip">Only accept zip file, max file size 10MB</div>
                      </el-upload>
                    </div>
                  </el-form-item>
                    <el-button type='primary' @click="submitForm('game')">{{ actionText }}</el-button>
                    <el-button @click="cancelForm()">Cancel</el-button>
                </el-form>
              </div>
            </el-collapse-item>
            <el-collapse-item v-if="game && game.activities && game.activities.length > 0" title="Game Posts" name="existingPosts">
              <div class="activityList" >
                <div class="activityHeader">
                  <span class="linkTitle">Perm Link</span>
                  <span class="creationDateTitle">Creation Date</span>
                </div>
                <div v-for="activity in game.activities" class="activityInfo">
                  <span class="activityLink">
                    <a :href="'https://steemit.com/@' + activity.account + '/' + activity.permlink" target="_blank">{{activity.account + "/" + activity.permlink}}</a>
                  </span>
                  <span class="postCreationDate">{{getLastModifiedString(activity.lastModified)}}</span>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="New Post for game" name="newPost">
              <div>
                <h3> Create Post in Steemit</h3>
                <el-form ref='activity' :rules='activityRules' :model='activity' label-width='150px'>
                  <el-form-item label='Post Content' >
                    <el-switch
                               v-model="useGameInfoAsPost"
                               active-text="Use Game Info"
                               inactive-text="Customize">
                    </el-switch>
                  </el-form-item>
                  <a :href="game.permLink" v-if="game.permLink">Open Steemit Post</a>
                  <el-form-item label='Activity Title' prop="activityTitle" v-if="!useGameInfoAsPost">
                    <el-input :disabled="useGameInfoAsPost" v-model='activity.activityTitle'></el-input>
                  </el-form-item>
                  <el-form-item label='Activity Description' prop="activityDesc" v-if="!useGameInfoAsPost">
                    <el-input :disabled="useGameInfoAsPost" v-model='activity.activityDesc' type="textarea" :rows="2" placeholder="This will be posted to steemit, game description will be used if empty"></el-input>
                  </el-form-item>
                  <el-form-item label='Tags'>
                    <input-tag :on-change='onTagChange' :tags='activity.tags'></input-tag>
                  </el-form-item>
                  <el-form-item label="reward">
                    <el-slider v-model="activity.reward"></el-slider>
                  </el-form-item>
                  <el-form-item>
                    <!--<el-button type='primary' v-if="activity.permLink != null" @click="submitActivity(false)">Update</el-button>-->
                    <el-button type='primary' :disabled="game.id == null && postingInProgress" @click="submitActivity(true)">New Post</el-button>
                    <!--<el-button @click="cancelForm()">Cancel</el-button>-->
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-main>
    <el-footer> <common-footer></common-footer></el-footer>
  </el-container>
</template>

<script>
  import InputTag from 'vue-input-tag'
  import moment from 'moment'
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
    RadioGroup,
    Slider
  } from 'element-ui'
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.css'
  import CommonHeader from '../common/CommonHeader'
  import GameService from '../../service/game.service'
  import ElFormItem from '../../../node_modules/element-ui/packages/form/src/form-item'
  import ElCollapseItem from '../../../node_modules/element-ui/packages/collapse/src/collapse-item'

  import { GAME_CATEGORY } from '../../service/const'
  const gameService = new GameService()

  export default {
    components: {
      ElCollapseItem,
      ElFormItem,
      CommonHeader,
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
      Slider,
      vueDropzone: vue2Dropzone
    },
    props: ['id', 'mode'],
    name: 'GameEditForm',
    data () {
      return {
        activeNames: ['gameInfo'],
        postingInProgress: false,
        gameActionInProgress: false,
        errorMessage: '',
        useGameInfoAsPost: true,
        game: {
          title: '',
          description: '',
          coverImage: null,
          category: '',
          activities: [],
          gameUrl: null,
          lastModified: null,
          account: null
        },
        activity: {
          activityTitle: '',
          activityDescription: '',
          reward: 100,
          tags: ['abc', 'eef']
        },
        fileList: [],
        rules: {
          title: [
            { required: true, message: 'Please input the game title', trigger: 'blur' },
            { min: 5, max: 255, message: 'Title should between 5 - 255 characters', trigger: 'blur' }
          ],
          description: [
            { required: true, message: 'Please input game description', trigger: 'blur' },
            { max: 3000, message: 'Description max 3000 characters', trigger: 'blur' }
          ],
          category: [
            { required: true, message: 'Please select game type', trigger: 'change' }
          ],
          coverImage: [
            { type: 'object', required: true, message: 'Please upload game image', trigger: 'change' }
          ],
          gameUrl: [
            { type: 'object', required: true, message: 'Please upload game file', trigger: 'change' }
          ]
        },
        activityRules: {
          activityTitle: [
            { min: 5, max: 255, message: 'Title should between 5 - 255 characters', trigger: 'blur' },
            { required: true, message: 'Please input the post title', trigger: 'blur' }
          ],
          activityDesc: [
            { max: 3000, message: 'Description max 3000 characters', trigger: 'blur' },
            { required: true, message: 'Please input the post body', trigger: 'blur' }
          ]
        },
        dropzoneOptions: {
          url: '/v1/upload',
          maxFilesize: 4,
          maxFiles: 1,
          thumbnailWidth: 330,
          addRemoveLinks: true,
          acceptedFiles: 'image/*',
          dictDefaultMessage: "<i class='fa fa-cloud-upload'></i>UPLOAD Cover Image"
        },
        gameTypeOptions: GAME_CATEGORY
      }
    },
    watch: {
      // call again the method if the route changes
      '$route': 'initData'
    },
    methods: {
      submitForm () {
        console.log(this.game)
        this.$refs['game'].validate((valid) => {
          if (valid) {
            console.log('submit')
            console.log(this.game)
            if (this.game.id == null) {
              this.gameActionInProgress = true
              gameService.create(this.game).then((game) => {
                // pop up success message
                this.game.id = game.id
                this.gameActionInProgress = false
                  this.$alert('Congratulations! Your game has been created', 'Game Created', {
                  confirmButtonText: '确定',
                  callback: action => {
                    // go to my game list view
                  }
                })
              }).catch(error => {
                console.log(error)
                this.gameActionInProgress = false
                this.$alert('Oops! Something went wrong. Your game cannot be created right now.', 'Game Creation Fail', {
                  confirmButtonText: 'Got it',
                  callback: action => {
                    // go to my game list view
                  }
                })
                this.errorMessage = error.data
              })
            } else {
              this.gameActionInProgress = true
              gameService.update(this.game).then(() => {
                console.log('game updated successfully.')
                this.gameActionInProgress = false
                this.$message.success('Game updated successfully')
              }).catch(error => {
                this.gameActionInProgress = false
                this.$alert('Oops! Something went wrong. Your game cannot be updated right now.', 'Game Creation Fail', {
                  confirmButtonText: 'Got it',
                  callback: action => {
                    // go to my game list view
                  }
                })
                this.errorMessage = error.data
              })
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      getLastModifiedString (lastModified) {
        return moment(lastModified, 'x').fromNow()
      },
      submitActivity (isNew) {
        if (this.game.id) {
          let post = Object.assign({}, this.activity)
          if (this.useGameInfoAsPost) {
            post.activityTitle = this.game.title
            post.activityDescription = this.game.description
          }
          if (isNew) {
            this.postingInProgress = true
            gameService.createActivity(this.game.id, post).then(response => {
              debugger
              this.resetActivity()
              this.postingInProgress = false
              this.game.activities.push(response)
              this.$message.success('Create Post in steemit successfully!')
            }).catch(error => {
              console.log(error)
              this.postingInProgress = false
              this.$message.error('Fail to create post in steemit.')
            })
          } else {
            gameService.updateActivity(this.game.id, this.activity).then(activity => {
              console.log('update activity successfully')
            }).catch(error => {
              console.log(error)
              this.$message.error('Fail to update the last post on steemit.')
            })
          }
        } else {
          this.$message.error('Please create the game first!')
        }
      },

      resetActivity () {
        this.activity = {
          activityTitle: '',
          activityDescription: '',
          reward: 100,
          tags: []
        }
      },

      resetGame () {
        this.game = {
          title: '',
          description: '',
          coverImage: null,
          category: '',
          activities: [],
          gameUrl: null,
          lastModified: null,
          account: null
        }
        this.fileList = []
        this.$refs.coverImageDropzone.dropzone.removeAllFiles(true)
      },

      onTagChange () {
        console.log('tag changed')
      },
      onFileRemoved (file, fileList) {
        console.log(file, fileList)
        this.fileList = []
        this.game.gameUrl = null
      },
      onFileUploaded (response, file, fileList) {
        console.log(response)
        console.log(file)
        console.log(fileList)
        this.fileList = [file]
        this.game.gameUrl = response[0]
        this.game.gameUrl.name = file.name
      },
      beforeFileUpload (file) {
        console.log(file)
      },
      onFileExceedMax (file) {
        this.$message.info('Please remove the current file first')
      },
      onFileUploadFail (error, file) {
        console.log('Fail to upload game file', error)
        this.$message.error('Fail to upload the image, please try it later.')
        this.game.gameUrl = null
      },
      onImageUploaded (file, response) {
        console.log('file uploaded', response)
        this.game.coverImage = response[0]
        this.game.coverImage.name = file.name
      },
      onImageUploadFail (file) {
        console.log('image upload fail')
        this.$message.error('Fail to upload the image, please try it later.')
      },
      onImageRemoved (file, error, xhr) {
        console.log('image removed', file)
        this.game.coverImage = null
      },
      initData () {
        if (this.id != null) {
          gameService.getById(this.id).then(game => {
            this.game = game
            this.$refs.coverImageDropzone.dropzone.emit('addedfile', this.game.coverImage)
            this.$refs.coverImageDropzone.dropzone.options.thumbnail.call(this.$refs.coverImageDropzone, this.game.coverImage, 'http://gateway.ipfs.io/ipfs/' + game.coverImage.hash)
            this.$refs.coverImageDropzone.dropzone.emit('complete', this.game.coverImage)
            this.$refs.coverImageDropzone.dropzone.files.push( this.game.coverImage )
            this.fileList = [this.game.gameUrl]
          }).catch(error => {
            console.log(error)
          })
        } else {
          this.activeNames = ['gameInfo']
          this.resetGame()
          this.resetActivity()
        }
      }
    },
    computed: {
      actionText () {
        return this.game.id == null ? 'Create' : 'Update'
      }
    },
    mounted () {
      console.log('mounted')
      console.log(GAME_CATEGORY)
      this.initData()
    }
  }
</script>

<style lang='scss' scoped>
  .editFormContainer {
    display: flex;
    justify-content: center;
    .gameEditForm {
      display: block;
      justify-content: center;
      border: 1px solid gray;
      box-shadow: 2px 2px 2px #999999;
      border-radius: 3px;
      padding: 20px;
      width: 70%;
      min-width: 560px;


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

      .game-resource-upload-wrapper {
        display: flex;
        justify-content: center;
        .game-resource-upload {
          width: 400px;
        }
      }
      .activityList {
        .activityHeader {
          display: flex;
          font-size: 14px;
          font-weight: bold;
          border-bottom: 1px solid black;
          margin-bottom: 10px;
        }
        .activityInfo {
          display: flex;
          margin-bottom: 10px;
        }
        .linkTitle, .activityLink {
          width: 70%;
        }
      }
    }
  }
</style>
<style lang="scss">
  .editFormContainer {
    .gameEditForm {
      .el-collapse-item__header {
        font-weight: bold;
        font-size: 15px;
        color: royalblue;
      }

      .dropzone .dz-preview .dz-image img{
        width: 330px;
        height: 200px;
      }
    }
  }
</style>
