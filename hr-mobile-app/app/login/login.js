// import http from '~/util/http'
import req2svr from '../req2svr'
// import CryptoJS from 'crypto-js'
import cordova from '~/util/cordova'
import alert from '~/popup/alert/alert'
import pwReset from '~/password/reset/reset'
import pwChange from '~/password/change/change'
import moment from 'moment'
// import pwReset from '~/passwordReset/passwordReset'
let timeObj
// console.log(http)
export default {
  name: 'login',
  props: [],
  inject: ['alert', 'push', 'popup'],
  provide: {
    req2svr
  },
  data() {
    return {
      userId: '',
      userPwd: '',
      idSave: false,
      autoLogin: false,
      invalidUserInfo: false,
      isDeviceAuth: false,
      auth_no: null,
      timer: moment().set({
        minute: 3,
        second: 0
      }),
      timerStr: '03:00',
      isRetrySMS: false,
      version: ''
    }
  },
  created() {
    if (window.cordova) {
      window.cordova.getAppVersion.getVersionNumber().then(v => {
        this.version = v
      })
    }
    let loginId = window.localStorage.getItem('login_id')
    if (loginId) {
      this.userId = loginId
      this.idSave = true
    }
  },
  mounted() {
    if (!this.$attrs.hasOwnProperty('slide')) {
      cordova.statusBar.backgroundColorByHexString('#ce3d53')
    }

    let autoLoginId = window.localStorage.getItem('auto_login_id')
    let autoPassword = window.localStorage.getItem('auto_password')
    if (autoLoginId && autoPassword) {
      this.autoLogin = true
      this.userId = autoLoginId
      this.userPwd = 'autoLoginPassword'
      this.login(autoPassword)
    }
  },
  computed: {
    req2svr: () => req2svr,
    getTimer() {
      return this.timer.format('mm:ss')
    },
    loginBtnValid() {
      return !!this.userId && !!this.userPwd
    },
    getUUID() {
      return window.device ? window.device.uuid : ''
    }
  },
  watch: {
    // timer() {
    //   this.setTimer()
    // }
  },
  methods: {
    showUpdatePopup(msg) {
      return this.popup
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
            var url = this.$store.getters.getVersionInfo.updateUrl
            window.cordova.InAppBrowser.open(url, '_system')
            this.showUpdatePopup(msg)
          } else {
            navigator.app.exitApp()
          }
        })
    },
    versionCheck() {
      // 현재 앱 버전 가져오기
      return this.$store.dispatch('versionCheck').then(r => {
        if (this.$store.getters.getVersionInfo.result !== 'OK') {
          this.$store.dispatch('user[logout]').then()
          var msg = this.$store.getters.getVersionInfo.result
          return this.showUpdatePopup(msg)
        }
      })
    },
    setTimer() {
      clearInterval(timeObj)
      this.timer = moment().set({
        minute: 3,
        second: 0
      })
      this.timerStr = this.timer.format('mm:ss')
      this.isRetrySMS = false
      timeObj = setInterval(() => {
        if (parseInt(this.timer.format('mm')) <= 0 && parseInt(this.timer.format('ss')) <= 1) {
          clearInterval(timeObj)
          this.isRetrySMS = true
          this.popup
            .open(alert, {
              msg: '인증 번호 입력 시간을\n초과 하였습니다.\n재요청 하시겠습니까?',
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
                this.setTimer()
              } else {
                this.isDeviceAuth = false
              }
            })
        }
        this.timer = this.timer.add(-1, 'seconds')
        this.timerStr = this.timer.format('mm:ss')
      }, 1000)
    },
    openPwReset() {
      this.popup.open(pwReset, {}, this, {
        beforeAnchor: true
      })
    },
    openPwChange() {
      this.popup.open(pwChange, {}, this, {
        beforeAnchor: true
      })
    },
    reqDeviceAuthSMS() {
      // if (!this.isRetrySMS) return false
      this.req2svr
        .reqDeviceAuthSMS({
          emp_no: this.userId
        })
        .then(r => {
          if (r.result !== 'OK') {
            console.log(r.result)
          }
        })
    },
    login(encPwd = null) {
      this.versionCheck().then(r => {
        if (this.$store.getters.getVersionInfo.result !== 'OK') {
          this.$store.dispatch('user[logout]').then()
          return false
        }
        this.invalidUserInfo = false
        encPwd = this.userPwd // encPwd || CryptoJS.SHA256(this.userPwd).toString(CryptoJS.enc.Base64)
        // this.$router.push({path: '/main'})
        // return true
        this.push
          .getRegistId()
          .catch(() => {})
          .then(res => {
            // console.log(res)
            let data = {
              id: this.userId,
              password: encPwd,
              uuid: window.device ? window.device.uuid : 'test', // '25639e6d37f9fea9',
              model: window.device ? window.device.model : '',
              push_token: res || ''
            }
            if (this.auth_no) data.auth_no = this.auth_no

            this.$store.dispatch('user[login]', data).then(
              res => {
                // console.log(res)
                // res = eval('(' + res + ')')
                if (!res) {
                  // 임시 로직
                  this.$store.dispatch('user[logout]').then()
                  return this.alert('임직원 메뉴는 준비중입니다.')
                }
                if (res.action === 'FAIL') {
                  this.$store.dispatch('user[logout]').then()
                  return this.popup.open(alert, {
                    msg: res.result
                  })
                }
                if (res.action === 'DEVICE_AUTH') {
                  this.$store.dispatch('user[logout]').then()

                  return this.popup
                    .open(alert, {
                      msg: res.result, // '등록되지 않은 단말 기기입니다.\n 010-****-1234 로\n인증 번호를 받으시겠습니까?',
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
                        this.isDeviceAuth = true
                        this.reqDeviceAuthSMS()
                        this.setTimer()
                      } else {
                        this.isDeviceAuth = false
                      }
                    })
                } else if (res.action === 'CHANGE_PASSWORD') {
                  return this.openPwChange()
                }
                if (this.idSave) {
                  window.localStorage.setItem('login_id', this.userId)
                } else window.localStorage.setItem('login_id', '')

                if (this.autoLogin) {
                  window.localStorage.setItem('auto_login_id', this.userId)
                  window.localStorage.setItem('auto_password', encPwd)
                } else {
                  window.localStorage.setItem('auto_login_id', '')
                  window.localStorage.setItem('auto_password', '')
                }
                this.$store.commit('ROLE[set]', res.ROLE)
                this.$store.commit('EMP_NO[set]', res.EMP_NO || this.userId)
                this.$store.commit('PERSON_ID[set]', res.PERSON_ID)
                this.$store.commit('ORG_CD[set]', res.ORG_CD)
                this.$store.commit('push_yn[set]', res.PUSH_YN)

                clearInterval(timeObj)
                if (this.$attrs.hasOwnProperty('slide')) this.$emit('success')
                else {
                  this.$router.push({
                    path: '/main'
                  })
                }
                this.$store.state.eventBus.$emit('updateSurveyList')
              },
              err => {
                this.invalidUserInfo = err.response && err.response.status === 400
                console.error(err)
              }
            )
          })
      })
    }
  },
  templateSrc: './login.html',
  styleSrc: './login.css'
}
