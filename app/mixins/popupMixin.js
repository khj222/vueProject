import Vue from 'vue'
import $ from 'jquery'
import _ from 'lodash'
import { Deferred } from '~/util/Deferred.mjs'
import alert from '~/popup/alert/alert'

function Popup (vm) {
  this.skipOpen = false
  Object.defineProperties(this, {
    'app': {value: vm},
    'store': {value: vm.$store}
  })
}

Popup.prototype.open = function (option, propsData, parent, {beforeAnchor, ignoreSkipOpen} = {}) {
  let doSkipOpen = ignoreSkipOpen ? false : option !== alert
  if (doSkipOpen && this.skipOpen) return Promise.reject(new Error('skip open'))
  this.skipOpen = doSkipOpen || this.skipOpen
  let deferred = new Deferred()
  let component
  if (!parent) parent = Vue.app
  let promise = Promise.resolve()
  let Vm = typeof option === 'string' ? Vue.component(option) : Vue.extend(option)
  component = deferred.promise.vm = new Vm({propsData, parent})
  if (component.$options.beforePopup) { // beforePopup 훅을 가지고 있을 경우 done을 할때까지 팝업을 띄우지 않음
    promise = new Promise((resolve, reject) => {
      component.$options.beforePopup.call(component, function done (tf, reason) {
        tf === false ? reject(reason) : resolve() // false인 경우 팝업 띄우지 않음
      })
    })
  }
  promise.then(() => {
    component.$on('close', function (ret, res) {
      if (arguments.length > 1) ret ? deferred.resolve(res) : deferred.reject(res)
      else deferred.resolve(ret)
      component.$el && component.$el.remove()
      component.$destroy()
    })
    if (beforeAnchor || parent === Vue.app) $('#popup_anchor').before(component.$mount().$el)
    else $(parent.$el).append(component.$mount().$el)
    if (doSkipOpen) setTimeout(() => { this.skipOpen = false }, 0)
  }, reason => {
    let response = reason && reason.response
    let status = _.get(response, 'status')
    if (!response) {
      // this.alert('에러') // 띄워야 할지?
    } else if (status === 404) {
      this.alert('정보가 더 이상 존재하지 않습니다.\n 이미 삭제 된 경우 일 수 있습니다.')
    } else {
      this.alert('정보를 불러오는데 실패했습니다.\n 이미 삭제 된 경우 일 수 있습니다.')
    }
    component.$destroy()
    deferred.reject(reason)
    if (doSkipOpen) this.skipOpen = false
  })
  return deferred.promise
}
Popup.prototype.alert = function (opt) {
  return this.open(alert, (typeof opt === 'string') ? {msg: opt} : opt)
}
Popup.prototype.confirm = function (opt) {
  return this.open(alert, (typeof opt === 'string') ? {
    title: '',
    msg: opt,
    btnList: [{text: '예', value: true}, {text: '아니오', value: false}]
  } : opt)
}

// 루트(앱) 컴포넌트에서 한번만 mixin
export default {
  beforeCreate () {
    this.$_popup = new Popup(this)
  },
  mounted () {
    Vue.popup = this.$_popup
  },
  computed: {
    popup () { return this.$_popup },
    alert () { return (opt) => this.$_popup.alert(opt) },
    confirm () { return (opt) => this.$_popup.confirm(opt) }
  }
}
