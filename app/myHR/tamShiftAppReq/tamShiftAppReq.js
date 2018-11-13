import req2svr from './req2svr'
import moment from 'moment'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'
import listPopup from '~/popup/list/list'
import requestList from '~/myHR/requestList/requestList'

export default {
  name: 'tamShiftAppReq',
  props: ['parentItem', 'mainBus'],
  inject: ['popup'],

  data() {
    return {
      list: [],
      dataList: [],
      appData: {},
      filter: {
        beginDate: null,
        endDate: null
      },
      TAM_CD: '',
      STA_YMD: moment().format('YYYY-MM-DD'),
      END_YMD: moment().format('YYYY-MM-DD'),
      leaveValue: false,
      popupTarget: this.$parent,
      FORMATED_YMD: moment().format('YYYY.MM.DD'),
      openConfirm: true,
      pl_list_j: [],
      APPR_EMP1: { EMP_NM: '', EMP_NO: '' },
      APPR_EMP2: { EMP_NM: '', EMP_NO: '' },
      TAM_CODE_LIST: [],
      noti: [],
      directAppr: 'N',
      selectedTam: {},
      REASON: '',
      totBalanceCnt: 0,
      spin: true,
      SEARCH_STA_DATE: moment()
        .startOf('day')
        .add(-1, 'month')
        .format('YYYY-MM-DD'),
      SEARCH_END_DATE: moment()
        .startOf('day')
        .format('YYYY-MM-DD'),
      remainingDaysAnnual: {},
      remainingDaysSpecial: {},
      SHIFT: {},
      REQ_REASON: ''
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.req2svr
        .tamShiftAppReqPop({
          EDIT_FLAG: 'Y',
          REQ_NO: ''
        })
        .then(r => {
          this.appData = r
          this.pl_list_j = r.pl_list_j
          this.APPR_EMP2 = _.assign(this.APPR_EMP2, r.pl2)
          this.noti = r.noti
          if (r.directAppr === 'Y') {
            this.directAppr = 'Y'
          }
          this.openApprSelectPopup()
        })
    }, 0)
  },
  beforePopup(done) {
    if (!this.parentItem || !this.parentItem.YMD) {
      this.popupTarget = this
    } else {
      this.FORMATED_YMD = moment(this.parentItem.YMD).format('YYYY.MM.DD')
      this.STA_YMD = moment(this.parentItem.YMD).format('YYYY-MM-DD')
      this.END_YMD = moment(this.parentItem.YMD).format('YYYY-MM-DD')
    }
    return done()
  },
  methods: {
    removeText(v) {
      return _.split(v, '변경전 : ')[1]
    },
    filterList(...args) {
      this.spin = true
      this.list = []
      this.dataList = []
      this.$el.querySelector('.scroll_cont').scrollTop = 0
      this.$nextTick(() => {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      })
    },
    focusScroll(ev) {
      let scrollCont = this.$el.querySelector('.scroll_cont')
      if (scrollCont.scrollTop !== ev.target.offsetParent.offsetTop) {
        setTimeout(() => {
          scrollCont.scrollTop = ev.target.offsetParent.offsetTop
        }, 500)
      }
    },
    // 결재자 1명 이상일시 첫화면에서 팝업
    openApprSelectPopup() {
      if (this.pl_list_j.length > 1) {
        if (this.directAppr === 'Y') {
          this.pl_list_j.unshift({ EMP_NM: '담당결재', EMP_NO: '' })
        }
        let selectList = this.pl_list_j

        this.popup
          .open(listPopup, {
            selectList
          })
          .then(r => {
            if (r.btn.value) {
              this.APPR_EMP1 = _.assign(this.APPR_EMP1, r.selectedItem)
            } else {
              this.$emit('closePop', true)
            }
          })
      } else {
        this.APPR_EMP1 = _.assign(this.APPR_EMP1, this.pl_list_j[0])
      }
    },
    openRequestList() {
      if (this.popupTarget === this.$parent && this.openConfirm === true) {
        // before submit form, if move to requestList when have a parent
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
              this.popupRequestList()
            }
          })
      } else if (this.popupTarget === this.$parent) {
        // after submit form, if move to requestList when have a parent
        this.popupRequestList()
      } else if (this.mainBus) {
        // if move to requestList from main
        this.popupTarget = this.$parent
        this.popupRequestList()
      }
    },
    popupRequestList() {
      this.popup.open(requestList, {}, this.popupTarget, {
        beforeAnchor: true
      })
      if (!this.mainBus) {
        setTimeout(() => {
          this.$emit('closePop', true)
        }, 800)
      }
    },
    requestApply() {
      let msg
      let isValid = true
      if (isValid && Object.keys(this.SHIFT).length === 0) {
        msg = '근무유형을 선택하세요.'
        isValid = false
      }
      if (isValid && this.STA_YMD === '') {
        msg = '시작일자를 선택하세요.'
        isValid = false
      }
      if (isValid && this.REQ_REASON.length < 1) {
        msg = '신청 사유를 입력하세요.'
        isValid = false
      }
      if (!isValid) {
        return popup.open(alert, {
          msg
        })
      }
      let sendingData = {
        APPL_CD: '100021',
        WORK_CD: '10',
        APPR_EMP_NO1: this.APPR_EMP1.EMP_NO || '',
        APPR_EMP_NO2: this.APPR_EMP2.EMP_NO || '',
        APPR_CLS1: this.APPR_EMP1.EMP_NO !== '' ? 'P' : '',
        APPR_CLS2: this.APPR_EMP2.EMP_NO !== '' ? 'P' : '',
        TRG_PERSON_ID: this.$store.state.PERSON_ID,
        TRG_EMP_NO: this.$store.state.EMP_NO,
        TRG_EMP_NM: this.appData.TRG_EMP_NM,
        CRT_YMD_HMS: this.appData.CRT_YMD_HMS,
        SHIFT: this.SHIFT.CD,
        BEF_SHIFT: this.appData.BEF_SHIFT,
        BEF_SHIFT_NM: this.appData.BEF_SHIFT_NM,
        STA_YMD: this.STA_YMD,
        REQ_REASON: this.REQ_REASON
      }

      this.req2svr.getApplStat(sendingData).then(r => {
        msg = null
        if (
          r.status === 'ok' &&
          (r.result === '990' || r.result === '900' || r.result === null || r.result === '')
        ) {
          this.req2svr.insertTamShiftApp(sendingData).then(rx => {
            msg = rx.result
            if (rx.status === 'ok') {
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
                .then(rxx => {
                  if (rxx.btn.value) {
                    this.openConfirm = false
                    this.openRequestList()
                  } else {
                    this.$emit('closePop', true)
                  }
                })
            } else {
              this.popup.open(alert, {
                msg
              })
            }
          })
        } else {
          if (r.result === '1000') {
            msg = '해당되는 시작일이 등록되어 있습니다.'
          } else {
            msg = '이미 신청하신 신청서가 결제중입니다.'
          }
          this.popup.open(alert, {
            msg
          })
        }
      })
    }
  },
  computed: {
    req2svr: () => req2svr
  },
  templateSrc: './tamShiftAppReq.html'
}
