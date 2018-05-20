// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import 'swiper/dist/css/swiper.css'
import './assets/style/bootstrap.css'
import './assets/style/style.css'
import './assets/style/app.scss'
import './assets/style/_fonts.scss'
import 'element-ui/lib/theme-chalk/index.css'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'github-markdown-css/github-markdown.css'

import { store } from './store/store'

import {
  FormItem,
  Checkbox,
  CheckboxGroup,
  Form,
  Row,
  Col,
  Collapse,
  Dialog,
  CollapseItem,
  Switch,
  Button,
  Radio,
  Input,
  Container,
  Aside,
  Footer,
  Header,
  Main,
  Select,
  Option,
  Upload,
  RadioButton,
  RadioGroup,
  Table,
  TableColumn,
  Menu,
  MenuItem,
  MenuItemGroup,
  Popover,
  Submenu,
  Slider,
  Tabs,
  TabPane,
  Icon,
  Loading,
  Notification,
  Message,
  MessageBox,
  Tooltip
} from 'element-ui'

import infiniteScroll from 'vue-infinite-scroll'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import 'element-ui/lib/theme-chalk/display.css'

Vue.use(FormItem)
Vue.use(Form)
Vue.use(Button)
Vue.use(Container)
Vue.use(Footer)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Main)
Vue.use(Radio)
Vue.use(RadioButton)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Select)
Vue.use(Option)
Vue.use(Col)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Row)
Vue.use(Switch)
Vue.use(Input)
Vue.use(Upload)
Vue.use(RadioGroup)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Popover)
Vue.use(Submenu)
Vue.use(Slider)
Vue.use(Loading)
Vue.use(Icon)
Vue.use(Dialog)
Vue.use(Tooltip)
// Vue.use(Notification)
// Vue.use(Message)
// Vue.use(MessageBox)
Vue.use(infiniteScroll)
Vue.use(VueAwesomeSwiper)
Vue.use(mavonEditor)
Vue.use(BootstrapVue)

const MsgBox = MessageBox
Vue.prototype.$msgbox = MsgBox
Vue.prototype.$alert = MsgBox.alert
Vue.prototype.$confirm = MsgBox.confirm
Vue.prototype.$prompt = MsgBox.prompt

Vue.prototype.$notify = Notification
Vue.prototype.$message = Message
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
