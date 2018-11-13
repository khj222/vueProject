import req2svr from './req2svr'
import moment from 'moment'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'
import listPopup from '~/popup/list/list'
import requestList from '~/myHR/requestList/requestList'

export default {
  name: 'requestOvertime',
  props: ['parentItem', 'mainBus'],
  inject: ['popup'],
  data() {
    return {
      item: {},
      filter: {
        beginDate: null,
        endDate: null,
        keyword: ''
      },
      STA_YMD: moment().format('YYYY-MM-DD'),
      END_YMD: moment().format('YYYY-MM-DD'),
      STA_HH: '00',
      STA_MM: '00',
      END_HH: '00',
      END_MM: '00',
      REASON: '',
      EXPT_HMS: '0',
      popupTarget: this.$parent,
      FORMATED_YMD: moment().format('YYYY.MM.DD'),
      openConfirm: true,
      chekedDayName: null,
      today: moment(),
      pl_list_j: [],
      APPR_EMP1: { EMP_NM: '', EMP_NO: '' },
      APPR_EMP2: { EMP_NM: '', EMP_NO: '' },
      overtimeDate: {},
      TAM_NM: null,
      TAM_SHIFT_STA_HMS: '09:00',
      TAM_SHIFT_END_HMS: '18:00',
      noti: [],
      directAppr: 'N',
      times: [],
      STA_TIME: '00:00',
      END_TIME: '00:00',
      minMinutes: 60,
      barWidth: '0%'
    }
  },
  afterEnter() {
    setTimeout(() => {
      if (!this.parentItem || !this.parentItem.YMD) {
        this.popupTarget = this
      } else {
        this.FORMATED_YMD = moment(this.parentItem.YMD).format('YYYY.MM.DD')
        this.STA_YMD = moment(this.parentItem.YMD).format('YYYY-MM-DD')
        this.END_YMD = moment(this.parentItem.YMD).format('YYYY-MM-DD')
      }
      this.req2svr
        .getTamShiftInfo({
          APPL_CD: '100003',
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          DATE_CHK: ''
        })
        .then(r => {
          if (r && r.result) {
            this.TAM_SHIFT_STA_HMS = r.result.STA_HMS
            this.TAM_SHIFT_END_HMS = r.result.END_HMS
          }
        })
      this.req2svr
        .reqOverTimeApp({
          REQ_NO: '',
          EDIT_FLAG: 'Y',
          OVER_TIME_PAGE: 'Y'
        })
        .then(r => {
          if (r) {
            this.overtimeDate = r
            if (this.overtimeDate.req_hms_cnt > 12) {
              this.overtimeDate.req_hms_cnt = 12
            }

            this.barWidth = (this.overtimeDate.req_hms_cnt / 12) * 100 + '%'

            this.pl_list_j = r.pl_list_j
            this.APPR_EMP2 = _.assign(this.APPR_EMP2, r.pl2)
            this.noti = r.noti
            if (r.directAppr === 'Y') {
              this.directAppr = 'Y'
            }
            this.minMinutes = r.minMinutes
            // var quarterHours = ['00', '30']
            for (var i = 0; i < 24; i++) {
              for (var j = 0; j < r.intervals.length; j++) {
                this.times.push(('0' + i).slice(-2) + ':' + r.intervals[j])
              }
            }

            this.openApprSelectPopup()
          }
        })
      this.checkHoliDay()
    }, 0)
  },

  computed: {
    getThisYear() {
      return this.today.format('YYYY')
    },
    getThisWeek() {
      return this.today.week()
    },
    req2svr: () => req2svr,
    calcWorkType() {
      let sd = moment(this.STA_YMD) // .set('hour', this.STA_HH)
      let ed = moment(this.END_YMD) // .set('hour', this.END_HH)
      // console.log(ed.diff(sd, 'days'))
      let result = '연장근무'
      if (this.chekedDayName !== '휴일') {
        if (ed.diff(sd, 'days') > 0 || parseInt(this.END_HH, 10) > 22) {
          result = '야간근무'
        }
      } else {
        result = '휴일정상'
        if (ed.diff(sd, 'days') > 0 || parseInt(this.END_HH, 10) > 22) {
          result = '휴일야간'
        } else if (parseInt(this.END_HH, 10) <= 22) {
          result = '휴일연장'
        }
      }
      return result
    }
  },
  methods: {
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
    focusScroll(ev) {
      let scrollCont = this.$el.querySelector('.scroll_cont')
      if (scrollCont.scrollTop !== ev.target.offsetParent.offsetTop) {
        setTimeout(() => {
          scrollCont.scrollTop = ev.target.offsetParent.offsetTop
        }, 500)
      }
    },
    // 시작일 변경시 종료일이 시작일보다 이전일 경우 동일하게 변경
    checkDateHoliDay(ev) {
      let sd = moment(this.STA_YMD)
      let ed = moment(this.END_YMD)
      this.req2svr
        .getTamShiftInfo({
          APPL_CD: '100003',
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          DATE_CHK: sd.format('YYYYMMDD'),
          TAM_SHIFT_STA_YMD: sd.format('YYYY-MM-DD')
        })
        .then(r => {
          if (r && r.result) {
            this.TAM_SHIFT_STA_HMS = r.result.STA_HMS
            this.TAM_SHIFT_END_HMS = r.result.END_HMS
          }
        })

      if (ed.diff(sd, 'days') < 0) {
        this.END_YMD = this.STA_YMD
      }
      this.req2svr
        .getEmpWorkHoliTamDay({
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          YYYYMM: this.today.format('YYYYMM'),
          YYYY: this.today.format('YYYY'),
          MM: this.today.format('M'),
          CNT: ''
        })
        .then(r => {
          let temp = _.find(r.resultList, o => {
            return o.YMD === sd.format('YYYYMMDD')
          })
          this.TAM_NM = temp.TAM_NM
        })
      this.checkHoliDay(ev)
    },
    // 휴일여부 판단 함수
    checkHoliDay(ev) {
      // console.log(ev.target.value)
      var dd = moment(this.STA_YMD)
      if (ev) dd = moment(ev.target.value)
      dd = dd.format('YYYYMMDD')
      return this.req2svr
        .getWorkHoliDayView({
          APPL_CD: '100003',
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          DATE_CHK: dd
        })
        .then(r => {
          // 시작일과 종료일의 평일/휴일 유무를 판단하는데, 이미 휴일이 들어 있다면 덮어씌울 필요가 없다.
          if (r.status === 'ok' && this.chekedDayName !== '휴일') {
            this.chekedDayName = r.result
          }
        })
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
    applyOvertime() {
      this.STA_HH = this.STA_TIME.split(':')[0]
      this.STA_MM = this.STA_TIME.split(':')[1]

      this.END_HH = this.END_TIME.split(':')[0]
      this.END_MM = this.END_TIME.split(':')[1]

      let msg
      let isValid = true
      if (
        parseInt(moment(this.STA_YMD).format('YYYYMMDD') + this.STA_HH, 10) >
        parseInt(moment(this.END_YMD).format('YYYYMMDD') + this.END_HH, 10)
      ) {
        msg = '종료일자(시)은 시작일자(시) 보다 클수 없습니다.'
        isValid = false
      }

      // 날짜 비교해야함 ...
      var s = moment(this.STA_YMD)
        .set('hour', this.STA_HH)
        .set('minute', this.STA_MM)
      var e = moment(this.END_YMD)
        .set('hour', this.END_HH)
        .set('minute', this.END_MM)

      // console.log(e.diff(s, 'hours'))
      var chkHH = e.diff(s, 'hours')
      var chkMM = e.diff(s, 'minutes')
      if (isValid && chkMM < this.minMinutes) {
        msg = '초과근무신청 근무시간을 확인하세요.'
        isValid = false
      }

      if (isValid && chkHH >= 24) {
        msg = '초과근무신청 근무시간은 24시간 미만입니다.'
        isValid = false
      }
      if (isValid && this.REASON.length < 1) {
        msg = '초과 근무 사유를 입력하세요.'
        isValid = false
      }
      if (!isValid) {
        return popup.open(alert, {
          msg
        })
      }

      let sendingDate = {
        APPL_CD: '100003',
        WORK_CD: '10',
        APPR_EMP_NO1: this.APPR_EMP1.EMP_NO,
        APPR_EMP_NO2: this.APPR_EMP2.EMP_NO,
        APPR_EMP_NO3: '',
        APPR_CLS1: this.APPR_EMP1.EMP_NO !== '' ? 'P' : '',
        APPR_CLS2: this.APPR_EMP2.EMP_NO !== '' ? 'P' : '',
        APPR_CLS3: '',
        TRG_PERSON_ID: this.$store.state.PERSON_ID,
        TRG_EMP_NO: this.$store.state.EMP_NO,
        TRG_EMP_NM: this.$store.state.EMP_NM,
        TAM_SHIFT_STA_HMS: this.TAM_SHIFT_STA_HMS,
        TAM_SHIFT_END_HMS: this.TAM_SHIFT_END_HMS,
        STA_YMD: moment(this.STA_YMD).format('YYYY-MM-DD'),
        STA_HMS: this.STA_TIME.replace(':', ''),
        STA_HH: this.STA_HH,
        STA_MM: this.STA_MM,
        EXPT_HMS: this.EXPT_HMS + '',
        END_YMD: moment(this.END_YMD).format('YYYY-MM-DD'),
        END_HMS: this.END_TIME.replace(':', ''),
        END_HH: this.END_HH,
        END_MM: this.END_MM,
        REASON: this.REASON,
        TAM_NM: this.TAM_NM || null // STA_YMD의 TAM_NM
      }
      if (this.directAppr === 'Y' && this.APPR_EMP1.EMP_NM === '담당결재') {
        sendingDate.APPR_EMP_NO1 = sendingDate.APPR_EMP_NO2
        sendingDate.APPR_CLS1 = sendingDate.APPR_CLS2
        sendingDate.APPR_EMP_NO2 = ''
        sendingDate.APPR_CLS2 = ''
      }
      this.req2svr.execOverTimeAppChk(sendingDate).then(rx => {
        if (rx.result === 'OK') {
          this.req2svr.insertOverTimeApp(sendingDate).then(r => {
            msg = r.result
            if (r.status === 'ok') {
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
                  if (this.popupTarget === this.$parent && this.$parent.$refs.calendar) {
                    // 근태현황에서 넘어와서 초과근무 등록한 경우 되돌아가기전, 새로운 데이터 호출
                    this.$parent.$refs.calendar.restoreMonCal()
                  }
                  if (r.btn.value) {
                    this.openConfirm = false
                    this.openRequestList()
                  } else {
                    this.$emit('closePop', true)
                  }
                })
            } else {
              return popup.open(alert, {
                msg
              })
            }
          })
        } else {
          msg = rx.msg
          this.popup.open(alert, {
            msg
          })
        }
      })
    }
  },
  templateSrc: './requestOvertime.html'
}
