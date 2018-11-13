import moment from 'moment'
import _ from 'lodash'
import req2svr from './req2svr'
import requestWork from '~/myHR/requestWork/requestWork'
import requestOvertime from '~/myHR/requestOvertime/requestOvertime'
import calendar from '~/common/calendar/calendar'
import requestList from '~/myHR/requestList/requestList'
import popup from '~/util/popup'
import alert from '~/popup/alert/alert'
import { resolve } from 'path'

moment.locale('ko')
let el = null
let elCurrentX = 0

let dx = 0 // 기존 x 값
let del = null // 기존 엘리먼트
let curx = 0
const containerPtO = 255

var container = null
var hedaerHeight = 0
let pScrollTop = 0
export default {
  name: 'vCelender',
  inject: ['popup'],
  provide: {
    req2svr
  },
  data() {
    return {
      calop: false,
      containerPt: containerPtO,
      showSlide: null,
      calendarList: [],
      showMonth: 0,
      curMonth: 0,
      calList: [],
      months: [],
      weekDays: [],
      clist: {},
      list: [],
      alldataList: {},
      selectedValue: new Date(),
      DEFAULT_STA_HMS: '09:00',
      DEFAULT_END_HMS: '18:00',
      pDate: moment().toDate(),
      today: moment().format('YYYYMMDD'),
      selectedYMD: null,
      isFirstScroll: true, // 화면 진입시 오늘날짜로 이동할때 스크롤 이벤트 제외
      overTimeAppList: [],
      workHoliAppList: []
    }
  },
  computed: {
    req2svr: () => req2svr,
    noResult() {
      return this.clist.length <= 0
    }
  },
  mounted() {},
  afterEnter() {
    setTimeout(() => {
      // 시작 시 오늘 날짜로 스크롤 이동
      setTimeout(() => {
        container = this.$el.querySelector('.scroll_cont')
        container.scrollTop = (moment().format('D') - 1) * 77
      }, 500)
      setTimeout(() => {
        this.isFirstScroll = false
      }, 1000)

      hedaerHeight = this.$refs.calHeader.clientHeight
      // 업무 기준 시간 가져옴
      this.req2svr
        .getTamShiftInfo({
          APPL_CD: '100003',
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          DATE_CHK: ''
        })
        .then(r => {
          if (r && r.result) {
            this.DEFAULT_STA_HMS = r.result.STA_HMS
            this.DEFAULT_END_HMS = r.result.END_HMS
          }
        })
      this.$refs.calendar.init()
    }, 0)
  },

  methods: {
    filterList(ev) {
      // console.log(ev)
      if (ev) {
        this.selectedYMD = null
        this.$store.state.selectedDate = null
        this.$refs.calendar.$forceUpdate()
      }
      $('.open_cell')
        .addClass('close_cell')
        .clearQueue()
        .stop()
        .removeClass('open_cell')
      let cm = moment().month()
      if (this.$refs.calendar && this.$refs.calendar.calFirstDate) {
        cm = moment(this.$refs.calendar.calFirstDate).month()
      }

      this.alldataList = _.filter(this.clist.resultList, o => {
        let rm = moment(o.YMD).month()
        if (this.calop) rm = cm
        // console.log(rm, cm)
        // if (this.selectedYMD) return o.YMD === this.selectedYMD
        if (!ev || ev.target.value === '') return rm === cm
        else if (ev.target.value === 'Hol') {
          return (
            rm === cm &&
            o.TAM_NM !== null &&
            o.TAM_NM !== '휴일' &&
            o.OVERWORK_STAT !== true &&
            o.TAM_NM !== '정상'
          )
        } else if (ev.target.value === 'Vac') {
          return rm === cm && o.TAM_NM !== null && o.TAM_NM === '휴가'
        } else if (ev.target.value === 'Ove') {
          return rm === cm && o.OVERWORK_STAT === true
        } else if (ev.target.value === 'Reg') {
          return rm === cm && o.TAM_NM !== null && o.TAM_NM === '정상'
        }
      })
      this.$refs.calendar.$forceUpdate()
      // console.log(this.alldataList)
    },
    calcWorkType(item) {
      // console.log(item)
      let sd = moment(item.OVT_STA_YMD).set('hour', parseInt(item.OVT_STA_HH, 10))
      let ed = moment(item.OVT_END_YMD).set('hour', parseInt(item.OVT_END_HH, 10))
      // console.log(sd) // ed.diff(sd, 'days'))
      let result = '연장근무'
      if (item.TAM_NM !== '휴일') {
        if (ed.diff(sd, 'days') > 0 || parseInt(item.OVT_END_HMS, 10) > 22) {
          result = '야간근무'
        }
      } else {
        result = '휴일정상'
        if (ed.diff(sd, 'days') > 0 || parseInt(item.OVT_END_HMS, 10) > 22) {
          result = '휴일야간'
        } else if (parseInt(item.OVT_END_HMS, 10) <= 22) {
          result = '휴일연장'
        }
      }
      return result
    },
    getMonthData(date) {
      // console.log('====getMonthData', date)
      return this.req2svr
        .getEmpWorkHoliTamDay({
          PERSON_ID: this.$store.state.PERSON_ID,
          EMP_NO: this.$store.state.EMP_NO,
          YYYYMM: moment(date).format('YYYYMM'),
          YYYY: moment(date).format('YYYY'),
          MM: moment(date).format('MM'),
          CNT: ''
        })
        .then(r => {
          this.clist.resultList = _.map(this.clist.resultList, obj => {
            return _.assign(
              obj,
              _.find(r.resultList, {
                YMD: obj.YMD
              })
            )
          })

          _.forEach(this.clist.resultList, (vs, ix) => {
            var dd = moment(String(vs.YMD)).format('DD')
            this.clist.resultList[ix].dateNum = dd
            this.clist.resultList[ix].dayOfWeek = moment(String(vs.YMD)).format('dddd')
          })
          this.filterList()
        })
    },
    getMonthDataAfter() {
      Promise.all([this.getWorkHoliAppList(), this.getOverTimeAppList()]).then(() => {})
    },
    getWorkHoliAppList() {
      // 근태 신청 목록
      return this.req2svr
        .getWorkHoliAppList({
          SEARCH_APPL_CD: '100004',
          I_SRCH_AUTH: '40',
          SEARCH_PERSON_ID: this.$store.state.PERSON_ID,
          SEARCH_EMP_NO: this.$store.state.EMP_NO,
          SEARCH_EMP_NM: this.$store.state.EMP_NM,
          SEARCH_STA_DATE: moment(this.pDate)
            .add(-1, 'month')
            .startOf('month')
            .format('YYYY-MM-DD'),
          SEARCH_END_DATE: moment(this.pDate)
            .add(1, 'month')
            .endOf('month')
            .format('YYYY-MM-DD'),
          SEARCH_APPL_STAT: '',
          pageIndex: Math.ceil(this.workHoliAppList.length / 10 + 1)
        })
        .then(r => {
          if (r.data && r.data.length > 0) {
            this.workHoliAppList = _.concat(r.data, this.workHoliAppList)
            // console.log('=====>', r)
            _.forEach(r.data, (v, i) => {
              if (['200', '300', '100', '250', '350'].some(e => e === v.APPL_STAT)) {
                // should get each list of work through re-communication
                this.req2svr
                  .reqWorkHoliApp({
                    EDIT_FLAG: 'N',
                    REQ_NO: v.REQ_NO
                  })
                  .then(rx => {
                    // console.log(rx)
                    _.forEach(rx.resultInfoList, (vss, ixx) => {
                      vss.APPL_STAT = v.APPL_STAT
                      vss.dateNum = moment(String(vss.YMD)).format('DD')
                      vss.dayOfWeek = moment(String(vss.YMD)).format('dddd')
                    })
                    this.clist.resultList = _.map(this.clist.resultList, obj => {
                      return _.assign(
                        obj,
                        _.find(rx.resultInfoList, {
                          YMD: obj.YMD
                        })
                      )
                    })
                  })
              }
            })
            if (r.data.length >= 10) {
              // 재귀호출
              this.getWorkHoliAppList()
            } else {
              this.filterList()
            }
          }
        })
    },
    getOverTimeAppList() {
      // add processing list to list of month  초과근무 리스트
      return this.req2svr
        .getOverTimeAppList({
          EXCEL_FILE_NAME: '',
          EXCEL_TITLE: '',
          EXCEL_HEADER: '',
          SEARCH_APPL_CD: '100003',
          I_SRCH_AUTH: '40',
          SEARCH_PERSON_ID: this.$store.state.PERSON_ID,
          SEARCH_EMP_NO: this.$store.state.EMP_NO,
          SEARCH_EMP_NM: this.$store.state.EMP_NM,
          SEARCH_STA_DATE: moment(this.pDate)
            .add(-1, 'month')
            .startOf('month')
            .format('YYYY-MM-DD'),
          SEARCH_END_DATE: moment(this.pDate)
            .add(1, 'month')
            .endOf('month')
            .format('YYYY-MM-DD'),
          SEARCH_APPL_STAT: '',
          pageIndex: Math.ceil(this.overTimeAppList.length / 10 + 1)
        })
        .then(r => {
          if (r.data && r.data.length > 0) {
            this.overTimeAppList = _.concat(r.data, this.overTimeAppList)

            _.forEach(r.data, (v, i) => {
              _.forEach(this.clist.resultList, (vs, ix) => {
                if (v.APPL_STAT !== '990' && v.STA_YMD.replace(/\-/g, '') === vs.YMD) {
                  this.clist.resultList[ix].dateNum = moment(
                    String(this.clist.resultList[ix].YMD)
                  ).format('DD')
                  this.clist.resultList[ix].dayOfWeek = moment(
                    String(this.clist.resultList[ix].YMD)
                  ).format('dddd')
                  this.clist.resultList[ix].OVERWORK_STAT = true
                  this.clist.resultList[ix].OVT_APPL_STAT = v.APPL_STAT
                  this.clist.resultList[ix].OVT_STA_HMS = v.STA_HMS
                  this.clist.resultList[ix].OVT_END_HMS = v.END_HMS
                  this.clist.resultList[ix].OVT_STA_YMD = v.STA_YMD
                  this.clist.resultList[ix].OVT_END_YMD = v.END_YMD
                }
              })
            })
            if (r.data.length >= 10) {
              // 재귀호출
              this.getOverTimeAppList()
            } else {
              this.filterList()
            }
          }
        })
    },
    restoreCell(e) {
      $('.open_cell')
        .addClass('close_cell')
        .clearQueue()
        .stop()
        .removeClass('open_cell')
      $('.swipe_cell').css({
        transform: 'translate3d(0,0,0)'
      })
    },
    cellEnd(e) {
      del = el
      // console.log(dx, curx)
      if (dx >= -83 || curx >= -83) {
        this.restoreCell()
        // console.log('call restoreCell')
      }
    },
    cellMove(e) {
      if (
        e.target !== null &&
        e.target.style !== null &&
        e.target.className !== 'cell_swipe_holder'
      ) {
        return true
      }

      var q = e.target.offsetParent.style.transform.split(',')[0]
      dx = parseInt(q.substr(12, 6), 10)

      if (elCurrentX !== parseInt(elCurrentX, 10)) elCurrentX = 0
      curx = elCurrentX + e.deltaX

      // console.log(curx)
      if (dx <= -162 && curx <= -162) curx = -164
      if (curx <= -84) {
        $(e.target.offsetParent).addClass('open_cell')
      }
      $(el).css({
        transform: 'translate3d(' + curx + 'px, 0px,' + '0)'
      })
      dx = curx
      el = e.target.offsetParent
    },
    cellStart(e) {
      if (
        e.target !== null &&
        e.target.style !== null &&
        e.target.className !== 'cell_swipe_holder'
      ) {
        return true
      }

      el = e.target.offsetParent
      if (el !== del) {
        dx = 0
        curx = 0
      }
      var q = e.target.offsetParent.style.transform.split(',')[0]
      elCurrentX = parseInt(q.substr(12, 6), 10)

      if (elCurrentX !== parseInt(elCurrentX, 10)) elCurrentX = 0
      // console.log(elCurrentX)
      $('.open_cell')
        .not($(e.target.offsetParent))
        .addClass('close_cell')
        .clearQueue()
        .stop()
        .removeClass('open_cell')
      $('.swipe_cell')
        .not($(e.target.offsetParent))
        .css({
          transform: 'translate3d(0,0,0)'
        })
      $(e.target.offsetParent).removeClass('close_cell')
    },
    requestWork(item) {
      if (item.TAM_NM !== null && item.TAM_NM !== '휴일') {
        return popup.open(alert, {
          msg: '근태신청이 마감되었거나, 이미 등록되어있습니다.'
        })
      }

      // console.log(item)
      this.popup.open(
        requestWork,
        {
          parentItem: item
        },
        this
      )
    },
    requestOvertime(item) {
      console.log(item)
      this.popup.open(
        requestOvertime,
        {
          parentItem: item
        },
        this
      )
    },
    openRequestList() {
      this.popup.open(requestList, {}, this)
    },
    onSelectDate(d) {
      // 클릭 시 해당 날짜 데이터 가져옴
      // console.log(this.$el.querySelector('filterRadio1'))
      this.$el.querySelector('input[name=filterRadio]').checked = false
      this.selectedYMD = moment(String(d)).format('YYYYMMDD')
      // console.log(this.selectedYMD)
      this.restoreCell()
      this.alldataList = _.filter(this.clist.resultList, o => {
        return o.YMD === this.selectedYMD
      })

      // this.$el.querySelector('')
    },
    onMonthChange($event) {
      setTimeout(() => {
        this.overTimeAppList = []
        this.workHoliAppList = []
        this.$el.querySelector('#filterRadio1').checked = true
        this.pDate = this.$refs.calendar.calFirstDate

        // console.log('--------onMonthChange', this.pDate)
        let { firstDate, days } = $event
        // console.log(days)
        this.clist.resultList = days
        this.getMonthData(this.pDate).then(r => {
          var a = _.filter(this.clist.resultList, o => {
            return _.find(days, {
              YMD: o.YMD
            })
          })
          a = _.chunk(a, 7)
          // console.log(a)
          this.$refs.calendar.calObj = a
          this.getMonthData(
            moment(this.pDate)
              .add(1, 'month')
              .toDate()
          ).then(rr => {
            this.getMonthData(
              moment(this.pDate)
                .add(-1, 'month')
                .toDate()
            )
          })
          this.getMonthDataAfter()
        })
        // this.$forceUpdate()
      }, 0)
    },
    getDayClass(date) {
      return this.dayClass[new Date(date).getDay()]
    },
    onPanup() {
      this.restoreCell()
      this.calop = true
    },
    onPanDown() {
      this.restoreCell()
    },
    onScrollStart() {
      this.isFirstScroll = false
    },
    onCellCloseSwipe(e) {
      this.restoreCell(e)
    },
    onSwipeDown(e) {
      if (this.calop === false) return true
      this.calop = false
      this.$nextTick(() => {
        this.$refs.calendar.restoreMonCal()
        // console.log(this.$refs.calendar.calFirstDate.getMonth(),  moment().month())
        if (this.$refs.calendar.calFirstDate.getMonth() === moment().month()) {
          this.$refs.calendar.calFristWeek =
            moment().week() -
            moment()
              .startOf('month')
              .week() +
            1
        }
      })
    },
    onSwipeLeft(e) {
      // console.log('onSwipeLeft', e)
      // this.$refs.calendar.nextMonth()
      this.onNextCal()
    },
    onSwipeRight(e) {
      // console.log('onSwipeRight', e)
      // this.$refs.calendar.previousMonth()
      this.onPreviousCal()
    },
    delaytedOpenRequestList() {
      this.delaytedOpenRequestList = true
    },
    onPreviousCal() {
      if (!this.calop) this.$refs.calendar.previousMonth()
      else this.$refs.calendar.previousWeek()
      container.scrollTop = 0
      this.$refs.calendar.calFristWeek = 1
      if (!this.calop && this.$refs.calendar.calFirstDate.getMonth() === moment().month()) {
        this.$refs.calendar.calFristWeek =
          moment().week() -
          moment()
            .startOf('month')
            .week() +
          1
      }
    },
    onNextCal() {
      if (!this.calop) this.$refs.calendar.nextMonth()
      else this.$refs.calendar.nextWeek()
      container.scrollTop = 0
      this.$refs.calendar.calFristWeek = 1
      if (!this.calop && this.$refs.calendar.calFirstDate.getMonth() === moment().month()) {
        this.$refs.calendar.calFristWeek =
          moment().week() -
          moment()
            .startOf('month')
            .week() +
          1
      }
    }
  },
  components: {
    calendar
  },
  templateSrc: './vCalender.html'
}
