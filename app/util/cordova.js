import _ from 'lodash'
import { Deferred } from '~/util/Deferred.mjs'
import { Notification } from '~/util/cordova.notification.mjs'
import mime from 'mime-types'

let onDeviceReady = new Promise(resolve => document.addEventListener('deviceready', resolve, false))

export default {
  plugin: {
    install(Vue) {
      // cordova 기본 라이프 사이클 플러그인으로 추가
      function Handler(name) {
        let self = this
        this.listener = []
        this.tick = function(e) {
          for (let comp of self.listener) {
            if (comp.$options[name].call(comp, e) !== true) break
          }
        }
        this.bind = function(vm) {
          if (vm.$options[name]) self.listener.unshift(vm)
        }
        this.unbind = function(vm) {
          _.pull(self.listener, vm)
        }
      }

      let resumeHandler = new Handler('resume')
      let pauseHandler = new Handler('pause')
      let backHandler = new Handler('back')
      let KeyboardHideHandler = new Handler('hidekeyboard')
      let KeyboardShowHandler = new Handler('showkeyboard')
      let screenshotHandler = new Handler('screenshot')

      document.addEventListener(
        'keyup',
        e => {
          e.keyCode === 27 && backHandler.tick(e)
        },
        false
      )
      document.addEventListener('resume', resumeHandler.tick, false)
      document.addEventListener('pause', pauseHandler.tick, false)
      document.addEventListener('backbutton', backHandler.tick, false)
      document.addEventListener('hidekeyboard', KeyboardHideHandler.tick, false)
      document.addEventListener('showkeyboard', KeyboardShowHandler.tick, false)
      document.addEventListener('screenshot', screenshotHandler.tick, false)
      // setTimeout(() => {
      //   if (window.device && window.device.platform === 'iOS') {
      //     window.Photos.collections({
      //         'collectionMode': 'ALBUMS'
      //       },
      //       function (albums) {
      //         console.log(albums)
      //       },
      //       function (error) {
      //         console.error('Error: ' + error)
      //       })
      //   }
      // }, 0)

      // var path = 'file:///storage/emulated/0'
      // var filename = 'myfile.txt'

      // window.resolveLocalFileSystemURL(path, function (dir) {
      //   dir.getFile(filename, {
      //     create: false
      //   }, function (fileEntry) {
      //     fileEntry.remove(function () {
      //       // The file has been removed succesfully
      //     }, function (error) {
      //       // Error deleting the file
      //     }, function () {
      //       // The file doesn't exist
      //     })
      //   })
      // })
      Vue.mixin({
        created() {
          resumeHandler.bind(this)
          backHandler.bind(this)
          pauseHandler.bind(this)
          KeyboardHideHandler.bind(this)
          KeyboardShowHandler.bind(this)
          screenshotHandler.bind(this)
        },
        destroyed() {
          resumeHandler.unbind(this)
          backHandler.unbind(this)
          pauseHandler.unbind(this)
          KeyboardHideHandler.unbind(this)
          KeyboardShowHandler.unbind(this)
          screenshotHandler.unbind(this)
        }
      })
    }
  },
  onDeviceReady,
  statusBar: {
    backgroundColorByHexString(hex) {
      let StatusBar = window.StatusBar
      return StatusBar && StatusBar.backgroundColorByHexString(hex)
    },
    show() {
      let StatusBar = window.StatusBar
      return StatusBar && StatusBar.show()
    },
    hide() {
      let StatusBar = window.StatusBar
      return StatusBar && StatusBar.hide()
    }
  },
  file: {
    open(nativeUrl, mimeType) {
      return new Promise((resolve, reject) => {
        if (!window.cordova) return reject(new Error('no cordova'))
        window.cordova.InAppBrowser.open(nativeUrl, '_system')
        // window.cordova.plugins.fileOpener2.open(nativeUrl, mimeType, {
        //   error: reject,
        //   success: resolve
        // })
      })
    },
    download(url, fileName, toDir, onProgress) {
      return new Promise((resolve, reject) => {
        // 권한 체크
        if (!window.cordova.file.externalRootDirectory) return resolve()
        let diagnostic = window.cordova.plugins.diagnostic
        diagnostic.requestExternalStorageAuthorization(function(status) {
          diagnostic.permissionStatus.GRANTED === status
            ? resolve()
            : reject(new Error('permission denied'))
        }, reject)
      })
        .then(function() {
          // 파일명 확보
          if (fileName) return fileName
          let deferred = new Deferred()
          let req = new window.XMLHttpRequest()
          req.open('GET', url, true)
          req.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
          req.onreadystatechange = function() {
            if (this.readyState >= this.HEADERS_RECEIVED) {
              let contentDisposition = req.getResponseHeader('Content-Disposition')
              let match = (contentDisposition && contentDisposition.match(/filename="(.+)"/)) || []
              deferred.resolve(
                match[1] ||
                  url
                    .split('/')
                    .pop()
                    .split('#')
                    .shift()
                    .split('?')
                    .shift()
              )
              req.abort()
            }
          }
          req.send()
          return deferred.promise
        })
        .then(fileName => {
          // 파일 다운로드 및 저장
          let file = window.cordova.file
          if (!toDir) {
            switch (window.device.platform) {
              case 'Android':
                toDir = 'file:///storage/emulated/0/Download/'
                break
              case 'iOS':
                toDir = file.documentsDirectory
                break
            }
            // toDir = (file.externalRootDirectory || file.dataDirectory + '/') + 'Download/'
          }
          let fileTransfer = new window.FileTransfer()

          let deferred = new Deferred()
          fileTransfer.download(
            encodeURI(url),
            toDir + fileName,
            deferred.resolve,
            deferred.reject,
            false,
            {
              headers: {
                'X-Requested-With': 'XMLHttpRequest'
              }
            }
          )
          fileTransfer.onprogress = function(progressEvent) {
            if (onProgress) onProgress(progressEvent)
          }
          return deferred.promise
        })
    },
    downloadWithNoti(url, fileName, mimeType, toDir) {
      // 다운 실패시 reject(e), 열기 실패시 resolve(false), 문제 없을시 resolve(file)
      let notification = new Notification()
      let file
      return notification
        .prepare()
        .then(() => {
          notification.open({
            title: '파일 다운로드 중.. 0%',
            text: fileName,
            sticky: true,
            progressBar: {
              value: 0
            }
          })
          return this.download(
            // 다운로드 시도
            url,
            fileName,
            toDir,
            _.throttle(progressEvent => {
              let { total, loaded } = progressEvent
              let value = total ? Math.floor((loaded / total) * 100) : 0
              notification.update({
                title: `파일 다운로드 중.. ${value}%`,
                progressBar: {
                  value
                }
              })
            }, 500)
          ).catch(e => {
            // 다운로드 실패. 리젝트
            console.log(e)
            notification.update({
              title: '파일 다운로드 실패',
              text: fileName,
              progressBar: false,
              sticky: false
            })
            return Promise.reject(e)
          })
        })
        .then(r => {
          // 다운로드 성공. 500ms 대기
          file = r
          return new Promise(resolve => setTimeout(resolve, 500)) // progress update랑 겹침 방어 500ms
        })
        .then(() =>
          notification.update({
            // 노티 표시
            title: '파일 다운로드 완료',
            text: fileName,
            sticky: false,
            progressBar: false
          })
        )
        .then(r => {
          if (!mimeType) {
            mimeType = mime.lookup(fileName)
          }
          // 노티가 누르지 않고 지워졌을때 true, 눌러졌을때 파일 열기 시도
          return (
            !r ||
            this.open(decodeURIComponent(file.nativeURL), mimeType).then(
              () => true,
              e => console.error(e) || false
            )
          )
        })
        .then(ret => ret && file) // 누르지 않고 지워진경우나 파일 열기 성공시 파일 리턴
    }
  }
}
