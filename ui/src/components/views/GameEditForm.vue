<template>
  <el-container>
    <el-header><common-header></common-header></el-header>
    <el-main>
      <div class="editFormContainer">
        <div class='gameEditForm'>
          <div class="previewButton" v-if="gameExists">
            <el-button v-if="this.game.status != null && this.game.status === 0" type="success" round @click="previewGame">Preview Game</el-button>
            <el-button v-if="this.game.status != null && this.game.status !== 0" type="success" round @click="previewGame">Play Game</el-button>
          </div>
          <el-collapse v-model="activeNames">
            <el-collapse-item title="Game information" name="gameInfo">
              <div>
                <el-form ref='game' :rules='rules' :model='game' label-width='150px'>
                  <el-form-item label='Game title' prop="title">
                    <el-input v-model='game.title'></el-input>
                  </el-form-item>
                  <el-form-item label='Game description' prop="description">
                    <!--<el-input v-model='game.description' type="textarea" :rows="2" placeholder="Please input description of your game"></el-input>-->
                    <mavon-editor language="en" :subfield="false" v-model='game.description' :toolbars="descriptionEditorToolbar"></mavon-editor>
                  </el-form-item>
                  <el-form-item label="Cover image" prop="coverImage">
                    <el-tooltip content="Image dimension must be: width:300px Height:200px" placement="top" effect="light">
                      <vue-dropzone
                        ref="coverImageDropzone"
                        @vdropzone-success="onImageUploaded"
                        @vdropzone-removed-file="onImageRemoved"
                        @vdropzone-error="onImageUploadFail"
                        id="dropzone"
                        :options="dropzoneOptions">
                    </vue-dropzone>
                    </el-tooltip>
                    <div><i class="fa fa-info-circle" aria-hidden="true"></i> Image dimension must be: width:300px Height:200px</div>
                  </el-form-item>
                  <el-form-item label='Game width' prop="width">
                    <el-tooltip content="Min: 300px; Max: 3000px" placement="top" effect="light">
                      <el-input-number v-model="game.width" :min="300" :max="3000" label="Game width"></el-input-number>
                    </el-tooltip>
                    <span class="px">px</span>
                    <!--<i class="fa fa-question-circle-o" aria-hidden="true"></i>-->
                  </el-form-item>
                  <el-form-item label='Game height' prop="height">
                    <el-tooltip content="Min: 300px; Max: 3000px" placement="top" effect="light">
                      <el-input-number v-model="game.height" :min="300" :max="3000" label="Game height"></el-input-number>
                    </el-tooltip>
                    <span class="px">px</span>
                  </el-form-item>
                  <el-form-item label='Game type' prop="category">
                    <el-select v-model="game.category" filterable placeholder="Select">
                      <el-option v-for="item in gameTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="File" prop="gameUrl">
                    <div class="game-resource-upload-wrapper">
                      <el-upload
                        class="game-resource-upload"
                        :with-credentials="true"
                        :action="uploadTarget"
                        :on-remove="onFileRemoved"
                        :file-list="fileList"
                        :limit="1"
                        accept="application/zip"
                        :on-success="onFileUploaded"
                        :before-upload="beforeFileUpload"
                        :on-exceed="onFileExceedMax"
                        :on-error="onFileUploadFail"
                        list-type="text">
                        <el-button size="small" type="primary" :disabled="!$store.state.loggedIn">Click to upload</el-button>
                        <div slot="tip" class="el-upload__tip upload_tip">Only accept .zip file (max size 20MB), which should contain all of your game's files and assets. There must be an index.html file in the root folder.</div>
                      </el-upload>
                    </div>
                  </el-form-item>
                  <el-form-item label="API Key" prop="key">
                    <div class="apiKeyInput">
                      <el-input maxlength="64" minlength="64" size="medium" placeholder="Please generate a new key" :value="apiKey" ref="apiKeyInput" :disabled="true">
                        <el-tooltip placement="top" slot="append">
                          <div slot="content">Copy the API key to the clipboard</div>
                          <i class="fa fa-clipboard"  aria-hidden="true" @click="copyApiKeyToClipBoard()"></i>
                        </el-tooltip>
                      </el-input>
                      <el-button type='primary' size="mini" @click="confirmNewKey()">Generate a new kay</el-button> </div>
                  </el-form-item>
                  <!--<el-form-item>-->
                  <div class="copyRightWrapper" v-if="!gameExists">
                    <el-checkbox  v-model="copyRightClaim"></el-checkbox>
                    <span class="copyRightText"> I acknowledge that I own the copyright of the game, and I have already embedded my steemit account id (eg. @steemit.account) into the game.</span>
                  </div>
                  <!--</el-form-item>-->
                  <div class="gameCreationActionWrapper">
                    <el-button type='primary' :loading="gameActionInProgress" @click="submitForm('game')" :disabled="!$store.state.loggedIn || (this.game.id == null && copyRightClaim === false)">{{ actionText }}</el-button>
                    <el-button @click="cancelForm()">Cancel</el-button>
                  </div>
                </el-form>
              </div>
            </el-collapse-item>
            <el-collapse-item v-if="game && game.activities && game.activities.length > 0" title="Game Dev Logs" name="existingPosts">
              <div class="activityList" >
                <div class="activityHeader">
                  <span class="linkTitle">Perm Link</span>
                  <span class="creationDateTitle">Creation Date</span>
                </div>
                <div v-for="activity in game.activities" class="activityInfo">
                  <span class="activityLink">
                    <a :href="'https://steemit.com/@' + activity.account + '/' + activity.permlink" target="_blank">{{activity.activityTitle}}</a>
                  </span>
                  <span class="postCreationDate">{{getLastModifiedString(activity.lastModified)}}</span>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="New Dev Log for Game" name="newPost">
              <div>
                <h3 v-if="createNewPost"> Create Post in Steemit</h3>
                <h3 v-if="!createNewPost"> Create Comment in Steemit</h3>
                <el-form ref='activity' :rules='activityRules' :model='activity' label-width='150px'>
                  <el-form-item label='Content type:' v-if="gameExists">
                    <el-switch
                      v-model="createNewPost"
                      active-text="Post"
                      inactive-text="Comment">
                    </el-switch>
                  </el-form-item>
                  <el-form-item label='Dev Log Content' >
                    <el-switch
                       v-model="useGameInfoAsPost"
                       active-text="Use Game Info"
                       inactive-text="Customize">
                    </el-switch>
                  </el-form-item>
                  <el-form-item label='Activity Title' prop="activityTitle" v-if="!useGameInfoAsPost">
                    <el-input :disabled="useGameInfoAsPost" v-model='activity.activityTitle'></el-input>
                  </el-form-item>
                  <el-form-item label='Activity Description' prop="activityDescription" v-if="!useGameInfoAsPost">
                    <el-input :disabled="useGameInfoAsPost" v-model='activity.activityDescription' type="textarea" :rows="2" placeholder="This will be posted to steemit, game description will be used if empty"></el-input>
                  </el-form-item>
                  <el-form-item label='Tags'>
                    <input-tag :on-change='onTagChange' :tags.sync='activity.tags' limit="4" placeholder="Use 'Enter', 'comma' or 'tab' to separate tags"></input-tag>
                  </el-form-item>
                  <el-form-item label="reward">
                    <el-select v-model="activity.reward" placeholder="Please select">
                      <el-option
                        :key="50"
                        :label="'50% SBD / 50% SP'"
                        :value="50">
                      </el-option>
                      <el-option
                        :key="100"
                        :label="'100% Steem Power'"
                        :value="100">
                      </el-option>
                    </el-select>
                    <!--<el-slider v-model="activity.reward"></el-slider>-->
                  </el-form-item>
                  <el-form-item>
                    <div class="postCountdown">
                      <count-down :time="postingWaitTime" v-if="postingWaitTime > 0" @countdownend="this.postingWaitTime = -1">
                        <template slot-scope="props">
                          <div role="alert postingIntervalMessage" class="el-alert el-alert--warning">
                            <i class="el-alert__icon el-icon-warning"></i>
                            <div class="el-alert__content">
                              <span class="el-alert__title">You need to wait for {{ props.hours }}:{{ props.minutes }}:{{ props.seconds }} before creating your next post.</span>
                            </div>
                          </div>
                        </template>
                      </count-down>
                    </div>
                    <!--<el-button type='primary' v-if="activity.permLink != null" @click="submitActivity(false)">Update</el-button>-->
                    <el-button type='primary' :disabled="game.id == null || this.postingWaitTime > 0" :loading="postingInProgress" @click="submitActivity(true)">New Dev Log</el-button>
                    <!--<el-button @click="cancelForm()">Cancel</el-button>-->
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>
          </el-collapse>
          <el-dialog
            title="Create a Post"
            :visible.sync="postTipDialogVisible"
            width="30%">
            <div >
              <div class="postTipContent">Congratulations! Your game has been created successfully. You can choose to create a post in steemit for your game now or later. Please be aware that until a post is created, your game will not be approved and cannot receive award. </div>
              <div class="hidePostTipCheckbox"><el-checkbox v-model="hidePostTip" @change="doNotShowTip">Do not show this again.</el-checkbox></div>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button type="primary" @click="postTipDialogVisible = false">Okay</el-button>
            </span>
          </el-dialog>
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
  import vue2Dropzone from 'vue2-dropzone'
  import 'vue2-dropzone/dist/vue2Dropzone.css'
  import CommonHeader from '../common/CommonHeader'
  import GameService from '../../service/game.service'
  import { GAME_CATEGORY } from '../../service/const'
  import VueCountdown from '@xkeshi/vue-countdown'
  const gameService = new GameService()

  const gameImageDimension = {
    // minWidth: 300,
    // maxWidth: 1200,
    // minHeight: 200,
    // maxHeight: 800
    width: 300,
    height: 200
  }
  // max file size is 20MB
  const gameFileConfig = {
    size: 20 * 1024 * 1024
  }
  export default {
    components: {
      CommonHeader,
      CommonFooter,
      InputTag,
      vueDropzone: vue2Dropzone,
      CountDown: VueCountdown
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
        createNewPost: true,
        hidePostTip: false,
        postTipDialogVisible: false,
        actionText: 'Create',
        postingWaitTime: -1,
        copyRightClaim: false,
        apiKey: '',
        uploadTarget: (process.env.API_SERVER_URL.endsWith('/') ? process.env.API_SERVER_URL.slice(0, -1) : process.env.API_SERVER_URL) + '/api/v1/upload',
        game: {
          title: '',
          description: '',
          coverImage: null,
          category: '',
          activities: [],
          gameUrl: null,
          lastModified: null,
          account: null,
          width: 1024,
          height: 768,
          key: null
        },
        activity: {
          activityTitle: '',
          activityDescription: '',
          reward: 100,
          tags: []
        },
        fileList: [],
        descriptionEditorToolbar: {
          bold: true, // 粗体
          italic: true, // 斜体
          header: true, // 标题
          underline: true, // 下划线
          strikethrough: true, // 中划线
          quote: true, // 引用
          ol: true, // 有序列表
          ul: true, // 无序列表
          link: true, // 链接
          fullscreen: true, // 全屏编辑
          help: true, // 帮助
          /* 1.3.5 */
          undo: true, // 上一步
          redo: true, // 下一步
//          trash: true, // 清空
          /* 2.1.8 */
          alignleft: true, // 左对齐
          aligncenter: true, // 居中
          alignright: true, // 右对齐
          /* 2.2.1 */
          subfield: true, // 单双栏模式
          preview: true
        },
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
            { type: 'object', required: true, message: 'Please upload a valid game image', trigger: 'change' }
          ],
          gameUrl: [
            { type: 'object', required: true, message: 'Please upload game file', trigger: 'change' }
          ],
          key: [
            { required: true, message: 'Please generate a API Key' }
          ]
        },
        activityRules: {
          activityTitle: [
            { min: 5, max: 255, message: 'Title should between 5 - 255 characters', trigger: 'blur' },
            { required: true, message: 'Please input the post title', trigger: 'blur' }
          ],
          activityDescription: [
            { max: 3000, message: 'Description max 3000 characters', trigger: 'blur' },
            { required: true, message: 'Please input the post body', trigger: 'blur' }
          ]
        },
        dropzoneOptions: {
          url: (process.env.API_SERVER_URL.endsWith('/') ? process.env.API_SERVER_URL.slice(0, -1) : process.env.API_SERVER_URL + '/api/v1/upload') + '/api/v1/upload',
          maxFilesize: 1,
          maxFiles: 1,
          thumbnailWidth: 330,
          addRemoveLinks: true,
          withCredentials: true,
          acceptedFiles: 'image/*',
          dictDefaultMessage: "<i class='fa fa-cloud-upload'></i> Upload a cover image for the game, max file size is 1MB",
          init: function () {
            // Register for the thumbnail callback.
            // When the thumbnail is created the image dimensions are set.
            this.on('thumbnail', function (file) {
              // Do the dimension checks you want to do
              if (file.width !== gameImageDimension.width || file.height !== gameImageDimension.height) {
                // file.invalidDimention = true
                file.rejectDimensions && file.rejectDimensions()
              } else {
                file.acceptDimensions && file.acceptDimensions()
              }
            })
          },

          // Instead of directly accepting / rejecting the file, setup two
          // functions on the file that can be called later to accept / reject
          // the file.
          accept: function (file, done) {
            file.acceptDimensions = done
            file.rejectDimensions = function () {
              done('Invalid image dimension.')
            }
            // Of course you could also just put the `done` function in the file
            // and call it either with or without error in the `thumbnail` event
            // callback, but I think that this is cleaner.
          }
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
        this.$refs['game'].validate((valid) => {
          if (valid) {
            console.log('submit', this.game)
            if (this.game.id == null) {
              this.gameActionInProgress = true
              gameService.create(this.game).then((game) => {
                // pop up success message
                this.game = game
                this.game.status = 0
                this.gameActionInProgress = false
                this.$notify({
                  title: 'Game created',
                  message: `Congratulations! The game '${game.title}' has been created successfully. You can create a new post now`,
                  type: 'success',
                  offset: 100,
                  duration: 0
                })
                this.activeNames = ['newPost']
                this.actionText = 'Update'
                if (this.$store.getters.showPostTip) {
                  this.postTipDialogVisible = true
                }
              }).catch(error => {
                console.log('submit form error', error)
                this.gameActionInProgress = false
                this.$notify.error({
                  title: 'Oops!',
                  message: ' Something went wrong. Your game cannot be created right now. Please try again later or contact us.'
                })
                this.errorMessage = error.data
              })
            } else {
              this.gameActionInProgress = true
              gameService.update(this.game).then(() => {
                console.log('game updated successfully.')
                this.gameActionInProgress = false
                this.$notify({
                  title: 'Game Updated',
                  message: 'Your game has been updated. You can choose to create a new Post to steemit.',
                  type: 'success',
                  offset: 100
                })
              }).catch(error => {
                this.gameActionInProgress = false
                this.$notify.error({
                  title: 'Oops!',
                  message: ' Something went wrong. Your game cannot be updated right now. Please try again later or contact us.'
                })
                this.errorMessage = error.data
              })
            }
          } else {
            console.log('error submit!')
            return false
          }
        })
      },
      previewGame () {
        this.$router.push({
          name: 'viewGame',
          params: {
            id: this.game.id
          }
        })
      },
      copyApiKeyToClipBoard () {
        var dummy = document.createElement('input')
        document.body.appendChild(dummy)
        dummy.setAttribute('value', this.apiKey)
        dummy.select()
        document.execCommand('copy')
        document.body.removeChild(dummy)
        this.$notify({
          title: 'API Key is copied successfully',
          message: '',
          type: 'success',
          offset: 100,
          duration: 1500
        })
      },
      doNotShowTip () {
        if (this.hidePostTip) {
          this.$store.commit('hidePostTip')
        } else {
          this.$store.commit('showPostTip')
        }
      },
      getLastModifiedString (lastModified) {
        return moment(lastModified).fromNow()
      },
      updateActivityInterval () {
        console.log('Entering updateActivityInterval')
        this.postingWaitTime = -1
        if (this.game.activities && this.game.activities.length > 0) {
          let lastPostTime = this.game.activities[0].lastModified
          console.log('last post creation time', moment(lastPostTime).valueOf())
          console.log(moment(lastPostTime).valueOf() + this.$store.getters.user.gamePostingInterval * 1000 - moment().valueOf())

          this.postingWaitTime = moment(lastPostTime).valueOf() + this.$store.getters.user.gamePostingInterval * 1000 - moment().valueOf()
        }
        console.log('Existing updateActivityInterval')
      },
      /**
       *
       * @param isNew - currently not used
       */
      submitActivity (isNew) {
        if (this.game.id) {
          let post = Object.assign({}, this.activity)
          if (this.useGameInfoAsPost) {
            post.activityTitle = this.game.title
            post.activityDescription = this.game.description
          }
          if (isNew) {
            this.postingInProgress = true
            gameService.createActivity(this.game.id, post, this.createNewPost).then(response => {
              this.resetActivity()
              this.postingInProgress = false
              if (this.createNewPost) {
                // only push a new record if it's a post
                this.game.activities.push(response)
                this.updateActivityInterval()
                this.$notify({
                  title: 'Post Created',
                  message: 'You have created a post in steemit successfully. You can find the post link in "Game Dev Logs" section',
                  type: 'success',
                  offset: 100
                })
              } else {
                this.$notify({
                  title: 'Comment Created',
                  message: 'You have created a new comment on the latest post successfully. You can find the post link in "Game Dev Logs" section',
                  type: 'success',
                  offset: 100
                })
              }
              this.activeNames = ['existingPosts', 'gameInfo']
            }).catch(error => {
              this.postingInProgress = false
              console.error('fail to post', error.response)
              if (error.response.data.resultCode === 400) {
                this.updateActivityInterval()
                this.$message.warning('You just post a content, please wait for a while.')
              } else {
                this.$message.error('Fail to create content in steemit.')
              }
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
          this.$message.error('Please create the game first.')
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
          account: null,
          width: 1024,
          height: 768,
          key: null
        }
        this.generateRandomKey()
        this.fileList = []
        this.$refs.coverImageDropzone.dropzone.removeAllFiles(true)
      },

      confirmNewKey () {
        this.$confirm(`This will generate a new API Key, if you update the game with it,
          your game file will not be able to use the sdk successfully unit it's updated to use the new key. Are you sure you want to proceed?`, 'Confirm changing API Key',
          {
            confirmButtonText: 'Yes, change it.',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
            this.generateRandomKey()
          }).catch(() => {
          })
      },

      generateRandomKey () {
        this.game.key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.apiKey = this.game.key
      },

      onTagChange () {
        if (this.activity.tags.length > 4) {
          this.activity.tags.splice(4)
          this.$message.info('Only allow up to 4 tags.')
        }
      },
      onFileRemoved (file, fileList) {
        this.fileList = []
        this.game.gameUrl = null
      },
      onFileUploaded (response, file, fileList) {
        this.fileList = [file]
        this.game.gameUrl = response[0]
        this.game.gameUrl.name = file.name
      },
      beforeFileUpload (file) {
        if (file.size > gameFileConfig.size) {
          this.$message.error('The max file size is 20MB.')
          return false
        }
      },
      onFileExceedMax (file) {
        this.$message.warning('Please remove the current file first')
      },
      onFileUploadFail (error, file) {
        console.log('Fail to upload game file', error)
        this.$message.error('Fail to upload the game file, please try it later.')
        this.game.gameUrl = null
      },
      onImageUploaded (file, response) {
        console.log('file uploaded', response)
        this.game.coverImage = response[0]
        this.game.coverImage.name = file.name
      },
      onImageUploadFail (file) {
        console.log('image upload fail')
        if (file.accepted) {
          this.$message.error('Oops.. Fail to upload the image, please try it later.')
          this.$refs.coverImageDropzone.dropzone.removeFile(file)
        }
      },
      onImageRemoved (file, error, xhr) {
        this.game.coverImage = null
      },

      initData () {
        if (this.id != null) {
          this.createNewPost = false
          gameService.getById(this.id).then(game => {
            // only the game creator or admin can edit game
            if (this.$store.getters.isAdmin || game.account === this.$store.getters.user.account) {
              this.game = game
              if (this.game.key == null) {
                this.generateRandomKey()
              } else {
                this.apiKey = this.game.key
              }
              this.$refs.coverImageDropzone.dropzone.emit('addedfile', this.game.coverImage)
              this.$refs.coverImageDropzone.dropzone.options.thumbnail.call(this.$refs.coverImageDropzone, this.game.coverImage, process.env.IPFS_SERVER_URL + game.coverImage.hash)
              this.$refs.coverImageDropzone.dropzone.emit('complete', this.game.coverImage)
              this.$refs.coverImageDropzone.dropzone.files.push(this.game.coverImage)
              this.fileList = [this.game.gameUrl]
              this.actionText = 'Update'
              this.updateActivityInterval()
            } else {
              this.$message.error('You are not allowed to edit this game.')
              this.$router.push({
                name: 'home'
              })
            }
          }).catch(() => {
            this.$message.error('Fail to load the game data, make sure the game exist.')
          })
        } else {
          this.activeNames = ['gameInfo']
          this.actionText = 'Create'
          this.copyRightClaim = false
          this.resetGame()
          this.resetActivity()
        }
      }
    },
    computed: {
      gameExists () {
        return this.game.id != null
      }
    },
    mounted () {
      if (!this.$store.state.loggedIn) {
        this.$message.warning('Please log in first to create game.')
      }
      this.initData()
    }
  }
</script>

<style lang='scss' scoped>
  .editFormContainer {
    text-align: center;
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

      .px {
        font-weight:bold;
        color: #409EFF;
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
      .copyRightWrapper {
        margin: 0 50px 10px;
        .copyRightText {
          padding-left: 10px;
        }
      }
      .gameCreationActionWrapper {
        margin-bottom: 10px;
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
      .previewButton {
        display:flex;
        place-content: flex-end;
      }
      .el-collapse-item__header {
        font-weight: bold;
        font-size: 15px;
        color: white;
        font-weight:bold;
        border-radius: 0 0 20px 20px;
        margin:5px 0px;
        background-color:#409EFF;
        height: 40px;
        line-height: 40px;
      }

      .dropzone .dz-preview .dz-image img{
        width: 330px;
        height: 200px;
      }

      .el-collapse-item__content {
        padding: 0 10px;
        .postingIntervalMessage {
          margin-bottom: 10px;
        }
      }
      .upload_tip {
        line-height: 20px;
      }
      .postCountdown {
        margin-bottom: 10px;
      }
      .apiKeyInput {
        .el-input {
          padding-left: 100px;
          padding-right: 50px;
        }
        .fa-clipboard {
          cursor: pointer;
        }
      }
    }
  }
  .postTipContent {
    display: flex;
    text-align: left;
  }
  .hidePostTipCheckbox {
    display: flex;
    margin-top: 15px;
  }
</style>
