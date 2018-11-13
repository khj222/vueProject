import req2svr from './req2svr'
import requestList from '~/myHR/requestList/requestList'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'

export default {
  name: 'changeAccount',
  inject: ['popup'],
  props: ['parentItem'],
  provide: {
    req2svr
  },
  computed: {
    req2svr: () => req2svr,
    noResult() {
      return this.list.length <= 0
    }
  },
  data() {
    return {
      isScroll: false,
      list: [],
      dataList: {},
      totDAmount: 0,
      bankInfo: {},
      BANK_CD: '',
      fileName: '',
      fileSize: 0,
      FILE_NO: null,
      ACC_NO: '',
      popupTarget: this.$parent,
      openConfirm: true,
      PCM_BANK_LIST: []
    }
  },
  afterEnter() {
    setTimeout(() => {
      // 은행 목록 가져오기
      this.req2svr.getCommonCodeIdxDtlList({ CD_IDX: 'PCM_BANK', pageIndex: 1 }).then(r => {
        this.PCM_BANK_LIST = r
      })
      // 현재 등록된 계좌정보 가져오기
      this.req2svr
        .getPayAcntChgInfo({
          APPL_CD: '',
          FILE_NO: '',
          APPR_SEQ: '1',
          APPR_EMP_NO: '',
          APPR_CLS: '',
          REQ_EMP_NO: '',
          OLDBANK_CD: '',
          OLDACC_NO: '',
          BANK_CD: '',
          ACC_NO: ''
        })
        .then(r => {
          // console.log(r)
          this.bankInfo = r.result
        })
    }, 0)
  },
  beforeTransitionLeave() {},
  methods: {
    clearFile() {
      this.$refs.addFile.value = null
      this.fileName = ''
      this.fileSize = 0
      this.FILE_NO = null
    },
    putFile($event) {
      let file = $event.target.files[0]
      if (!file) return false
      this.fileName = file.name
      this.fileSize = Math.ceil(file.size / 1024)
      let data = new window.FormData()
      data.append('file', file)
      this.req2svr.uploadAppFiles(data).then(r => {
        if (r.success) this.FILE_NO = r.result.attachFileNo
      })
    },
    openRequestList() {
      if (this.popupTarget === this.$parent && this.openConfirm === true) {
        var msg = "작성 중인 내용이 삭제됩니다.\n'신청함' 으로 이동하시겠습니까?"
        this.popup
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
              this.popup.open(requestList, {}, this.popupTarget, {
                beforeAnchor: true
              })
              setTimeout(() => {
                this.$emit('closePop', true)
              }, 800)
            }
          })
      } else if (this.popupTarget === this.$parent) {
        this.popup.open(requestList, {}, this.popupTarget, {
          beforeAnchor: true
        })
        setTimeout(() => {
          this.$emit('closePop', true)
        }, 800)
      } else {
        this.popup.open(requestList, {}, this.popupTarget)
      }
    },
    filteredPayList(list, type) {
      return _.filter(list, function(o) {
        return o.ITEM_CLS === type // P:지급, D:공제
      })
    },
    restorePaybox: function() {
      this.isScroll = false
    },
    applyChangeAccount() {
      let msg
      let isValid = true
      if (isValid && this.BANK_CD.length < 1) {
        msg = '은행 구분을 선택해 주세요.'
        isValid = false
      }
      if (isValid && this.ACC_NO.length < 1) {
        msg = '계좌번호를 입력해 주세요.'
        isValid = false
      }
      if (isValid && !this.FILE_NO) {
        msg = '통장 사본 파일을 첨부해 주세요.'
        isValid = false
      }
      if (!isValid) {
        return popup.open(alert, {
          msg,
          btnList: [
            {
              text: '확인',
              value: true
            }
          ]
        })
      }
      this.req2svr
        .insertPayAcntChg({
          APPL_CD: '100002',
          FILE_NO: this.FILE_NO,
          APPR_SEQ: '1',
          APPR_EMP_NO: '1102485',
          APPR_CLS: 'F',
          REQ_EMP_NO: this.$store.state.EMP_NO,
          OLDBANK_CD: this.bankInfo.EMP_BANK_CD,
          OLDACC_NO: this.bankInfo.EMP_ACC_NO,
          BANK_CD: this.BANK_CD,
          ACC_NO: this.ACC_NO
        })
        .then(r => {
          let msg = r.result
          return popup
            .open(alert, {
              msg,
              btnList: [
                {
                  text: '이전화면',
                  value: false
                },
                {
                  text: '신청함',
                  value: true
                }
              ]
            })
            .then(r => {
              if (r.btn.value) {
                this.openConfirm = false
                this.openRequestList()
              } else {
                this.$emit('closePop', true)
              }
            })
        })
    }
  },
  templateSrc: './changeAccount.html'
}
