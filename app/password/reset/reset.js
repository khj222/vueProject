import req2svr from '../../req2svr'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'

export default {
  name: 'passwordReset',
  inject: ['popup'],

  data() {
    return {
      EMPNO: null,
      JUNINNUM: null
    }
  },
  afterEnter() {},
  beforeTransitionLeave() {},
  methods: {
    updatePasswordInit() {
      let msg
      let isValid = true
      if (isValid && (!this.EMPNO || this.EMPNO.length < 1)) {
        msg = '사번(아이디)를 입력해 주세요.'
        isValid = false
      }
      if (isValid && (!this.JUNINNUM || this.JUNINNUM.length < 1)) {
        msg = '주민번호 뒷자리를 입력해 주세요.'
        isValid = false
      }

      if (!isValid) {
        return popup.open(alert, {
          msg
        })
      }
      msg =
        '주민번호 뒷자리로 비밀번호\n초기화를 진행하시겠습니까?\n\n(e-HR에서도 동일하게 변경됩니다)'
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
              .updatePasswordInit({
                EMPNO: this.EMPNO,
                JUNINNUM: this.JUNINNUM
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
  templateSrc: './reset.html'
}
