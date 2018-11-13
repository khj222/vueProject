import req2svr from './req2svr'
import moment from 'moment'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'
import listPopup from '~/popup/list/list'
import requestList from '~/myHR/requestList/requestList'

export default {
  name: 'requestWork',
  props: ['parentItem', 'mainBus'],
  inject: ['popup'],
  data() {
    return {
      item: {},
      filter: {
        beginDate: null,
        endDate: null
      },
      remainingDaysAnnual: {},
      remainingDaysSpecial: {},
      totBalanceCnt: 0,
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
      REASON: ''
    }
  },
  afterEnter() {
    setTimeout(() => {
      this.req2svr.getCommonCodeIdxDtlList({ CD_IDX: 'TAM_CODE', pageIndex: 1 }).then(r => {
        this.TAM_CODE_LIST = r
      })
      this.req2svr
        .reqWorkHoliApp({
          EDIT_FLAG: 'Y'
        })
        .then(r => {
          this.pl_list_j = r.pl_list_j
          this.APPR_EMP2 = _.assign(this.APPR_EMP2, r.pl2)
          this.noti = r.noti
          if (r.directAppr === 'Y') {
            this.directAppr = 'Y'
          }
          this.openApprSelectPopup()
        })
      this.req2svr
        .getRemainingDays({
          APPL_CD: '',
          YYYY: moment().format('YYYY'),
          APPR_EMP_NO1: '',
          APPR_EMP_NO2: '',
          APPR_EMP_NO3: '',
          APPR_CLS1: '',
          APPR_CLS2: '',
          APPR_CLS3: '',
          TRG_PERSON_ID: this.$store.state.PERSON_ID,
          TRG_EMP_NO: this.$store.state.EMP_NO,
          TRG_EMP_NM: this.$store.state.EMP_NM,
          TAM_CD: '',
          ACCM_BLN_DCNT: '',
          ACT_DCNT: '0',
          CRT_DCNT63: '0',
          USE_DCNT63: '0',
          BLN_DCNT63: '0',
          CRT_DCNT51: '0',
          USE_DCNT51: '0',
          BLN_DCNT51: '0'
        })
        .then(r => {
          if (r.result.length > 0) {
            _.forEach(r.result, o => {
              if (o.TAM_CD === '63') {
                // 연차
                this.remainingDaysAnnual = o
              } else if (o.TAM_CD === '51') {
                // 특휴
                this.remainingDaysSpecial = o
              }
              this.totBalanceCnt += parseInt(o.BLN_DCNT, 10)
            })
          }
          // console.log(r, r.result.length)
        })
    }, 0)
  },
  beforePopup(done) {
    // console.log(!this.parentItem === true)
    // console.log(this.parentItem.YMD)
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
    // 시작일 변경시 종료일이 시작일보다 이전일 경우 동일하게 변경
    checkDate() {
      let sd = moment(this.STA_YMD)
      let ed = moment(this.END_YMD)
      if (this.selectedTam.type === 'startOnly' || ed.diff(sd, 'days') < 0) {
        this.END_YMD = this.STA_YMD
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
    applyWork() {
      let msg
      let isValid = true
      this.TAM_CD = this.selectedTam.value
      if (isValid && (!this.TAM_CD || this.TAM_CD.length < 1)) {
        msg = '근태 구분을 선택하세요.'
        isValid = false
      }

      let Frm = []
      let FrmData = {
        APPL_CD: '100004',
        YYYY: moment(this.STA_YMD).format('YYYY'),
        APPR_EMP_NO1: this.APPR_EMP1.EMP_NO || '',
        APPR_EMP_NO2: this.APPR_EMP2.EMP_NO || '',
        APPR_EMP_NO3: '',
        APPR_CLS1: this.APPR_EMP1.EMP_NO !== '' ? 'P' : '',
        APPR_CLS2: this.APPR_EMP2.EMP_NO !== '' ? 'P' : '',
        APPR_CLS3: '',
        TRG_PERSON_ID: this.$store.state.PERSON_ID,
        TRG_EMP_NO: this.$store.state.EMP_NO,
        TRG_EMP_NM: this.$store.state.EMP_NM,
        TAM_CD: this.TAM_CD,
        ACCM_BLN_DCNT: '',
        ACT_DCNT: '0',
        CRT_DCNT63: this.remainingDaysAnnual.CRT_DCNT,
        USE_DCNT63: this.remainingDaysAnnual.USE_DCNT,
        BLN_DCNT63: this.remainingDaysAnnual.BLN_DCNT,
        CRT_DCNT51: this.remainingDaysSpecial.CRT_DCNT,
        USE_DCNT51: this.remainingDaysSpecial.USE_DCNT,
        BLN_DCNT51: this.remainingDaysSpecial.BLN_DCNT,
        REASON: this.REASON
      }
      if (this.directAppr === 'Y' && this.APPR_EMP1.EMP_NM === '담당결재') {
        FrmData.APPR_EMP_NO1 = FrmData.APPR_EMP_NO2
        FrmData.APPR_CLS1 = FrmData.APPR_CLS2
        FrmData.APPR_EMP_NO2 = ''
        FrmData.APPR_CLS2 = ''
      }
      Frm.push(FrmData)

      let staYmd = moment(this.STA_YMD)
      let endYmd = moment(this.END_YMD)
      let diffDays = endYmd.diff(staYmd, 'days')
      let List = []
      let startDay = staYmd

      let dayCheck = []
      // console.log(diffDays)
      for (let i = 0; i <= diffDays; i++) {
        let daysArr = {
          STA_YMD: startDay.format('YYYYMMDD'),
          END_YMD: startDay.format('YYYYMMDD'),
          WORK_TAM_CD: this.TAM_CD
        }
        dayCheck[i] = this.req2svr
          .getWorkHoliDayView({
            APPL_CD: '100003',
            PERSON_ID: this.$store.state.PERSON_ID,
            EMP_NO: this.$store.state.EMP_NO,
            DATE_CHK: startDay.format('YYYYMMDD')
          })
          .then(r => {
            if (
              r.status === 'ok' &&
              ((this.selectedTam.type === 'plainOnly' && r.result.DAY_NM === '평일') ||
                (this.selectedTam.type === 'holidayOnly' && r.result.DAY_NM === '휴일') ||
                (this.selectedTam.type !== 'plainOnly' && this.selectedTam.type !== 'holidayOnly'))
            ) {
              List.push(daysArr)
            }
          })
        startDay.add(1, 'days')
      }
      Promise.all(dayCheck).then(r => {
        // 근태구분에서 연차 선택했을경우 (연차 코드 = 63)
        if (
          this.selectedTam.value === '63' &&
          List.length > (this.remainingDaysAnnual.BLN_DCNT || 0)
        ) {
          msg = '연차 잔여 수가 부족합니다.'
          isValid = false
          // 근태구분에서 특휴 선택했을경우 (특휴 코드 = 51)
        } else if (
          this.selectedTam.value === '51' &&
          List.length > (this.remainingDaysSpecial.BLN_DCNT || 0)
        ) {
          msg = '특휴 잔여 수가 부족합니다.'
          isValid = false
        }
        let sendingData = {
          Frm: Frm,
          List: List
        }
        if (List.length === 0) {
          if (this.selectedTam.type === 'plainOnly') {
            msg = '휴일 신청은 불가합니다.'
            isValid = false
          } else if (this.selectedTam.type === 'holidayOnly') {
            msg = '평일 신청은 불가합니다.'
            isValid = false
          }
        } else if (diffDays > 0 && List.length !== diffDays + 1) {
          // 목록의 개수와 날짜의 차이 개수가 다를때...
          // 단 이때는 두가지 상황이 있음, 한 날짜만 선택했을땐

          if (this.selectedTam.type === 'plainOnly') {
            msg = `선택하신 기간 중 휴일을 제외한 ${List.length}일의 신청서가 제출됩니다.`
          } else if (this.selectedTam.type === 'holidayOnly') {
            msg = `선택하신 기간 중 평일을 제외한 ${List.length}일의 신청서가 제출됩니다.`
          }
          return popup
            .open(alert, {
              msg,
              btnList: [
                {
                  text: '아니오',
                  value: false
                },
                {
                  text: '네',
                  value: true
                }
              ]
            })
            .then(rxx => {
              if (rxx.btn.value) {
                this.requestApply(sendingData)
              }
            })
        }
        if (!isValid) {
          return popup.open(alert, {
            msg
          })
        }

        this.requestApply(sendingData)
      })
    },
    requestApply(sendingData) {
      let msg
      this.req2svr.execWorkHoliAppChk(sendingData).then(r => {
        msg = null
        if (r.result === 'OK') {
          this.req2svr.insertWorkHoliApp(sendingData).then(rx => {
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
                  if (this.popupTarget === this.$parent && this.$parent.$refs.calendar) {
                    // 근태현황에서 넘어와서 근태 등록한 경우 되돌아가기전, 데이터 갱신
                    this.$parent.$refs.calendar.restoreMonCal()
                  }
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
          msg = r.msg
          this.popup.open(alert, {
            msg
          })
        }
      })
    }
  },
  beforeTransitionLeave() {},
  computed: {
    req2svr: () => req2svr
  },
  templateSrc: './requestWork.html'
}
