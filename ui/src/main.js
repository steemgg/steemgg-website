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

import {FormItem, Checkbox,
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

// import { Button, Select, Input, Upload, Alert } from 'element-ui'
import VueAwesomeSwiper from 'vue-awesome-swiper'

Vue.use(FormItem)
Vue.use(Form)
Vue.use(Button)
Vue.use(Container)
Vue.use(Footer)
Vue.use(Header)
Vue.use(Main)
Vue.use(Radio)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Select)
Vue.use(Col)
Vue.use(Switch)
Vue.use(Input)
Vue.use(Upload)
Vue.use(RadioGroup)
Vue.use(VueAwesomeSwiper)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
