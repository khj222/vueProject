import Vue from 'vue'

export default {
  open (...args) {
    if (!Vue.popup) return Promise.reject(new Error('not prepared'))
    return Vue.popup.open(...args)
  }
}
