import loadingComp from './loading'
import Vue from 'vue'

let getLoading = new Promise(resolve => {
  Vue.nextTick(() => {
    resolve(new Vue({extends: loadingComp}).$mount('#loading_wrap'))
  })
})
export default {
  show: (promise) => getLoading.then(loading => loading.show(promise)),
  hide: (r) => getLoading.then(loading => loading.hide(r))
}
