import cordova from '~/util/cordova'
import alert from '~/popup/alert/alert'
import _ from 'lodash'
import Vue from 'vue'
import { Deferred } from '~/util/Deferred.mjs'
import { $afterAppMounted } from '~/util/provider.mjs'

let registId
let push
let localStorage = window.localStorage
let senderId = '301448583973'
let registIdDeferred

function init() {
  return cordova.onDeviceReady.then(() => {
    registIdDeferred = new Deferred()
    push = window.PushNotification.init({
      android: {
        senderID: senderId,
        clearNotifications: 'false',
        forceShow: 'true'
      },
      ios: {
        sound: 'true',
        alert: 'true',
        badge: 'true',
        clearBadge: 'true'
      }
    })
    push.off('registration', onRegistration)
    push.off('error', onError)
    push.off('notification', onNotification)

    push.on('registration', onRegistration)
    push.on('error', onError)
    push.on('notification', onNotification)
    // console.log('push init!!')
    return push
  })
}

let pushPromise = init()

function getRegistId() {
  if (!window.cordova) return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
  return pushPromise.then(function() {
    // console.log('getRegistId : ', registId)
    return registId || registIdDeferred.promise
  })
}

function onRegistration(data) {
  // console.log('onRegistration : ', data)
  localStorage.setItem('registId', data.registrationId)
  registId = data.registrationId || null
  registIdDeferred.resolve(data.registrationId)
  push.off('registration', onRegistration)
}

function onError() {
  registId = false
  localStorage.setItem('registId', null)
}

function setSenderId(id) {
  senderId = id
}

function onNotification(noti) {
  // console.log('onNotification : ', noti)
  $afterAppMounted.promise.then(() => {
    // console.log(noti)
    push.finish(
      () => {
        let btnList = []
        // console.log(noti)
        let popupOption = Vue.pages.getPopupOption(
          noti.additionalData.page_info
        )

        if (popupOption) {
          btnList = [
            { text: '이동', value: true },
            { text: '닫기', value: false }
          ]
        } else btnList = [{ text: '확인', value: false }]

        Vue.popup
          .open(alert, {
            title: noti.title,
            msg: noti.message,
            btnList
          })
          .then(
            r => {
              if (r.btn.value && popupOption) Vue.popup.open(...popupOption)
            },
            e => console.log(e)
          )
        // console.log('processing of push data is finished', noti)
      },
      () => {
        // console.log('something went wrong with push.finish for ID =')
      }
    )
  })
}

let notificationListener = []

function bindNotification(vm, fn) {
  notificationListener.push([vm, fn])
}

function offNotification(vm, fn) {
  _.remove(notificationListener, x => x[0] === vm && x[1] === fn)
}

function offVmNotification(vm) {
  _.remove(notificationListener, x => x[0] === vm)
}

pushPromise.then(push => {
  push.on('notification', () => {
    for (let [vm, fn] of notificationListener) {
      fn.apply(vm)
    }
  })
})

export default {
  init,
  getRegistId,
  setSenderId,
  onNotification: bindNotification,
  offNotification,
  offVmNotification
}
