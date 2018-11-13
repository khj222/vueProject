import { Deferred } from '~/util/Deferred.mjs'

let onDeviceReady = new Promise(resolve => document.addEventListener('deviceready', resolve, false))
let id = 0
let promiseOf = {}
onDeviceReady.then(() => {
  window.cordova.plugins.notification.local.setDefaults({foreground: true, vibrate: false, sound: false})
  window.cordova.plugins.notification.local.on('click', function (noti, evt) {
    if (!noti.sticky && promiseOf[noti.id]) {
      promiseOf[noti.id].resolve(evt)
      delete promiseOf[noti.id]
    }
  })
  window.cordova.plugins.notification.local.on('clear', function (noti, evt) {
    setTimeout(function () { // ios 문제. click보다 먼저 발생해버림.
      if (promiseOf[noti.id]) {
        promiseOf[noti.id].resolve(false)
        delete promiseOf[noti.id]
      }
    }, 500)
  })
})

export function Notification () {
  this.id = ++id
}

Notification.prototype.prepare = function () {
  if (this.requestPermission) return this.requestPermission
  if (!window.cordova) return Promise.reject(new Error('no cordova'))
  if (!this.deferred) this.deferred = promiseOf[this.id] = new Deferred()
  return (this.requestPermission = new Promise((resolve, reject) =>
    window.cordova.plugins.notification.local.requestPermission(granted => granted ? resolve() : reject(new Error('Notification Permission Denied')))
  ))
}

Notification.prototype.open = function (opt) {
  this.open = this.update // 첫 1회만 실행
  this.opt = opt
  this.opt.id = this.id
  return this.prepare().then(() => {
    window.cordova.plugins.notification.local.schedule(Object.assign({}, this.opt))
    return this.deferred.promise
  })
}
Notification.prototype.update = function (opt) {
  Object.assign(this.opt, opt)
  this.opt.id = this.id
  return this.prepare().then(() => {
    window.cordova.plugins.notification.local.schedule(Object.assign({}, this.opt))
    return this.deferred.promise
  })
}
