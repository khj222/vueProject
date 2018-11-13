import req2svr from '../../req2svr'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'

export default {
  name: 'passwordChage',
  inject: ['popup'],

  data() {
    return {
      OLDPSWD: null,
      NEWPSWD: null,
      NEWPSWDCONF: null
    }
  },
  afterEnter() {},
  beforeTransitionLeave() {},
  methods: {
    updatePassword() {
      let msg
      let isValid = true
      if (isValid && (!this.OLDPSWD || this.OLDPSWD.length < 1)) {
        msg = '기존 비밀번호를 입력해 주세요.'
        isValid = false
      }
      if (isValid && (!this.NEWPSWD || this.NEWPSWD.length < 1)) {
        msg = '신규 비밀번호를 입력해 주세요.'
        isValid = false
      }
      if (isValid && (!this.NEWPSWDCONF || this.NEWPSWDCONF.length < 1)) {
        msg = '비밀번호 확인을 입력해 주세요.'
        isValid = false
      }
      if (!isValid) {
        return popup.open(alert, {
          msg
        })
      }
      msg = '비밀번호 변경을 진행하시겠습니까?\n\n(e-HR에서도 동일하게 변경됩니다)'
      return popup
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
            this.req2svr
              .updatePassword({
                OLDPSWD: this.OLDPSWD,
                NEWPSWD: this.NEWPSWD,
                NEWPSWDCONF: this.NEWPSWDCONF
              })
              .then(r => {
                var msg = r.result
                this.popup
                  .open(alert, {
                    msg
                  })
                  .then(rx => {
                    if (rx.btn.value) {
                      if (r.closeyn === 'Y') {
                        this.$emit('closePop', true)
                      }
                    }
                  })
              })
          }
        })
    }
  },
  computed: {
    req2svr: () => req2svr
  },
  templateSrc: './change.html'
}
