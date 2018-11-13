import app from './app'
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import baseStore from './store/store'
import routes from './routes.js'
import VueRouter from 'vue-router'
import cordova from '~/util/cordova'
import '~/common/loading/service'
import '~/util/vanilla-ripplejs'
import $ from 'jquery'
import slide from '~/common/slide/slide'
import download from '~/common/download/download'
import fade from '~/common/fade/fade'
import fadePopup from '~/common/fadePopup/fadePopup'
import addFile from '~/common/addFile/addFile'
import divHtml from '~/common/divHtml/divHtml'
import editor from '~/common/editor/editor'
import spinner from '~/common/spinner/spinner'
import ulFlip from '~/common/ulFlip/ulFlip'
import inputDate from '~/common/inputDate/inputDate'
import leftMenu from '~/common/leftMenu/leftMenu'
import constant from '@constant'
import '~/util/filters.mjs'
import '~/util/directives.mjs'
import push from '~/util/push'
import _ from 'lodash'
import { lodashMixin } from './util/util.mjs'

import VueCookie from 'vue-cookie'
import VueTouch from 'vue-touch'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'

// import Mint from 'mint-ui'
// import { Cell, CellSwipe } from 'mint-ui'
// import 'mint-ui/lib/style.css'

_.mixin(lodashMixin)
Vue.use(cordova.plugin)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(VueTouch, {
  name: 'v-touch'
})
Vue.use(VueCookie)
// Vue.use(Mint)

// Use v-calendar, v-date-picker & v-popover components
// Vue.component(Cell.name, Cell)
// Vue.component(CellSwipe.name, CellSwipe)
Vue.component('slide', slide)
Vue.component('fade', fade)
Vue.component('input-date', inputDate)
Vue.component('left-menu', leftMenu)
Vue.component('fade-popup', fadePopup)
Vue.component('add-file', addFile)
Vue.component('div-html', divHtml)
Vue.component('download', download)
Vue.component('editor', editor)
Vue.component('spinner', spinner)
Vue.component('ul-flip', ulFlip)

axios.defaults.baseURL = constant.baseURL // 전역 기본설정
axios.defaults.withCredentials = true // 전역 기본설정
axios.defaults.timeout = 60000
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
const router = new VueRouter({
  routes
})
const store = new Vuex.Store(baseStore())

const checkNeedRedirect = function() {
  return push
    .getRegistId()
    .catch(e => undefined)
    .then(registId => {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.certificates) {
        window.cordova.plugins.certificates.trustUnsecureCerts(true)
      }
      store.dispatch('user[check]', {
        push_token: registId || '',
        uuid: window.device ? window.device.uuid : 'test',
        model: window.device ? window.device.model : ''
      })
    })

    .then(userInfo => (store.state.user.data.user_id ? undefined : '/login')) // getRegistId는 catch처리 했고, user[check]은 reject 하지 않기 때문에 무조건 resolve
}
router.base = '/main'

router.beforeEach(function bootCheckSession(to, from, next) {
  _.pull(router.beforeHooks, bootCheckSession) // 1번 실행하고 제거
  checkNeedRedirect().then(path => {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.certificates) {
      window.cordova.plugins.certificates.trustUnsecureCerts(true)
    }
    versionCheck()
    // setTimeout(
    //   () =>
    //     $('.splash.spinner_wrap').fadeOut('normal', function() {
    //       $(this).remove()
    //     }),
    //   1000
    // )
    next(path)
  })
})
function showUpdatePopup(msg) {
  popup
    .open(alert, {
      msg,
      btnList: [
        {
          text: '취소',
          value: false
        },
        {
          text: '확인',
          value: true
        }
      ]
    })
    .then(r => {
      if (r.btn.value) {
        var url = store.getters.getVersionInfo.updateUrl // constant.baseURL
        window.cordova.InAppBrowser.open(url, '_system')
        showUpdatePopup(msg)
      } else {
        navigator.app.exitApp()
      }
    })
}
function versionCheck() {
  // 현재 앱 버전 가져오기
  store.dispatch('versionCheck').then(r => {
    if (store.getters.getVersionInfo.result !== 'OK') {
      var msg = store.getters.getVersionInfo.result
      showUpdatePopup(msg)
    } else {
      setTimeout(
        () =>
          $('.splash.spinner_wrap').fadeOut('normal', function() {
            $(this).remove()
          }),
        1000
      )
    }
  })
}

// document.addEventListener('resume', () => checkNeedRedirect().then(path => path && router.push(path)))
if (!window.localStorage.hasOwnProperty('alarmTime')) {
  window.localStorage.alarmTime = Date.now()
}
function setScale() {
  var bodyEl = document.querySelector('body')
  var height = window.innerHeight
  var width = window.innerWidth
  var targetHeight = 620 // 가로가 375px을 가지는 1920x1080폰에서 상단바가 60px일경우
  if (width > 360) {
    targetHeight = 630
  }
  if (width <= 320) {
    bodyEl.classList.add('iphone5')
  }
  if (!height || !width) {
    return document.addEventListener('resume', setScale, false)
  } else document.removeEventListener('resume', setScale)
  var scale = 1
  if (height > width * 2.0 || width > 360) {
    scale = height / targetHeight
    if (height > width * 2.0) {
      bodyEl.classList.add('long_height')
    }
    bodyEl.classList.add('changed_viewport')
  }
  var targetWidth = Math.floor(width / scale)
  var meta = document.querySelector('meta[name=viewport]')
  meta.setAttribute('name', 'viewport')
  // console.log(targetHeight, targetWidth)
  meta.setAttribute('content', 'width=' + targetWidth + ', user-scalable=no')
}
setScale()

// eslint-disable-line no-new
new Vue({
  router,
  store,
  beforeMount() {
    Vue.root = this
    Vue.store = this.$store
  },
  render: h => h(app),
  el: 'app'
})
